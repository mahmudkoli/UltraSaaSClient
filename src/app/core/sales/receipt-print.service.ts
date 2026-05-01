import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'environments/environment';
import { OutletDto } from 'app/core/outlets/outlets.types';
import { TenantInfoService } from 'app/core/auth/tenant-info.service';
import { SaleDto } from './sales.types';

export interface ReceiptOutlet {
    name: string;
    addressLine?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    contactPhone?: string;
    contactEmail?: string;
    taxId?: string;
    primaryColor?: string;
    /** Inline data URL of the logo bytes, prepared by the caller. */
    logoDataUrl?: string;
}

/**
 * Single source of truth for the 80mm thermal receipt HTML. POS finalize,
 * sale-detail's reprint button, and the POS sale-lookup dialog all funnel
 * through this so a layout tweak only needs to land here.
 *
 * The print method takes either:
 *   - a string outlet-name (legacy quick path), or
 *   - a full OutletDto (auto-fetches logo bytes and embeds them as data URL)
 *
 * Embedding the logo as a data URL keeps the popup self-contained — the
 * print dialog doesn't need to fetch from the API after window.open.
 */
@Injectable({ providedIn: 'root' })
export class ReceiptPrintService {
    private readonly http = inject(HttpClient);
    private readonly tenantInfo = inject(TenantInfoService);

    async print(sale: SaleDto, outlet?: OutletDto | string): Promise<void> {
        const ctx = await this.resolveOutlet(outlet);
        const html = this.buildHtml(sale, ctx);
        const w = window.open('', '_blank', 'width=380,height=720');
        if (!w) return;
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.onload = () => {
            try { w.focus(); w.print(); } finally { /* keep open */ }
        };
    }

    /** Public so the sale-detail page (and others) can render the receipt inline. */
    async buildBranded(sale: SaleDto, outlet?: OutletDto | string): Promise<string> {
        const ctx = await this.resolveOutlet(outlet);
        return this.buildHtml(sale, ctx);
    }

    private async resolveOutlet(outlet?: OutletDto | string): Promise<ReceiptOutlet | undefined> {
        if (!outlet) return undefined;
        if (typeof outlet === 'string') return { name: outlet };

        // Outlet-specific fields win when set; otherwise we inherit from the
        // tenant's parent branding (logo / accent color / tax id). This means
        // a single tenant-level upload covers every outlet receipt automatically.
        const tenant = this.tenantInfo.info();

        const ctx: ReceiptOutlet = {
            name: outlet.name,
            addressLine: outlet.addressLine,
            city: outlet.city,
            state: outlet.state,
            country: outlet.country,
            postalCode: outlet.postalCode,
            contactPhone: outlet.contactPhone,
            contactEmail: outlet.contactEmail,
            taxId: outlet.taxId || tenant?.taxId || undefined,
            primaryColor: outlet.primaryColor || tenant?.primaryColor || undefined,
        };

        // Logo resolution: outlet's own > tenant's parent > none.
        const logoSource: { url: string } | null =
            outlet.hasLogo ? { url: `${environment.apiUrl}/api/outlets/${outlet.id}/logo` }
            : tenant?.hasLogo ? { url: `${environment.apiUrl}/api/tenants/${tenant.id}/logo` }
            : null;
        if (logoSource) {
            try {
                const blob = await firstValueFrom(this.http.get(logoSource.url, { responseType: 'blob' }));
                ctx.logoDataUrl = await this.blobToDataUrl(blob);
            } catch {
                // Logo fetch failed — fall back to text-only header.
            }
        }
        return ctx;
    }

    private blobToDataUrl(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
        });
    }

    /** Build the receipt HTML; exposed for callers that need to render it elsewhere. */
    buildHtml(sale: SaleDto, outlet?: ReceiptOutlet): string {
        const fmt = (n: number) => n.toFixed(2);
        const e = (s: string) => this.escape(s);
        const accent = outlet?.primaryColor || '#4F46E5';

        const addressParts = [outlet?.addressLine, outlet?.city, outlet?.state, outlet?.postalCode]
            .filter(x => !!x).join(', ');
        const country = outlet?.country ? ` ${e(outlet.country)}` : '';
        const contactParts: string[] = [];
        if (outlet?.contactPhone) contactParts.push(e(outlet.contactPhone));
        if (outlet?.contactEmail) contactParts.push(e(outlet.contactEmail));

        const items = sale.items.map(i => `
            <tr>
                <td style="padding:3px 0;vertical-align:top">${e(i.productName)}<br><span style="color:#666;font-size:10px">${e(i.sku)}${i.serialNumber ? ' · SN ' + e(i.serialNumber) : ''}${i.batchNumber ? ' · Batch ' + e(i.batchNumber) : ''}</span></td>
                <td style="text-align:right;padding:3px 0;white-space:nowrap;vertical-align:top">${i.quantity} × ${fmt(i.unitPrice)}</td>
                <td style="text-align:right;padding:3px 0;vertical-align:top">${fmt(i.lineTotal)}</td>
            </tr>`).join('');

        const payments = sale.payments.map(p => `
            <tr><td>${e(p.method)}${p.reference ? ' (' + e(p.reference) + ')' : ''}</td><td style="text-align:right">${fmt(p.amount)}</td></tr>`).join('');

        const header = outlet ? `
            <div class="hdr">
                ${outlet.logoDataUrl ? `<img src="${outlet.logoDataUrl}" alt="logo" class="logo">` : ''}
                <div class="biz">${e(outlet.name)}</div>
                ${addressParts ? `<div class="meta">${e(addressParts)}${country}</div>` : ''}
                ${contactParts.length ? `<div class="meta">${contactParts.join(' · ')}</div>` : ''}
                ${outlet.taxId ? `<div class="meta">Tax ID: ${e(outlet.taxId)}</div>` : ''}
            </div>
        ` : '';

        return `<!doctype html><html><head><meta charset="utf-8"><title>${e(sale.invoiceNumber)}</title>
<style>
    body{font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:12px;color:#111;margin:0;padding:10px;width:300px;background:#fff}
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
    @media print { @page { margin:0 } body { padding:8px;width:auto } }
</style></head><body>
<div class="accent-strip"></div>
${header}
<div class="invoice-meta">
    <div class="num">${e(sale.invoiceNumber)}</div>
    <div>${new Date(sale.saleDate).toLocaleString()}</div>
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
    <div>Thank you for your business!</div>
    <div style="margin-top:2px;font-size:9px">Powered by UltraPOS</div>
</div>
</body></html>`;
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
