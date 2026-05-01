import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { StockCountsService } from 'app/core/inventory/inventory.service';
import { StockCountDto } from 'app/core/inventory/inventory.types';

@Component({
    selector: 'app-stock-count-detail',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        MatButtonModule, MatFormFieldModule, MatIconModule,
        MatInputModule, MatSnackBarModule, MatTableModule, MatTooltipModule,
    ],
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div></div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg"><mat-icon class="text-white">fact_check</mat-icon></div>
                <div *ngIf="count() as c">
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate font-mono">{{ c.countNumber }}</h2>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {{ c.scope }} · started {{ c.startedAt | date:'short' }}
                        <span class="ml-2 inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                              [class.bg-amber-100]="c.status === 'InProgress'" [class.text-amber-800]="c.status === 'InProgress'"
                              [class.bg-emerald-100]="c.status === 'Completed'" [class.text-emerald-800]="c.status === 'Completed'"
                              [class.bg-rose-100]="c.status === 'Cancelled'" [class.text-rose-800]="c.status === 'Cancelled'">
                            {{ c.status }}
                        </span>
                    </p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button mat-stroked-button class="h-12 px-4 rounded-lg" routerLink="/stock-counts">
                    <mat-icon class="icon-size-5 mr-1">arrow_back</mat-icon><span>Back</span>
                </button>
                @if (count()?.status === 'InProgress') {
                    <button mat-stroked-button color="warn" class="h-12 px-4 rounded-lg" (click)="cancel()" [disabled]="busy">
                        <mat-icon class="icon-size-5 mr-1">cancel</mat-icon><span>Cancel</span>
                    </button>
                    <button mat-flat-button color="primary" class="h-12 px-4 rounded-lg shadow-lg" (click)="complete()" [disabled]="busy">
                        <mat-icon class="icon-size-5 mr-1">check_circle</mat-icon><span>{{ busy ? 'Posting…' : 'Complete & Post Variances' }}</span>
                    </button>
                }
            </div>
        </div>

        <div class="flex-auto p-4 sm:p-6 space-y-4" *ngIf="count() as c">
            <!-- summary cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div class="text-xs text-gray-500 uppercase tracking-wider">Lines</div>
                    <div class="text-2xl font-bold mt-1">{{ c.lineCount }}</div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div class="text-xs text-gray-500 uppercase tracking-wider">Counted</div>
                    <div class="text-2xl font-bold mt-1">{{ c.countedLines }} / {{ c.lineCount }}</div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div class="text-xs text-gray-500 uppercase tracking-wider">|Total Variance|</div>
                    <div class="text-2xl font-bold mt-1">{{ c.totalAbsVariance | number:'1.0-3' }}</div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div class="text-xs text-gray-500 uppercase tracking-wider">Lines w/ Variance</div>
                    <div class="text-2xl font-bold mt-1">{{ varianceLines() }}</div>
                </div>
            </div>

            <!-- filter bar -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1">
                    <mat-label>Search SKU or product</mat-label>
                    <input matInput [ngModel]="search()" (ngModelChange)="search.set($event)">
                </mat-form-field>
                <button mat-stroked-button (click)="hideCounted.set(!hideCounted())" [class.!bg-emerald-50]="hideCounted()">
                    <mat-icon class="icon-size-5 mr-1">{{ hideCounted() ? 'visibility_off' : 'visibility' }}</mat-icon>
                    {{ hideCounted() ? 'Showing uncounted only' : 'Show all' }}
                </button>
            </div>

            <!-- lines table -->
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="overflow-x-auto">
                    <table mat-table [dataSource]="visibleLines()" class="w-full">
                        <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef class="pl-4 sm:pl-6"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</span></th>
                            <td mat-cell *matCellDef="let l" class="pl-4 sm:pl-6 font-mono">{{ l.sku }}</td></ng-container>
                        <ng-container matColumnDef="product"><th mat-header-cell *matHeaderCellDef><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Product</span></th>
                            <td mat-cell *matCellDef="let l">{{ l.productName }}</td></ng-container>
                        <ng-container matColumnDef="expected"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">System</span></th>
                            <td mat-cell *matCellDef="let l" class="!text-right">{{ l.expectedQty | number:'1.0-3' }}</td></ng-container>
                        <ng-container matColumnDef="counted"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Counted</span></th>
                            <td mat-cell *matCellDef="let l" class="!text-right">
                                @if (count()?.status === 'InProgress') {
                                    <input type="number" min="0" step="0.001"
                                           class="w-24 text-right border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-900"
                                           [ngModel]="draft[l.id] ?? l.countedQty"
                                           (ngModelChange)="draft[l.id] = $event"
                                           (blur)="recordIfChanged(l)">
                                } @else {
                                    {{ l.countedQty != null ? (l.countedQty | number:'1.0-3') : '—' }}
                                }
                            </td></ng-container>
                        <ng-container matColumnDef="variance"><th mat-header-cell *matHeaderCellDef class="!text-right"><span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Δ</span></th>
                            <td mat-cell *matCellDef="let l" class="!text-right font-semibold"
                                [class.text-emerald-700]="l.hasCount && l.variance > 0"
                                [class.text-rose-700]="l.hasCount && l.variance < 0"
                                [class.text-gray-400]="!l.hasCount">
                                @if (l.hasCount) {
                                    {{ l.variance > 0 ? '+' : '' }}{{ l.variance | number:'1.0-3' }}
                                } @else { — }
                            </td></ng-container>
                        <tr mat-header-row *matHeaderRowDef="cols" class="bg-gray-50 dark:bg-gray-700"></tr>
                        <tr mat-row *matRowDef="let row; columns: cols"></tr>
                    </table>
                </div>
                <div *ngIf="visibleLines().length === 0" class="p-8 text-center text-sm text-gray-500">No lines match your filter.</div>
            </div>

            <p *ngIf="c.notes" class="text-sm text-gray-600 dark:text-gray-400">Notes: {{ c.notes }}</p>
        </div>
    </div>
</div>
    `,
})
export class StockCountDetailComponent implements OnInit {
    private readonly api = inject(StockCountsService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly snack = inject(MatSnackBar);
    private readonly confirm = inject(FuseConfirmationService);

    count = signal<StockCountDto | null>(null);
    draft: Record<string, number> = {};
    search = signal('');
    hideCounted = signal(false);
    busy = false;
    cols = ['sku', 'product', 'expected', 'counted', 'variance'];

    visibleLines = computed(() => {
        const c = this.count();
        if (!c) return [];
        const q = this.search().trim().toLowerCase();
        const hide = this.hideCounted();
        return c.lines.filter(l => {
            if (hide && l.hasCount) return false;
            if (!q) return true;
            return l.productName.toLowerCase().includes(q) || l.sku.toLowerCase().includes(q);
        });
    });

    varianceLines = computed(() => this.count()?.lines.filter(l => l.hasCount && l.variance !== 0).length ?? 0);

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) this.reload(id);
    }

    private reload(id: string): void {
        this.api.get(id).subscribe(c => this.count.set(c));
    }

    recordIfChanged(line: any): void {
        const c = this.count();
        if (!c || c.status !== 'InProgress') return;
        const next = this.draft[line.id];
        if (next == null || isNaN(Number(next))) return;
        if (next === line.countedQty) return;
        this.api.recordLine(c.id, { countId: c.id, lineId: line.id, countedQty: Number(next) }).subscribe({
            next: () => this.reload(c.id),
            error: err => {
                const msg = err?.error?.exception ?? err?.error?.title ?? err?.message ?? 'Could not record count';
                this.snack.open(msg, 'OK', { duration: 5000 });
            },
        });
    }

    complete(): void {
        const c = this.count();
        if (!c) return;
        const variance = c.lines.filter(l => l.hasCount && l.variance !== 0).length;
        const uncounted = c.lineCount - c.countedLines;
        const ref = this.confirm.open({
            title: 'Complete count?',
            message: `${variance} line(s) will post adjustments. ${uncounted} uncounted line(s) keep their system qty (no adjustment).`,
            actions: { confirm: { label: 'Complete' } },
        });
        ref.afterClosed().subscribe(result => {
            if (result !== 'confirmed') return;
            this.busy = true;
            this.api.complete(c.id).subscribe({
                next: () => { this.busy = false; this.reload(c.id); this.snack.open('Count completed and variances posted.', 'OK', { duration: 4000 }); },
                error: err => {
                    this.busy = false;
                    const msg = err?.error?.exception ?? err?.error?.title ?? err?.message ?? 'Could not complete count';
                    this.snack.open(msg, 'OK', { duration: 6000 });
                },
            });
        });
    }

    cancel(): void {
        const c = this.count();
        if (!c) return;
        const ref = this.confirm.open({
            title: 'Cancel count?',
            message: 'No adjustments will be posted. The count will be marked Cancelled.',
            actions: { confirm: { label: 'Cancel count', color: 'warn' } },
        });
        ref.afterClosed().subscribe(result => {
            if (result !== 'confirmed') return;
            this.busy = true;
            this.api.cancel(c.id).subscribe({
                next: () => { this.busy = false; this.router.navigate(['/stock-counts']); },
                error: err => {
                    this.busy = false;
                    const msg = err?.error?.exception ?? err?.error?.title ?? err?.message ?? 'Could not cancel count';
                    this.snack.open(msg, 'OK', { duration: 6000 });
                },
            });
        });
    }
}
