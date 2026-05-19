import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GoodsReceiptsService, PurchaseOrdersService } from 'app/core/purchasing/purchasing.service';
import { CreateGoodsReceiptLine, PurchaseOrderDto } from 'app/core/purchasing/purchasing.types';
import { ProductsService } from 'app/core/catalog/catalog.service';

interface GRLineDraft {
    purchaseOrderItemId: string;
    productId: string;
    productName: string;
    sku: string;
    outstanding: number;
    unitCost: number;
    quantityReceived: number;
    overrideUnitCost: number | null;
    serialsText: string;
    batchNumber: string;
    expiryDate: Date | null;
    /** Per-product gates resolved from the catalog DTO. Drives which inputs the
     * cashier sees on this line — replaces the cruder tenant-vertical check
     * that used to bleed batch/serial fields onto unrelated products. */
    requiresSerial: boolean;
    requiresBatch: boolean;
}

@Component({
    selector: 'app-goods-receipt-form',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatTableModule, MatTooltipModule, MatDatepickerModule, MatNativeDateModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl shadow-lg"><mat-icon class="text-white">local_shipping</mat-icon></div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Receive Goods</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400" *ngIf="po(); else hdrLoading">Against PO <span class="font-mono">{{ po()?.poNumber }}</span></p>
                    <ng-template #hdrLoading><p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Loading PO…</p></ng-template>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-4">
                <button mat-stroked-button class="h-12 px-6 rounded-lg" [routerLink]="['/purchase-orders', poId]"><mat-icon class="icon-size-5 mr-2">arrow_back</mat-icon><span>Back to PO</span></button>
            </div>
        </div>

        @if (po(); as p) {
            <div class="flex-auto p-4 sm:p-6">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 flex flex-col gap-6">
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                                <div class="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center"><mat-icon class="text-violet-600 dark:text-violet-400 text-lg">inventory_2</mat-icon></div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Items to Receive</h3>
                                <div class="ml-auto flex items-center gap-2">
                                    <button type="button" (click)="receiveAllLines()"
                                            class="text-xs px-3 py-1.5 rounded-lg border text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                                            matTooltip="Set every line's received qty to its outstanding qty">
                                        Receive all
                                    </button>
                                    <button type="button" (click)="clearAllReceived()"
                                            class="text-xs px-3 py-1.5 rounded-lg border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            matTooltip="Reset every line's received qty to zero">
                                        Clear
                                    </button>
                                    <span class="text-xs text-gray-500 ml-2">{{ optionalHint() }}</span>
                                </div>
                            </div>

                            <div class="divide-y divide-gray-200 dark:divide-gray-700">
                                <div *ngFor="let l of lines()" class="p-6">
                                    <div class="flex items-center justify-between mb-3">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ l.productName }}</span>
                                            <span class="text-xs text-gray-500 font-mono">{{ l.sku }} · outstanding {{ l.outstanding | number:'1.0-3' }} &#64; {{ l.unitCost | number:'1.2-2' }}</span>
                                        </div>
                                    </div>
                                    <div class="flex flex-wrap items-start gap-x-6 gap-y-3">
                                        <!-- Received qty stepper -->
                                        <div class="flex items-center gap-2">
                                            <span class="text-xs text-gray-500 w-20">Received</span>
                                            <button type="button" (click)="nudgeReceived(l, -1)" [disabled]="l.quantityReceived <= 0"
                                                    class="w-7 h-7 flex items-center justify-center rounded border text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                                    aria-label="Decrease quantity">
                                                <mat-icon class="icon-size-4">remove</mat-icon>
                                            </button>
                                            <input type="number" min="0" step="0.001" [max]="l.outstanding"
                                                   [(ngModel)]="l.quantityReceived"
                                                   class="w-20 h-7 border rounded px-1 text-right tabular-nums"
                                                   [class.!border-rose-400]="l.quantityReceived > l.outstanding"
                                                   [class.!text-rose-600]="l.quantityReceived > l.outstanding"
                                                   [matTooltip]="l.quantityReceived > l.outstanding ? ('Exceeds outstanding ' + l.outstanding) : ''" />
                                            <button type="button" (click)="nudgeReceived(l, 1)" [disabled]="l.quantityReceived >= l.outstanding"
                                                    class="w-7 h-7 flex items-center justify-center rounded border text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                                    aria-label="Increase quantity">
                                                <mat-icon class="icon-size-4">add</mat-icon>
                                            </button>
                                            <button type="button" (click)="receiveAll(l)" [disabled]="l.quantityReceived === l.outstanding"
                                                    class="text-xs h-7 px-2 rounded border text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-40"
                                                    matTooltip="Receive full outstanding">
                                                All
                                            </button>
                                        </div>

                                        <!-- Override unit cost — inline to match the stepper height -->
                                        <div class="flex items-center gap-2">
                                            <span class="text-xs text-gray-500">Cost</span>
                                            <input type="number" min="0" step="0.01" [(ngModel)]="l.overrideUnitCost"
                                                   [placeholder]="(l.unitCost | number:'1.2-2') ?? ''"
                                                   class="w-24 h-7 border rounded px-2 text-right tabular-nums"
                                                   [matTooltip]="'PO unit cost ' + (l.unitCost | number:'1.2-2') + ' — leave blank to use PO price'" />
                                            <span class="text-[11px] text-gray-400" *ngIf="l.overrideUnitCost == null">(PO {{ l.unitCost | number:'1.2-2' }})</span>
                                        </div>

                                        @if (l.requiresBatch) {
                                            <div class="flex items-center gap-2">
                                                <span class="text-xs text-gray-500">Batch <span class="text-rose-600">*</span></span>
                                                <input type="text" [(ngModel)]="l.batchNumber"
                                                       placeholder="Batch #"
                                                       class="w-32 h-7 border rounded px-2 tabular-nums"
                                                       [class.!border-rose-400]="!l.batchNumber.trim()" />
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <span class="text-xs text-gray-500">Expiry</span>
                                                <!-- Native date input — same h-7 as the rest of the inline row so heights match. -->
                                                <input type="date"
                                                       [ngModel]="expiryDateIso(l)"
                                                       (ngModelChange)="setExpiryFromIso(l, $event)"
                                                       class="h-7 border rounded px-2 text-sm tabular-nums" />
                                            </div>
                                        }
                                        @if (l.requiresSerial && l.quantityReceived > 0) {
                                            @if (l.quantityReceived <= 5) {
                                                <!-- Small qty: N inline mini-inputs (h-7, same as siblings).
                                                     Stays on the same flex row as Received / Cost / Batch
                                                     instead of breaking to a full-width block.
                                                     Each input is one slot of the serials array. -->
                                                <div class="flex items-center gap-2 flex-wrap">
                                                    <span class="text-xs text-gray-500">
                                                        Serials <span class="text-rose-600">*</span>
                                                    </span>
                                                    @for (slot of serialSlots(l); track $index) {
                                                        <input type="text"
                                                               [value]="slot"
                                                               (input)="setSerialSlot(l, $index, $any($event.target).value)"
                                                               placeholder="SN / IMEI…"
                                                               class="w-44 h-7 border rounded px-2 text-sm font-mono"
                                                               [class.!border-rose-400]="!slot.trim()" />
                                                    }
                                                    <span class="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                                                          [ngClass]="serialMatches(l)
                                                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                                                              : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'">
                                                        <mat-icon class="icon-size-3.5">{{ serialMatches(l) ? 'check' : 'error' }}</mat-icon>
                                                        {{ serialCount(l) }} / {{ l.quantityReceived | number:'1.0-0' }}
                                                    </span>
                                                </div>
                                            } @else {
                                                <!-- Larger qty: bare compact textarea on its own row.
                                                     No mat-form-field wrapper to keep it tight; one line per serial. -->
                                                <div class="basis-full">
                                                    <label class="text-xs text-gray-500 block mb-1">
                                                        Serials <span class="text-rose-600">*</span>
                                                        <span class="text-gray-400">(one per line — paste {{ l.quantityReceived | number:'1.0-0' }} scanned values)</span>
                                                    </label>
                                                    <div class="flex items-start gap-2">
                                                        <textarea [rows]="serialRows(l)"
                                                                  [(ngModel)]="l.serialsText"
                                                                  placeholder="SN001&#10;SN002&#10;…"
                                                                  class="flex-1 max-w-xl border rounded px-2 py-1 text-sm font-mono"></textarea>
                                                        <span class="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 mt-1 flex-shrink-0"
                                                              [ngClass]="serialMatches(l)
                                                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                                                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'">
                                                            <mat-icon class="icon-size-3.5">{{ serialMatches(l) ? 'check' : 'error' }}</mat-icon>
                                                            {{ serialCount(l) }} / {{ l.quantityReceived | number:'1.0-0' }}
                                                        </span>
                                                    </div>
                                                </div>
                                            }
                                        }
                                    </div>
                                </div>
                            </div>
                            <div *ngIf="lines().length === 0" class="p-8 text-center text-sm text-gray-500">All lines on this PO have been fully received.</div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-6">
                        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
                            <div class="flex items-center space-x-3 mb-4">
                                <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center"><mat-icon class="text-emerald-600 dark:text-emerald-400 text-lg">summarize</mat-icon></div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Receipt Summary</h3>
                            </div>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Lines being received</span><span class="font-medium tabular-nums">{{ activeLineCount() }}</span></div>
                                <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Total quantity</span><span class="font-medium tabular-nums">{{ totalQty() | number:'1.0-3' }}</span></div>
                                <div class="flex justify-between text-base font-semibold pt-2 border-t border-gray-200 dark:border-gray-700"><span>Receipt cost</span><span class="tabular-nums">{{ totalCost() | number:'1.2-2' }}</span></div>
                            </div>
                            <mat-form-field appearance="outline" class="w-full mt-4">
                                <mat-label>Notes</mat-label>
                                <textarea matInput rows="3" [(ngModel)]="notes"></textarea>
                            </mat-form-field>
                            <button mat-flat-button color="primary" class="w-full h-12 rounded-lg shadow-lg mt-2"
                                    [disabled]="!canSubmit() || saving"
                                    (click)="save()">
                                <mat-icon class="icon-size-5 mr-2">check_circle</mat-icon><span>{{ saving ? 'Saving…' : 'Receive Goods' }}</span>
                            </button>
                            <p class="text-xs text-gray-500 mt-2" *ngIf="!canSubmit()">{{ disabledReason() }}</p>
                        </div>
                    </div>
                </div>
            </div>
        }
    </div>
