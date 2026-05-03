import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import bwipjs from 'bwip-js';
import { environment } from 'environments/environment';
import { OutletDto } from 'app/core/outlets/outlets.types';
import { TenantInfoService } from 'app/core/auth/tenant-info.service';
import { BrandingProfilesService } from 'app/core/branding/branding.service';
import { BrandingProfileDto, PaperFormat } from 'app/core/branding/branding.types';
import { SaleDto } from './sales.types';

/**
 * Resolved render context used by the templates. Combines outlet identity
 * (always — that's "where the sale was rung up"), branding bits (logo /
 * color / tax id / header / footer text — resolved from the chain
 * sale-profile > outlet-default-profile > outlet fields > tenant fields),
 * and the paper format that picks the template.
 */
export interface ReceiptContext {
    format: PaperFormat;
    /** Outlet identity (always populated when an OutletDto was supplied). */
    name: string;
    addressLine?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    contactPhone?: string;
    contactEmail?: string;
    /** Resolved branding bits — final values applied at print time. */
    taxId?: string;
    primaryColor?: string;
    headerText?: string;
    footerText?: string;
    /** Inline data URL of the logo bytes (already fetched by the service). */
    logoDataUrl?: string;
}

/**
 * Single source of truth for the receipt / invoice HTML across POS finalize,
 * the sale-detail re-print button, and the POS sale-lookup dialog. Two
 * templates ship today:
 *
 *   - Thermal (Thermal80mm + Thermal58mm via CSS width tweak) — narrow strip
 *     printed on POS rolls. This is the default and covers ~95% of retail.
 *   - A4 — full-page invoice with header / billing block / per-line tax /
 *     totals / payment summary / footer. Used by desktop / B2B / wholesale
 *     and dot-matrix carbon-copy markets.
 *
 * Format selection is driven by the resolved BrandingProfile's paperFormat.
 * If no profile resolves (legacy data, or tenant hasn't configured profiles),
 * we fall back to Thermal80mm with the outlet/tenant branding fields — the
 * pre-Phase-2.22 behavior, unchanged.
 */
@Injectable({ providedIn: 'root' })
export class ReceiptPrintService {
    private readonly http = inject(HttpClient);
    private readonly tenantInfo = inject(TenantInfoService);
    private readonly brandingApi = inject(BrandingProfilesService);

    /**
     * Print the sale receipt in a popup window. `profileOverride` lets a re-print
     * caller (e.g. sale-detail) substitute a different profile without persisting
     * — useful when a customer asks for "an A4 copy" of a thermal sale.
     */
    async print(sale: SaleDto, outlet?: OutletDto | string, profileOverride?: string): Promise<void> {
        const ctx = await this.resolveContext(sale, outlet, profileOverride);
        const html = this.buildHtml(sale, ctx);
        // A4 needs a wider popup so the layout doesn't visually collapse during preview.
        const popupSize = ctx.format === 'A4' ? 'width=900,height=1100' : 'width=380,height=720';
        const w = window.open('', '_blank', popupSize);
        if (!w) return;
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.onload = () => {
            try { w.focus(); w.print(); } finally { /* keep open */ }
        };
    }

    /** Render-only path used by sale-detail to surface the receipt inline. */
    async buildBranded(sale: SaleDto, outlet?: OutletDto | string, profileOverride?: string): Promise<string> {
        const ctx = await this.resolveContext(sale, outlet, profileOverride);
        return this.buildHtml(sale, ctx);
    }

