import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import bwipjs from 'bwip-js';
import { environment } from 'environments/environment';
import { SalesService } from 'app/core/sales/sales.service';
import { PublicSaleDto } from 'app/core/sales/sales.types';

/**
 * Public, unauthenticated view of a sale's invoice — the destination of the WhatsApp
 * share link generated from the share dialog. The token + tenant come from the URL
 * (path + query string). No login chrome, no app nav — the customer sees only the
 * branded A4 invoice and a Print button. Renders the same look as the cashier's
 * A4 re-print to keep the customer-facing artifact recognisable.
 */
@Component({
    selector: 'app-public-invoice-viewer',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule],
    template: `
<div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 px-3 flex flex-col items-center">
    @if (loading()) {
        <div class="flex items-center gap-3 text-gray-500 mt-12">
            <mat-icon class="icon-size-5 animate-spin">progress_activity</mat-icon>
            <span>Loading invoice…</span>
        </div>
    } @else if (errorMsg()) {
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md mt-12 text-center">
            <mat-icon class="text-rose-500 icon-size-12 mb-3">error_outline</mat-icon>
            <h2 class="text-lg font-semibold mb-2">Invoice not available</h2>
            <p class="text-sm text-gray-500">{{ errorMsg() }}</p>
        </div>
    } @else {
        <div class="w-full max-w-[900px] flex items-center justify-end gap-2 mb-3 print:hidden">
            <button mat-stroked-button (click)="print()" class="!bg-white dark:!bg-gray-800">
                <mat-icon class="icon-size-5 mr-1">print</mat-icon>
                <span>Print</span>
            </button>
        </div>
        <div class="bg-white shadow-xl rounded-lg w-full max-w-[900px] overflow-hidden print:shadow-none print:rounded-none print:max-w-none">
            <div [innerHTML]="bodyHtml()"></div>
        </div>
    }
</div>
    `,
    styles: [`
        :host { display: block; }
        @media print {
            :host { background: white; }
        }
    `],
})
export class PublicInvoiceViewerComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly salesApi = inject(SalesService);
    private readonly sanitizer = inject(DomSanitizer);

    loading = signal(true);
    errorMsg = signal<string | null>(null);
    bodyHtml = signal<SafeHtml>('');

    ngOnInit(): void {
        const token = this.route.snapshot.paramMap.get('token') ?? '';
        const tenant = this.route.snapshot.queryParamMap.get('tenant') ?? '';
        if (!token || !tenant) {
            this.loading.set(false);
            this.errorMsg.set('This link is missing required information. Ask the seller to re-share it.');
            return;
        }
        this.salesApi.getPublicInvoice(token, tenant).subscribe({
            next: dto => {
                this.loading.set(false);
                const html = this.buildA4Body(dto, tenant);
                // bypassSecurityTrustHtml: the source is our own DTO projected on
                // the server with HTML escaping below — this isn't user-authored markup.
                this.bodyHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));
                document.title = `Invoice ${dto.invoiceNumber}`;
            },
            error: () => {
                this.loading.set(false);
                this.errorMsg.set('This invoice link is no longer valid, or it was issued for a different shop.');
            },
        });
    }

    print(): void { window.print(); }

    private buildA4Body(dto: PublicSaleDto, tenantId: string): string {
        const fmt = (n: number) => n.toFixed(2);
        const e = (s: string) => this.escape(s);

        // Resolve accent / paper format / branding logo / outlet logo — mirrors the
        // chain in ReceiptPrintService.resolveContext but on a flat DTO.
        const accent = dto.branding?.primaryColor || dto.outlet.primaryColor || '#4F46E5';
        const tq = encodeURIComponent(tenantId);
        const logoUrl =
            dto.branding?.hasLogo ? `${environment.apiUrl}/api/brandingprofiles/${dto.branding.id}/logo?tenant=${tq}`
            : dto.outlet.hasLogo ? `${environment.apiUrl}/api/outlets/${dto.outlet.id}/logo?tenant=${tq}`
            : null;
        const headerText = dto.branding?.headerText;
        const footerText = dto.branding?.footerText;
        const taxId = dto.branding?.taxId || dto.outlet.taxId;

        const addressLines = [
            dto.outlet.addressLine,
            [dto.outlet.city, dto.outlet.state, dto.outlet.postalCode].filter(x => !!x).join(', '),
            dto.outlet.country,
        ].filter(x => !!x) as string[];

        const sellerContact: string[] = [];
        if (dto.outlet.contactPhone) sellerContact.push(e(dto.outlet.contactPhone));
        if (dto.outlet.contactEmail) sellerContact.push(e(dto.outlet.contactEmail));

        const items = dto.items.map((i, idx) => {
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

        const payments = dto.payments.map(p => `
            <tr><td>${e(p.method)}${p.reference ? ' (' + e(p.reference) + ')' : ''}</td><td class="r">${fmt(p.amount)}</td></tr>`).join('');

        const barcode = this.renderBarcode(dto.invoiceNumber);

        return `
<style scoped>
    .inv{font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:12px;color:#111;padding:24px;background:#fff}
    .inv h1{margin:0;font-size:28px;letter-spacing:-0.5px;color:${accent}}
    .inv h2{margin:0 0 6px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888}
    .inv .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid ${accent};padding-bottom:14px;margin-bottom:18px}
    .inv .head .seller{flex:1;display:flex;align-items:flex-start;gap:14px}
    .inv .head .seller img{max-height:64px;max-width:160px;object-fit:contain}
    .inv .head .seller .name{font-size:18px;font-weight:700;letter-spacing:-0.2px}
    .inv .head .seller .meta{font-size:11px;color:#555;line-height:1.5;margin-top:2px}
    .inv .head .invblock{text-align:right;min-width:200px}
    .inv .head .invblock .num{font-family:'Courier New',monospace;font-weight:700;font-size:16px;letter-spacing:0.5px}
    .inv .head .invblock .meta{font-size:11px;color:#555;line-height:1.5;margin-top:4px}
    .inv .head .invblock .barcode{display:flex;justify-content:flex-end;margin:6px 0 2px}
    .inv .head .invblock .barcode svg{max-height:34px;max-width:200px}
    .inv .billing{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:14px}
    .inv .billing .box{border:1px solid #e5e7eb;border-radius:6px;padding:10px 12px;background:#fafafa}
    .inv .billing .box .name{font-weight:700;font-size:13px}
    .inv .billing .box .meta{font-size:11px;color:#555;line-height:1.5;margin-top:2px}
    .inv .header-text{background:#fff8e1;border-left:4px solid ${accent};padding:8px 12px;font-style:italic;color:#444;margin-bottom:14px;font-size:12px}
    .inv table.items{width:100%;border-collapse:collapse;font-size:11px}
    .inv table.items th{background:${accent};color:#fff;text-align:left;padding:8px 10px;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:0.5px}
    .inv table.items td{padding:8px 10px;border-bottom:1px solid #eee;vertical-align:top}
    .inv table.items tr:nth-child(even) td{background:#fafafa}
    .inv .r{text-align:right}
    .inv .muted{color:#888;font-size:10px;margin-top:2px}
    .inv .summary{display:grid;grid-template-columns:1fr 320px;gap:18px;margin-top:14px}
    .inv .summary .terms{font-size:11px;color:#555;line-height:1.6}
    .inv .summary .totals{border-top:2px solid ${accent};padding-top:8px}
    .inv .summary .totals .row{display:flex;justify-content:space-between;font-size:12px;padding:3px 0}
    .inv .summary .totals .grand{font-weight:700;font-size:18px;color:${accent};border-top:1px dashed #999;padding-top:6px;margin-top:4px}
    .inv .pmtblock{margin-top:14px;border-top:1px solid #e5e7eb;padding-top:10px}
    .inv .pmtblock h2{margin-bottom:4px}
    .inv table.pmt{width:320px;border-collapse:collapse;font-size:11px;margin-left:auto}
    .inv table.pmt td{padding:3px 0}
    .inv .footer{margin-top:20px;text-align:center;font-size:10px;color:#888;border-top:2px solid ${accent};padding-top:10px}
    .inv .balance{display:inline-block;background:#fee2e2;color:#b91c1c;padding:6px 12px;border-radius:6px;font-weight:600;margin-top:8px}
    @media print { @page { size: A4; margin: 1.2cm } .inv { padding:0 } }
</style>
<div class="inv">
    <div class="head">
        <div class="seller">
            ${logoUrl ? `<img src="${logoUrl}" alt="logo">` : ''}
            <div>
                <div class="name">${e(dto.outlet.name || '—')}</div>
                <div class="meta">
                    ${addressLines.map(l => `<div>${e(l)}</div>`).join('')}
                    ${sellerContact.length ? `<div>${sellerContact.join(' · ')}</div>` : ''}
                    ${taxId ? `<div>Tax ID: ${e(taxId)}</div>` : ''}
                </div>
            </div>
        </div>
        <div class="invblock">
            <h1>Invoice</h1>
            <div class="num">${e(dto.invoiceNumber)}</div>
            <div class="barcode">${barcode}</div>
            <div class="meta">Issued ${new Date(dto.saleDate).toLocaleDateString()}</div>
        </div>
    </div>

    <div class="billing">
        <div class="box">
            <h2>Bill To</h2>
            ${dto.customerName
                ? `<div class="name">${e(dto.customerName)}</div>${dto.customerPhone ? `<div class="meta">${e(dto.customerPhone)}</div>` : ''}`
                : `<div class="name">Walk-in Customer</div>`}
        </div>
        <div class="box">
            <h2>Sale Reference</h2>
            <div class="name">${e(dto.invoiceNumber)}</div>
            <div class="meta">${new Date(dto.saleDate).toLocaleString()}</div>
        </div>
    </div>

    ${headerText ? `<div class="header-text">${e(headerText)}</div>` : ''}

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
            ${footerText ? `<div>${e(footerText)}</div>` : '<div>Payment due on receipt unless otherwise agreed.</div>'}
        </div>
        <div class="totals">
            <div class="row"><span>Subtotal</span><span>${fmt(dto.subTotal)}</span></div>
            ${dto.discountAmount ? `<div class="row"><span>Discount</span><span>−${fmt(dto.discountAmount)}</span></div>` : ''}
            ${dto.taxAmount ? `<div class="row"><span>Tax</span><span>${fmt(dto.taxAmount)}</span></div>` : ''}
            <div class="row grand"><span>Grand Total</span><span>${fmt(dto.total)}</span></div>
            <div class="row" style="font-size:11px;color:#666;margin-top:6px"><span>Paid</span><span>${fmt(dto.paidAmount)}</span></div>
            ${dto.balance && dto.balance > 0 ? `<div style="text-align:right;margin-top:4px"><span class="balance">Balance due: ${fmt(dto.balance)}</span></div>` : ''}
        </div>
    </div>

    <div class="pmtblock">
        <h2>Payment Summary</h2>
        <table class="pmt">${payments}</table>
    </div>

    <div class="footer">
        <div>Thank you for your business!</div>
        <div style="margin-top:2px;font-size:9px">Powered by MK Corex POS</div>
    </div>
</div>`;
    }

    private renderBarcode(invoiceNumber: string): string {
        try {
            return bwipjs.toSVG({
                bcid: 'code128',
                text: invoiceNumber,
                scale: 2,
                height: 8,
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
