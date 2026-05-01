import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ShiftsService } from 'app/core/sales/shifts.service';
import { ShiftReportDto } from 'app/core/sales/shifts.types';

/**
 * X-report (open shift live snapshot) and Z-report (closed shift permanent
 * record). Same endpoint, the server sets reportType. Page layout is
 * print-friendly — `@media print` removes app chrome and uses a fixed-width
 * monospace block so the receipt printer (or A4 printer) renders cleanly.
 */
@Component({
    selector: 'app-shift-report',
    standalone: true,
    imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
    template: `
@if (report(); as r) {
    <div class="flex flex-col flex-auto min-w-0 bg-gray-100 dark:bg-gray-900 print:bg-white">
        <!-- App chrome (hidden on print) -->
        <div class="print:hidden flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div class="flex items-center gap-3">
                <div class="flex items-center justify-center w-10 h-10 rounded-lg shadow"
                     [class.bg-emerald-600]="r.reportType === 'Z'"
                     [class.bg-blue-600]="r.reportType === 'X'">
                    <mat-icon class="text-white">summarize</mat-icon>
                </div>
                <div>
                    <h2 class="text-2xl font-bold">{{ r.reportType }}-Report</h2>
                    <p class="text-sm text-gray-500">{{ r.outletName }} ({{ r.outletCode }}) · Shift opened {{ r.openedAt | date:'medium' }}</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button mat-stroked-button (click)="print()"><mat-icon class="icon-size-5 mr-1">print</mat-icon>Print</button>
                <button mat-stroked-button routerLink="/shifts"><mat-icon class="icon-size-5 mr-1">arrow_back</mat-icon>Back</button>
            </div>
        </div>

        <!-- Printable area -->
        <div class="flex-auto p-4 sm:p-8 print:p-0">
            <div class="max-w-2xl mx-auto bg-white dark:bg-gray-800 print:bg-white rounded-lg shadow print:shadow-none p-6 print:p-4 font-mono text-sm">
                <div class="text-center mb-3">
                    <h1 class="text-xl font-bold tracking-wide">{{ r.outletName }}</h1>
                    <div class="text-xs text-gray-500">{{ r.outletCode }}</div>
                </div>

                <div class="text-center my-3 py-2 border-y-2 border-gray-300 dark:border-gray-600 print:border-black">
                    <div class="text-2xl font-bold tracking-wider">{{ r.reportType }}-REPORT</div>
                    <div class="text-xs">{{ r.reportType === 'X' ? 'Live snapshot · shift still open' : 'Permanent record · shift closed' }}</div>
                </div>

                <table class="w-full text-xs mb-3">
                    <tr><td class="text-gray-500">Shift opened</td><td class="text-right">{{ r.openedAt | date:'short' }}</td></tr>
                    <tr *ngIf="r.closedAt"><td class="text-gray-500">Shift closed</td><td class="text-right">{{ r.closedAt | date:'short' }}</td></tr>
                    <tr><td class="text-gray-500">Printed</td><td class="text-right">{{ r.printedAt | date:'short' }}</td></tr>
                    <tr><td class="text-gray-500">Status</td><td class="text-right font-semibold">{{ r.status }}</td></tr>
                </table>

                <h3 class="font-bold mt-4 mb-1 border-b border-dashed border-gray-400">Sales</h3>
                <table class="w-full">
                    <tr><td>Finalized sales</td><td class="text-right">{{ r.salesCount }}</td></tr>
                    <tr *ngIf="r.voidedCount > 0"><td>Voided sales</td><td class="text-right">{{ r.voidedCount }}</td></tr>
                    <tr><td>Gross subtotal</td><td class="text-right">{{ r.grossSubtotal | number:'1.2-2' }}</td></tr>
                    <tr *ngIf="r.totalDiscount > 0"><td>Discount</td><td class="text-right">−{{ r.totalDiscount | number:'1.2-2' }}</td></tr>
                    <tr *ngIf="r.totalTax > 0"><td>Tax</td><td class="text-right">{{ r.totalTax | number:'1.2-2' }}</td></tr>
                    <tr class="font-bold border-t border-gray-400"><td>Net total</td><td class="text-right">{{ r.netTotal | number:'1.2-2' }}</td></tr>
                </table>

                @if (r.returnsCount > 0) {
                    <h3 class="font-bold mt-4 mb-1 border-b border-dashed border-gray-400">Returns / Refunds</h3>
                    <table class="w-full">
                        <tr><td>Returns processed</td><td class="text-right">{{ r.returnsCount }}</td></tr>
                        <tr><td>Total refunded</td><td class="text-right">−{{ r.refundsTotal | number:'1.2-2' }}</td></tr>
                    </table>
                }

                @if (r.byPaymentMethod.length > 0) {
                    <h3 class="font-bold mt-4 mb-1 border-b border-dashed border-gray-400">Payment Methods</h3>
                    <table class="w-full">
                        @for (p of r.byPaymentMethod; track p.method) {
                            <tr><td>{{ p.method }} ({{ p.count }})</td><td class="text-right">{{ p.total | number:'1.2-2' }}</td></tr>
                        }
                    </table>
                }

                <h3 class="font-bold mt-4 mb-1 border-b border-dashed border-gray-400">Cash Drawer</h3>
                <table class="w-full">
                    <tr><td>Opening float</td><td class="text-right">{{ r.openingFloat | number:'1.2-2' }}</td></tr>
                    <tr *ngIf="r.expectedCash != null"><td>+ Cash sales</td><td class="text-right">{{ r.expectedCash | number:'1.2-2' }}</td></tr>
                    <tr *ngIf="r.expectedCash != null" class="border-t border-dashed">
                        <td>Expected drawer</td>
                        <td class="text-right">{{ r.openingFloat + (r.expectedCash || 0) | number:'1.2-2' }}</td>
                    </tr>
                    <tr *ngIf="r.closingFloat != null"><td>Counted closing</td><td class="text-right">{{ r.closingFloat | number:'1.2-2' }}</td></tr>
                    <tr *ngIf="r.variance != null" class="font-bold"
                        [class.text-rose-700]="(r.variance ?? 0) < 0"
                        [class.text-emerald-700]="(r.variance ?? 0) > 0">
                        <td>Variance</td>
                        <td class="text-right">{{ (r.variance ?? 0) > 0 ? '+' : '' }}{{ r.variance | number:'1.2-2' }}</td>
                    </tr>
                </table>

                @if (r.topItems.length > 0) {
                    <h3 class="font-bold mt-4 mb-1 border-b border-dashed border-gray-400">Top Items (by revenue)</h3>
                    <table class="w-full">
                        @for (t of r.topItems; track t.sku) {
                            <tr>
                                <td class="text-xs">{{ t.productName }}<br><span class="text-gray-500">{{ t.sku }} · {{ t.quantity | number:'1.0-3' }} units</span></td>
                                <td class="text-right align-top">{{ t.revenue | number:'1.2-2' }}</td>
                            </tr>
                        }
                    </table>
                }

                @if (r.notes) {
                    <h3 class="font-bold mt-4 mb-1 border-b border-dashed border-gray-400">Notes</h3>
                    <div class="text-xs whitespace-pre-line">{{ r.notes }}</div>
                }

                <div class="text-center mt-6 pt-3 border-t-2 border-gray-300 dark:border-gray-600 print:border-black text-xs text-gray-500">
                    @if (r.reportType === 'Z') {
                        END OF SHIFT — Z-report archived
                    } @else {
                        Live snapshot · shift remains open
                    }
                </div>
            </div>
        </div>
    </div>
}
    `,
    styles: [`
        @media print {
            :host { display: block; }
            .print\\:hidden { display: none !important; }
            .print\\:p-0 { padding: 0 !important; }
            .print\\:p-4 { padding: 1rem !important; }
            .print\\:bg-white { background: white !important; }
            .print\\:shadow-none { box-shadow: none !important; }
            .print\\:border-black { border-color: black !important; }
            @page { margin: 1cm; }
        }
    `],
})
export class ShiftReportComponent implements OnInit {
    private readonly api = inject(ShiftsService);
    private readonly route = inject(ActivatedRoute);
    report = signal<ShiftReportDto | null>(null);

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id')!;
        this.api.report(id).subscribe(r => this.report.set(r));
    }

    print(): void { window.print(); }
}