    /**
     * Resolution chain for paper format + branding bits:
     *   1. sale.brandingProfileId (or profileOverride) — the immutable snapshot
     *   2. outlet.defaultBrandingProfileId — the live default
     *   3. outlet branding fields (logo bytes / color / taxId on the Outlet row)
     *   4. tenant branding fields (logo bytes / color / taxId on FSHTenantInfo)
     *   5. nothing — Thermal80mm default + plain header text only
     */
    private async resolveContext(
        sale: SaleDto,
        outlet?: OutletDto | string,
        profileOverride?: string,
    ): Promise<ReceiptContext> {
        const tenant = this.tenantInfo.info();

        // Outlet identity — always populated when caller gave us a real DTO.
        const outletDto = typeof outlet === 'object' ? outlet : undefined;
        const outletName = typeof outlet === 'string' ? outlet : (outletDto?.name ?? '');

        const ctx: ReceiptContext = {
            format: 'Thermal80mm',
            name: outletName,
            addressLine: outletDto?.addressLine,
            city: outletDto?.city,
            state: outletDto?.state,
            country: outletDto?.country,
            postalCode: outletDto?.postalCode,
            contactPhone: outletDto?.contactPhone,
            contactEmail: outletDto?.contactEmail,
        };

        // Try the profile chain. Either id may be unresolvable (deleted, cross-tenant,
        // user lacks View) — in which case we silently fall through to outlet/tenant
        // fields so the receipt still prints, just with the older look.
        const profileId = profileOverride || sale.brandingProfileId || outletDto?.defaultBrandingProfileId;
        let profile: BrandingProfileDto | null = null;
        if (profileId) {
            profile = await firstValueFrom(this.brandingApi.get(profileId).pipe(catchError(() => of(null as any))));
        }

        if (profile) {
            ctx.format = profile.paperFormat;
            ctx.primaryColor = profile.primaryColor || outletDto?.primaryColor || tenant?.primaryColor || undefined;
            ctx.taxId = profile.taxId || outletDto?.taxId || tenant?.taxId || undefined;
            ctx.headerText = profile.headerText || undefined;
            ctx.footerText = profile.footerText || undefined;

            // Logo: profile's > outlet's > tenant's
            const logoUrl =
                profile.hasLogo ? `${environment.apiUrl}/api/brandingprofiles/${profile.id}/logo`
                : outletDto?.hasLogo ? `${environment.apiUrl}/api/outlets/${outletDto.id}/logo`
                : tenant?.hasLogo ? `${environment.apiUrl}/api/tenants/${tenant.id}/logo`
                : null;
            if (logoUrl) ctx.logoDataUrl = await this.fetchLogo(logoUrl);
        } else {
            // No profile resolved — fall back to outlet/tenant fields (pre-2.22 behavior).
            ctx.primaryColor = outletDto?.primaryColor || tenant?.primaryColor || undefined;
            ctx.taxId = outletDto?.taxId || tenant?.taxId || undefined;
            const logoUrl =
                outletDto?.hasLogo ? `${environment.apiUrl}/api/outlets/${outletDto.id}/logo`
                : tenant?.hasLogo ? `${environment.apiUrl}/api/tenants/${tenant.id}/logo`
                : null;
            if (logoUrl) ctx.logoDataUrl = await this.fetchLogo(logoUrl);
        }

        return ctx;
    }

    private async fetchLogo(url: string): Promise<string | undefined> {
        try {
            const blob = await firstValueFrom(this.http.get(url, { responseType: 'blob' }));
            return await this.blobToDataUrl(blob);
        } catch {
            return undefined;
        }
    }