</div>
    `,
})
export class GoodsReceiptFormComponent implements OnInit {
    private readonly api = inject(GoodsReceiptsService);
    private readonly poApi = inject(PurchaseOrdersService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly productsApi = inject(ProductsService);

    poId!: string;
    po = signal<PurchaseOrderDto | null>(null);
    lines = signal<GRLineDraft[]>([]);
    notes = '';
    saving = false;

    // NOTE: these read per-line fields mutated directly via two-way ngModel
    // binding (l.quantityReceived, l.serialsText, l.batchNumber, …). Direct
    // mutation does NOT invalidate the `lines` signal, so a `computed()`
    // would memoize a stale "false" the moment the form loaded. Plain methods
    // re-run on every change-detection tick (which ngModel triggers), so they
    // always see the latest typed values — that's why typing serials now
    // enables the Receive Goods button without an extra click.

    optionalHint(): string {
        const lines = this.lines();
        const bits: string[] = [];
        if (lines.some(l => l.requiresBatch)) bits.push('batch / expiry required on batch-tracked lines');
        if (lines.some(l => l.requiresSerial)) bits.push('serials required on serial-tracked lines (one per unit)');
        return bits.length ? ' ' + bits.join('; ') + '.' : '';
    }

    activeLineCount(): number { return this.lines().filter(l => l.quantityReceived > 0).length; }
    totalQty(): number { return this.lines().reduce((s, l) => s + (Number(l.quantityReceived) || 0), 0); }
    totalCost(): number {
        return this.lines().reduce((s, l) => {
            const q = Number(l.quantityReceived) || 0;
            const c = l.overrideUnitCost != null && Number(l.overrideUnitCost) >= 0 ? Number(l.overrideUnitCost) : l.unitCost;
            return s + q * c;
        }, 0);
    }

    /** Number of non-blank lines in the serials textarea — must equal quantityReceived for backend acceptance. */
    serialCount(line: GRLineDraft): number {
        return (line.serialsText ?? '').split(/\r?\n/).map(s => s.trim()).filter(s => s.length > 0).length;
    }
    serialMatches(line: GRLineDraft): boolean {
        return this.serialCount(line) === Math.floor(Number(line.quantityReceived) || 0);
    }
    /** Textarea height grows with qty up to a sensible cap so it doesn't dominate the row. */
    serialRows(line: GRLineDraft): number {
        const q = Math.floor(Number(line.quantityReceived) || 1);
        return Math.min(Math.max(q, 2), 4);
    }

    /**
     * Per-slot view of `serialsText` for the inline mini-input layout used at
     * small qty (≤ 5). Splits on newline, pads with empty strings up to qty.
     * Backend wants one serial per non-blank line, so we re-encode that way.
     */
    serialSlots(line: GRLineDraft): string[] {
        const qty = Math.max(1, Math.floor(Number(line.quantityReceived) || 0));
        const raw = (line.serialsText ?? '').split(/\r?\n/).map(s => s.trim());
        const out: string[] = [];
        for (let i = 0; i < qty; i++) out.push(raw[i] ?? '');
        return out;
    }
    setSerialSlot(line: GRLineDraft, index: number, value: string): void {
        const slots = this.serialSlots(line);
        slots[index] = (value ?? '').replace(/\r?\n/g, '');
        // Re-encode: keep blanks during typing so the input order stays stable,
        // but `serialCount()` (which filters non-blanks) will still report correctly.
        line.serialsText = slots.join('\n');
        this.lines.set([...this.lines()]);
    }

    /** Native <input type="date"> wants `YYYY-MM-DD`; our state holds a `Date | null`. */
    expiryDateIso(line: GRLineDraft): string {
        if (!line.expiryDate) return '';
        const d = line.expiryDate instanceof Date ? line.expiryDate : new Date(line.expiryDate);
        if (Number.isNaN(d.getTime())) return '';
        const y = d.getFullYear();
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
    setExpiryFromIso(line: GRLineDraft, iso: string): void {
        line.expiryDate = iso ? new Date(iso + 'T00:00:00') : null;
        this.lines.set([...this.lines()]);
    }

    canSubmit(): boolean {
        const active = this.lines().filter(l => l.quantityReceived > 0);
        if (active.length === 0) return false;
        if (!active.every(l => l.quantityReceived <= l.outstanding)) return false;
        // Batch-tracked products need a batch number — server rejects without it.
        if (active.some(l => l.requiresBatch && !l.batchNumber.trim())) return false;
        // Serial-tracked products need EXACTLY one serial per unit received —
        // server enforces strict count equality (CreateGoodsReceiptRequestHandler).
        if (active.some(l => l.requiresSerial && !this.serialMatches(l))) return false;
        return true;
    }

    disabledReason(): string {
        if (this.activeLineCount() === 0) return 'Set received quantity on at least one line.';
        const active = this.lines().filter(l => l.quantityReceived > 0);
        if (active.some(l => l.quantityReceived > l.outstanding))
            return 'Some lines exceed outstanding quantity.';
        if (active.some(l => l.requiresBatch && !l.batchNumber.trim()))
            return 'Batch number required on batch-tracked lines.';
        if (active.some(l => l.requiresSerial && !this.serialMatches(l)))
            return 'Serial-tracked lines need exactly one serial number per received unit.';
        return '';
    }

    ngOnInit(): void {
        this.poId = this.route.snapshot.paramMap.get('poId')!;
        this.poApi.get(this.poId).subscribe(p => {
            this.po.set(p);
            const drafts = p.items
                .filter(i => i.quantityOutstanding > 0)
                .map<GRLineDraft>(i => ({
                    purchaseOrderItemId: i.id,
                    productId: i.productId,
                    productName: i.productName,
                    sku: i.sku,
                    outstanding: i.quantityOutstanding,
                    unitCost: i.unitCost,
                    quantityReceived: i.quantityOutstanding,
                    overrideUnitCost: null,
                    serialsText: '',
                    batchNumber: '',
                    expiryDate: null,
                    requiresSerial: false,
                    requiresBatch: false,
                }));
            this.lines.set(drafts);
            // Stamp per-product flags so each line knows whether to render
            // Batch/Expiry or Serials inputs. One catalog fetch covers every
            // line on the PO.
            if (drafts.length > 0) {
                this.productsApi.getAll().subscribe(products => {
                    const byId = new Map(products.map(pr => [pr.id, pr] as const));
                    this.lines.update(ls => ls.map(l => {
                        const pr = byId.get(l.productId);
                        return pr
                            ? { ...l, requiresSerial: !!pr.requiresSerial, requiresBatch: !!pr.requiresBatch }
                            : l;
                    }));
                });
            }
        });
    }

    nudgeReceived(line: GRLineDraft, delta: number): void {
        const next = Math.max(0, Math.min(line.outstanding, Number(line.quantityReceived || 0) + delta));
        line.quantityReceived = next;
        this.lines.set([...this.lines()]);
    }

    receiveAll(line: GRLineDraft): void {
        line.quantityReceived = line.outstanding;
        this.lines.set([...this.lines()]);
    }

    receiveAllLines(): void {
        this.lines.update(ls => ls.map(l => ({ ...l, quantityReceived: l.outstanding })));
    }

    clearAllReceived(): void {
        this.lines.update(ls => ls.map(l => ({ ...l, quantityReceived: 0 })));
    }

    save(): void {
        if (!this.canSubmit()) return;
        this.saving = true;
        const payload: CreateGoodsReceiptLine[] = this.lines()
            .filter(l => l.quantityReceived > 0)
            .map(l => {
                const serials = l.serialsText
                    .split(/\r?\n/)
                    .map(s => s.trim())
                    .filter(s => s.length > 0);
                return {
                    purchaseOrderItemId: l.purchaseOrderItemId,
                    quantityReceived: Number(l.quantityReceived),
                    unitCost: l.overrideUnitCost != null && Number(l.overrideUnitCost) >= 0
                        ? Number(l.overrideUnitCost)
                        : undefined,
                    serialNumbers: serials.length > 0 ? serials : undefined,
                    batchNumber: l.batchNumber?.trim() || undefined,
                    expiryDate: l.expiryDate ? l.expiryDate.toISOString() : undefined,
                };
            });
        this.api.create({
            purchaseOrderId: this.poId,
            lines: payload,
            notes: this.notes || undefined,
        }).subscribe({
            next: id => { this.saving = false; this.router.navigate(['/goods-receipts', id]); },
            error: () => { this.saving = false; },
        });
    }
}
