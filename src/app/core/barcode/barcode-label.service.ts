import { Injectable } from '@angular/core';
// Root import — package.json's "browser" field points the Angular bundler at
// the browser build; the "/browser" subpath needs moduleResolution node16+
// which this project's tsconfig doesn't have.
import bwipjs from 'bwip-js';

export interface BarcodeLabelInput {
    /** Top line on the label — typically the product name. */
    name: string;
    /** Code-128 payload — usually the barcode field, falls back to the SKU. */
    code: string;
    /** Optional extra line shown small under the name (e.g. SKU when the code is the manufacturer barcode). */
    subtitle?: string;
    /** Bottom line — selling price formatted for display. Optional; omit for non-pricing labels. */
    price?: string;
}

/** Layout knobs the dialog exposes. */
export type LabelFormat = 'A4_5x13' | 'Thermal_Single';

/**
 * Renders a printable barcode-label sheet from a list of inputs and opens it
 * in a popup ready to print. Uses bwip-js (MIT, pure-JS) to render Code128
 * to inline SVG so the output is self-contained — the print window doesn't
 * need network access after window.open.
 *
 * Two formats today:
 *  - `A4_5x13` — standard US/Avery-style 5-column × 13-row A4 sticker sheet
 *    (65 labels per sheet at 38.1 × 21.2 mm). Multiple identical labels per
 *    product fit naturally; the service flattens (item × qty) into one
 *    flat list and starts a new page every 65 labels.
 *  - `Thermal_Single` — one label per row in a narrow strip, sized for a
 *    typical 50 × 30 mm dedicated thermal label printer (Zebra, Tsc,
 *    Argox). Browser print dialog handles paper size selection.
 */
@Injectable({ providedIn: 'root' })
export class BarcodeLabelService {
    /** items[i] is repeated `quantity[i]` times; mismatched lengths default qty to 1. */
    print(items: BarcodeLabelInput[], quantities: number[], format: LabelFormat = 'A4_5x13'): void {
        const flat: BarcodeLabelInput[] = [];
        for (let i = 0; i < items.length; i++) {
            const q = Math.max(1, Math.min(500, quantities[i] ?? 1));
            for (let j = 0; j < q; j++) flat.push(items[i]);
        }
        if (flat.length === 0) return;

        const labelsHtml = flat.map(it => this.renderLabel(it, format)).join('');
        const html = format === 'A4_5x13'
            ? this.buildA4SheetHtml(labelsHtml)
            : this.buildThermalHtml(labelsHtml);

        const popup = format === 'A4_5x13'
            ? window.open('', '_blank', 'width=900,height=1100')
            : window.open('', '_blank', 'width=380,height=720');
        if (!popup) return;
        popup.document.open();
        popup.document.write(html);
        popup.document.close();
        popup.onload = () => { try { popup.focus(); popup.print(); } catch { /* noop */ } };
    }

    /** Render one label's inner HTML — name, optional subtitle, barcode SVG, optional price. */
    private renderLabel(input: BarcodeLabelInput, format: LabelFormat): string {
        const e = (s: string) => this.escape(s);
        const svg = this.toBarcodeSvg(input.code);
        const sizing = format === 'A4_5x13' ? 'a4-cell' : 'th-cell';
        return `
        <div class="label ${sizing}">
            <div class="name">${e(input.name)}</div>
            ${input.subtitle ? `<div class="sub">${e(input.subtitle)}</div>` : ''}
            <div class="bc">${svg}</div>
            ${input.price ? `<div class="price">${e(input.price)}</div>` : ''}
        </div>`;
    }

    /** Code128 SVG via bwip-js. Heights/widths chosen to fit A4 cells without overflow. */
    private toBarcodeSvg(text: string): string {
        try {
            return bwipjs.toSVG({
                bcid: 'code128',
                text,
                scale: 2,
                height: 8,           // mm
                includetext: true,
                textsize: 8,
                textyoffset: 1,
            });
        } catch {
            // bwip-js throws on invalid Code128 input; fall back to the raw text
            // so the label is still printable, just without the scannable bars.
            return `<div style="font-family:monospace">${this.escape(text)}</div>`;
        }
    }

    private buildA4SheetHtml(labels: string): string {
        return `<!doctype html><html><head><meta charset="utf-8"><title>Labels</title>
<style>
    @page { size: A4; margin: 8mm 6mm; }
    html, body { margin: 0; padding: 0; }
    body { font-family: 'Inter','Segoe UI',Arial,sans-serif; }
    .sheet { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0; }
    .label.a4-cell {
        height: 21mm;
        padding: 1mm 1.5mm;
        box-sizing: border-box;
        border: 0.5px dashed #ccc;
        display: flex; flex-direction: column; align-items: stretch; justify-content: center;
        page-break-inside: avoid;
        overflow: hidden;
    }
    .label .name { font-size: 8pt; font-weight: 600; line-height: 1.1; text-align: center; max-height: 18px; overflow: hidden; }
    .label .sub  { font-size: 6.5pt; color: #555; text-align: center; line-height: 1; }
    .label .bc   { display: flex; justify-content: center; flex: 1 1 auto; align-items: center; min-height: 0; }
    .label .bc svg { max-width: 100%; max-height: 12mm; }
    .label .price{ font-size: 9pt; font-weight: 700; text-align: center; }
    @media print { .label.a4-cell { border: none; } }
</style></head><body><div class="sheet">${labels}</div></body></html>`;
    }

    private buildThermalHtml(labels: string): string {
        return `<!doctype html><html><head><meta charset="utf-8"><title>Labels</title>
<style>
    @page { size: 50mm 30mm; margin: 1mm; }
    html, body { margin: 0; padding: 0; }
    body { font-family: 'Inter','Segoe UI',Arial,sans-serif; }
    .label.th-cell {
        width: 48mm; height: 28mm;
        padding: 1mm;
        box-sizing: border-box;
        display: flex; flex-direction: column; align-items: stretch; justify-content: center;
        page-break-after: always;
        overflow: hidden;
    }
    .label .name { font-size: 9pt; font-weight: 600; line-height: 1.1; text-align: center; max-height: 22px; overflow: hidden; }
    .label .sub  { font-size: 7pt; color: #555; text-align: center; }
    .label .bc   { display: flex; justify-content: center; flex: 1 1 auto; align-items: center; min-height: 0; }
    .label .bc svg { max-width: 100%; max-height: 14mm; }
    .label .price{ font-size: 11pt; font-weight: 700; text-align: center; }
    .label.th-cell:last-child { page-break-after: auto; }
</style></head><body>${labels}</body></html>`;
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