    private blobToDataUrl(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
        });
    }

    /** Format-aware entry point — branches on `ctx.format`. */
    buildHtml(sale: SaleDto, ctx: ReceiptContext): string {
        return ctx.format === 'A4'
            ? this.buildA4Html(sale, ctx)
            : this.buildThermalHtml(sale, ctx);
    }

    // ────────────────────────────────────────────────────────────────────
    // Thermal template — covers Thermal80mm and Thermal58mm. The narrow
    // variant just changes the body width via CSS. Vertical-feature lines
    // (serial / batch / weight) print inline under the product name; this
    // keeps every BusinessType (Electronics / Pharmacy / Supermarket /
    // Generic) usable from any layout.
    // ────────────────────────────────────────────────────────────────────
    private buildThermalHtml(sale: SaleDto, ctx: ReceiptContext): string {
        const fmt = (n: number) => n.toFixed(2);
        const e = (s: string) => this.escape(s);
        const accent = ctx.primaryColor || '#4F46E5';
        const bodyWidth = ctx.format === 'Thermal58mm' ? '220px' : '300px';

        const addressParts = [ctx.addressLine, ctx.city, ctx.state, ctx.postalCode].filter(x => !!x).join(', ');
        const country = ctx.country ? ` ${e(ctx.country)}` : '';
        const contactParts: string[] = [];
        if (ctx.contactPhone) contactParts.push(e(ctx.contactPhone));
        if (ctx.contactEmail) contactParts.push(e(ctx.contactEmail));

        const items = sale.items.map(i => {
            const qtyLabel = i.weightKg != null
                ? `${i.weightKg} kg × ${fmt(i.unitPrice)}`
                : `${i.quantity} × ${fmt(i.unitPrice)}`;
            const meta: string[] = [e(i.sku)];
            if (i.serialNumber) meta.push(`SN ${e(i.serialNumber)}`);
            if (i.batchNumber) meta.push(`Batch ${e(i.batchNumber)}`);
            return `
            <tr>
                <td style="padding:3px 0;vertical-align:top">${e(i.productName)}<br><span style="color:#666;font-size:10px">${meta.join(' · ')}</span></td>
                <td style="text-align:right;padding:3px 0;white-space:nowrap;vertical-align:top">${qtyLabel}</td>
                <td style="text-align:right;padding:3px 0;vertical-align:top">${fmt(i.lineTotal)}</td>
            </tr>`;
        }).join('');

        const payments = sale.payments.map(p => `
            <tr><td>${e(p.method)}${p.reference ? ' (' + e(p.reference) + ')' : ''}</td><td style="text-align:right">${fmt(p.amount)}</td></tr>`).join('');

        const headerBlock = ctx.name ? `
            <div class="hdr">
                ${ctx.logoDataUrl ? `<img src="${ctx.logoDataUrl}" alt="logo" class="logo">` : ''}
                <div class="biz">${e(ctx.name)}</div>
                ${addressParts ? `<div class="meta">${e(addressParts)}${country}</div>` : ''}
                ${contactParts.length ? `<div class="meta">${contactParts.join(' · ')}</div>` : ''}
                ${ctx.taxId ? `<div class="meta">Tax ID: ${e(ctx.taxId)}</div>` : ''}
                ${ctx.headerText ? `<div class="meta" style="margin-top:4px;font-style:italic">${e(ctx.headerText)}</div>` : ''}
            </div>` : '';

        return `<!doctype html><html><head><meta charset="utf-8"><title>${e(sale.invoiceNumber)}</title>
<style>
    body{font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:12px;color:#111;margin:0;padding:10px;width:${bodyWidth};background:#fff}
    .accent-strip{height:4px;background:${accent};margin:-10px -10px 8px -10px}
    h1,h2,h3{margin:0}
    .hdr{text-align:center;padding-bottom:6px}
    .hdr .logo{max-width:80px;max-height:60px;object-fit:contain;margin-bottom:4px}
    .hdr .biz{font-size:15px;font-weight:700;letter-spacing:-0.2px}
    .hdr .meta{font-size:10px;color:#555;line-height:1.35}
    .invoice-meta{text-align:center;font-size:11px;margin:6px 0}
    .invoice-meta .num{font-family:'Courier New',monospace;font-weight:700;font-size:13px}
    .customer{font-size:11px;text-align:center;color:#444}
    table{width:100%;border-collapse:collapse;font-size:11px}
    .items th{text-align:left;font-weight:600;font-size:10px;text-transform:uppercase;color:#666;border-bottom:1px solid #ddd;padding:3px 0}
    .totals td{padding:2px 0;font-size:11px}
    .totals .grand{border-top:1px dashed #999;font-weight:700;font-size:14px;padding-top:5px;color:${accent}}
    .pmt{border-top:1px dashed #999;padding-top:4px;margin-top:4px}
    hr{border:none;border-top:1px dashed #999;margin:6px 0}
    .footer{text-align:center;font-size:10px;color:#666;margin-top:8px;padding-top:6px;border-top:2px solid ${accent}}
    .barcode{display:flex;justify-content:center;margin:4px 0 2px}
    .barcode svg{max-width:100%;height:38px}
    @media print { @page { margin:0 } body { padding:8px;width:auto } }
</style></head><body>
<div class="accent-strip"></div>
${headerBlock}
<div class="invoice-meta">
    <div class="num">${e(sale.invoiceNumber)}</div>
    <div>${new Date(sale.saleDate).toLocaleString()}</div>
    <div class="barcode">${this.renderInvoiceBarcode(sale.invoiceNumber, 'thermal')}</div>
</div>
${sale.customerName ? `<div class="customer">Customer: ${e(sale.customerName)}${sale.customerPhone ? ' · ' + e(sale.customerPhone) : ''}</div>` : ''}
<hr>
<table class="items">
    <thead><tr><th>Item</th><th style="text-align:right">Qty × Price</th><th style="text-align:right">Total</th></tr></thead>
    <tbody>${items}</tbody>
</table>
<table class="totals">
    <tr><td>Subtotal</td><td style="text-align:right">${fmt(sale.subTotal)}</td></tr>
    ${sale.discountAmount ? `<tr><td>Discount</td><td style="text-align:right">−${fmt(sale.discountAmount)}</td></tr>` : ''}
    ${sale.taxAmount ? `<tr><td>Tax</td><td style="text-align:right">${fmt(sale.taxAmount)}</td></tr>` : ''}
    <tr class="grand"><td>Total</td><td style="text-align:right">${fmt(sale.total)}</td></tr>
</table>
<table class="pmt">${payments}</table>
${sale.balance && sale.balance > 0 ? `<div style="text-align:right;font-size:11px;color:#b91c1c;margin-top:4px">Balance due: ${fmt(sale.balance)}</div>` : ''}
<div class="footer">
    ${ctx.footerText ? `<div>${e(ctx.footerText)}</div>` : '<div>Thank you for your business!</div>'}
    <div style="margin-top:2px;font-size:9px">Powered by UltraPOS</div>
</div>
</body></html>`;
    }

    // ────────────────────────────────────────────────────────────────────
    // A4 invoice template — used for B2B / wholesale / dot-matrix output.
    // Includes a billing block, per-line tax, and an explicit payment-
    // summary table so corporate customers can reconcile against PO terms.
    // ────────────────────────────────────────────────────────────────────
    private buildA4Html(sale: SaleDto, ctx: ReceiptContext): string {
        const fmt = (n: number) => n.toFixed(2);
        const e = (s: string) => this.escape(s);
        const accent = ctx.primaryColor || '#4F46E5';

        const addressLines = [ctx.addressLine, [ctx.city, ctx.state, ctx.postalCode].filter(x => !!x).join(', '), ctx.country]
            .filter(x => !!x);
        const sellerContact: string[] = [];
        if (ctx.contactPhone) sellerContact.push(e(ctx.contactPhone));
        if (ctx.contactEmail) sellerContact.push(e(ctx.contactEmail));

        const items = sale.items.map((i, idx) => {
            const meta: string[] = [];
            if (i.serialNumber) meta.push(`SN ${e(i.serialNumber)}`);
            if (i.batchNumber) meta.push(`Batch ${e(i.batchNumber)}`);
            if (i.weightKg != null) meta.push(`${i.weightKg} kg`);
            const lineNet = Math.max(0, i.unitPrice * i.quantity - (i.discountAmount ?? 0));
            return `
            <tr>
                <td>${idx + 1}</td>
                <td><strong>${e(i.productName)}</strong><div class="muted">${e(i.sku)}${meta.length ? ' · ' + meta.join(' · ') : ''}</div></td>
                <td class="r">${i.weightKg != null ? i.weightKg + ' kg' : i.quantity}</td>
                <td class="r">${fmt(i.unitPrice)}</td>
                <td class="r">${i.discountAmount ? '−' + fmt(i.discountAmount) : '—'}</td>
                <td class="r">${i.taxRate ? i.taxRate + '%' : '—'}</td>
                <td class="r">${fmt(lineNet)}</td>
                <td class="r"><strong>${fmt(i.lineTotal)}</strong></td>
            </tr>`;
        }).join('');

        const payments = sale.payments.map(p => `
            <tr><td>${e(p.method)}${p.reference ? ' (' + e(p.reference) + ')' : ''}</td><td class="r">${fmt(p.amount)}</td></tr>`).join('');

        return `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${e(sale.invoiceNumber)}</title>
<style>
    body{font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:12px;color:#111;margin:0;padding:24px;background:#fff}
    h1{margin:0;font-size:28px;letter-spacing:-0.5px;color:${accent}}
    h2{margin:0 0 6px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888}
    .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid ${accent};padding-bottom:14px;margin-bottom:18px}
    .head .seller{flex:1;display:flex;align-items:flex-start;gap:14px}
    .head .seller img{max-height:64px;max-width:160px;object-fit:contain}
    .head .seller .name{font-size:18px;font-weight:700;letter-spacing:-0.2px}
    .head .seller .meta{font-size:11px;color:#555;line-height:1.5;margin-top:2px}
    .head .invblock{text-align:right;min-width:200px}
    .head .invblock .num{font-family:'Courier New',monospace;font-weight:700;font-size:16px;letter-spacing:0.5px}
    .head .invblock .meta{font-size:11px;color:#555;line-height:1.5;margin-top:4px}
    .head .invblock .barcode{display:flex;justify-content:flex-end;margin:6px 0 2px}
    .head .invblock .barcode svg{max-height:34px;max-width:200px}
    .billing{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:14px}
    .billing .box{border:1px solid #e5e7eb;border-radius:6px;padding:10px 12px;background:#fafafa}
    .billing .box .name{font-weight:700;font-size:13px}
    .billing .box .meta{font-size:11px;color:#555;line-height:1.5;margin-top:2px}
    .header-text{background:#fff8e1;border-left:4px solid ${accent};padding:8px 12px;font-style:italic;color:#444;margin-bottom:14px;font-size:12px}
    table.items{width:100%;border-collapse:collapse;font-size:11px}
    table.items th{background:${accent};color:#fff;text-align:left;padding:8px 10px;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:0.5px}
    table.items td{padding:8px 10px;border-bottom:1px solid #eee;vertical-align:top}
    table.items tr:nth-child(even) td{background:#fafafa}
    .r{text-align:right}
    .muted{color:#888;font-size:10px;margin-top:2px}
    .summary{display:grid;grid-template-columns:1fr 320px;gap:18px;margin-top:14px}
    .summary .terms{font-size:11px;color:#555;line-height:1.6}
    .summary .totals{border-top:2px solid ${accent};padding-top:8px}
    .summary .totals .row{display:flex;justify-content:space-between;font-size:12px;padding:3px 0}
    .summary .totals .grand{font-weight:700;font-size:18px;color:${accent};border-top:1px dashed #999;padding-top:6px;margin-top:4px}
    .pmtblock{margin-top:14px;border-top:1px solid #e5e7eb;padding-top:10px}
    .pmtblock h2{margin-bottom:4px}
    table.pmt{width:320px;border-collapse:collapse;font-size:11px;margin-left:auto}
    table.pmt td{padding:3px 0}
    .footer{margin-top:20px;text-align:center;font-size:10px;color:#888;border-top:2px solid ${accent};padding-top:10px}
    .balance{display:inline-block;background:#fee2e2;color:#b91c1c;padding:6px 12px;border-radius:6px;font-weight:600;margin-top:8px}
    @media print { @page { size: A4; margin: 1.2cm } body { padding:0 } }
</style></head><body>
<div class="head">
    <div class="seller">
        ${ctx.logoDataUrl ? `<img src="${ctx.logoDataUrl}" alt="logo">` : ''}
        <div>
            <div class="name">${e(ctx.name || '—')}</div>
            <div class="meta">
                ${addressLines.map(l => `<div>${e(l)}</div>`).join('')}
                ${sellerContact.length ? `<div>${sellerContact.join(' · ')}</div>` : ''}
                ${ctx.taxId ? `<div>Tax ID: ${e(ctx.taxId)}</div>` : ''}
            </div>
        </div>
    </div>
    <div class="invblock">
        <h1>Invoice</h1>
        <div class="num">${e(sale.invoiceNumber)}</div>
        <div class="barcode">${this.renderInvoiceBarcode(sale.invoiceNumber, 'a4')}</div>
        <div class="meta">
            Issued ${new Date(sale.saleDate).toLocaleDateString()}<br>
            Status: ${e(sale.status)}
        </div>
    </div>
</div>

<div class="billing">
    <div class="box">
        <h2>Bill To</h2>
        ${sale.customerName
            ? `<div class="name">${e(sale.customerName)}</div>${sale.customerPhone ? `<div class="meta">${e(sale.customerPhone)}</div>` : ''}`
            : `<div class="name">Walk-in Customer</div>`}
    </div>
    <div class="box">
        <h2>Sale Reference</h2>
        <div class="name">${e(sale.invoiceNumber)}</div>
        <div class="meta">${new Date(sale.saleDate).toLocaleString()}</div>
    </div>
</div>

${ctx.headerText ? `<div class="header-text">${e(ctx.headerText)}</div>` : ''}

<table class="items">
    <thead><tr>
        <th>#</th><th>Description</th><th class="r">Qty</th><th class="r">Unit</th>
        <th class="r">Discount</th><th class="r">Tax</th><th class="r">Net</th><th class="r">Line Total</th>
    </tr></thead>
    <tbody>${items}</tbody>
</table>

<div class="summary">
    <div class="terms">
        <h2>Notes / Terms</h2>
        ${ctx.footerText ? `<div>${e(ctx.footerText)}</div>` : '<div>Payment due on receipt unless otherwise agreed.</div>'}
        ${sale.notes ? `<div style="margin-top:6px"><strong>Sale notes:</strong> ${e(sale.notes)}</div>` : ''}
    </div>
    <div class="totals">
        <div class="row"><span>Subtotal</span><span>${fmt(sale.subTotal)}</span></div>
        ${sale.discountAmount ? `<div class="row"><span>Discount</span><span>−${fmt(sale.discountAmount)}</span></div>` : ''}
        ${sale.taxAmount ? `<div class="row"><span>Tax</span><span>${fmt(sale.taxAmount)}</span></div>` : ''}
        <div class="row grand"><span>Grand Total</span><span>${fmt(sale.total)}</span></div>
        <div class="row" style="font-size:11px;color:#666;margin-top:6px"><span>Paid</span><span>${fmt(sale.paidAmount)}</span></div>
        ${sale.balance && sale.balance > 0 ? `<div style="text-align:right;margin-top:4px"><span class="balance">Balance due: ${fmt(sale.balance)}</span></div>` : ''}
    </div>
</div>

<div class="pmtblock">
    <h2>Payment Summary</h2>
    <table class="pmt">${payments}</table>
</div>

<div class="footer">
    <div>Thank you for your business!</div>
    <div style="margin-top:2px;font-size:9px">Powered by UltraPOS</div>
</div>
</body></html>`;
    }

    /**
     * Renders a small Code128 of the invoice number — printed on every
     * receipt so a return-desk cashier can scan instead of typing into the
     * Find Sale dialog. Inline SVG so the popup stays self-contained.
     * Failure mode: invalid Code128 inputs (e.g. very long invoice numbers)
     * fall back to empty string — the receipt still prints, just without
     * the scannable barcode.
     */
    private renderInvoiceBarcode(invoiceNumber: string, format: 'thermal' | 'a4'): string {
        try {
            return bwipjs.toSVG({
                bcid: 'code128',
                text: invoiceNumber,
                scale: format === 'a4' ? 2 : 1.6,
                height: format === 'a4' ? 8 : 6,
                includetext: false,
                paddingwidth: 0,
                paddingheight: 0,
            });
        } catch {
            return '';
        }
    }

    private escape(s: string): string {
        return (s ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
