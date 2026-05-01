import { Injectable } from '@angular/core';
import { SaleDto } from './sales.types';

/**
 * Single source of truth for the 80mm thermal receipt HTML. POS finalize,
 * sale-detail's reprint button, and the POS sale-lookup dialog all funnel
 * through this so a layout tweak only needs to land here.
 */
@Injectable({ providedIn: 'root' })
export class ReceiptPrintService {
    /** Open the receipt in a popup window and trigger the browser print dialog. */
    print(sale: SaleDto, outletName?: string): void {
        const w = window.open('', '_blank', 'width=380,height=720');
        if (!w) return;
        const html = this.buildHtml(sale, outletName);
        w.document.open();
        w.document.write(html);
        w.document.close();
        // Wait for layout, then print. Leave the window open so the cashier
        // can re-print without going back to the app.
        w.onload = () => {
            try { w.focus(); w.print(); } finally { /* keep open */ }
        };
    }

    /** Build the receipt HTML; exposed for callers that need to render it elsewhere. */
    buildHtml(sale: SaleDto, outletName?: string): string {
        const fmt = (n: number) => n.toFixed(2);
        const items = sale.items.map(i => `
            <tr>
                <td style="padding:2px 0">${this.escape(i.productName)}<br><span style="color:#666;font-size:10px">${this.escape(i.sku)}${i.serialNumber ? ' · SN ' + this.escape(i.serialNumber) : ''}</span></td>
                <td style="text-align:right;padding:2px 0">${i.quantity} × ${fmt(i.unitPrice)}</td>
                <td style="text-align:right;padding:2px 0">${fmt(i.lineTotal)}</td>
            </tr>`).join('');
        const payments = sale.payments.map(p => `
            <tr><td>${this.escape(p.method)}${p.reference ? ' (' + this.escape(p.reference) + ')' : ''}</td><td style="text-align:right">${fmt(p.amount)}</td></tr>`).join('');
        return `<!doctype html><html><head><meta charset="utf-8"><title>${this.escape(sale.invoiceNumber)}</title>
<style>
    body{font-family:'Courier New',Courier,monospace;font-size:12px;color:#000;margin:0;padding:8px;width:280px}
    h1,h2,h3{margin:4px 0}
    .center{text-align:center}
    table{width:100%;border-collapse:collapse}
    .totals td{padding:1px 0}
    .totals .grand{border-top:1px dashed #000;font-weight:bold;font-size:14px;padding-top:4px}
    hr{border:none;border-top:1px dashed #000;margin:6px 0}
    @media print { @page { margin:0 } body { padding:8px } }
</style></head><body>
<div class="center">
    ${outletName ? `<h2>${this.escape(outletName)}</h2>` : ''}
    <div>Invoice ${this.escape(sale.invoiceNumber)}</div>
    <div>${new Date(sale.saleDate).toLocaleString()}</div>
    ${sale.customerName ? `<div>Customer: ${this.escape(sale.customerName)}</div>` : ''}
</div>
<hr>
<table>${items}</table>
<hr>
<table class="totals">
    <tr><td>Subtotal</td><td style="text-align:right">${fmt(sale.subTotal)}</td></tr>
    ${sale.discountAmount ? `<tr><td>Discount</td><td style="text-align:right">−${fmt(sale.discountAmount)}</td></tr>` : ''}
    ${sale.taxAmount ? `<tr><td>Tax</td><td style="text-align:right">${fmt(sale.taxAmount)}</td></tr>` : ''}
    <tr class="grand"><td>Total</td><td style="text-align:right">${fmt(sale.total)}</td></tr>
</table>
<hr>
<table>${payments}</table>
<hr>
<div class="center">Thank you!</div>
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
