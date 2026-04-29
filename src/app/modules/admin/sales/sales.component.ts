import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { Router, RouterModule } from '@angular/router';
import { SalesService } from 'app/core/sales/sales.service';
import { SaleDto } from 'app/core/sales/sales.types';

@Component({
    selector: 'app-sales',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule, RouterModule],
    template: `
        <div class="p-6">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-semibold">Sales</h2>
                <button mat-raised-button color="primary" routerLink="/pos">
                    <mat-icon>point_of_sale</mat-icon> Open POS
                </button>
            </div>
            <table mat-table [dataSource]="rows()" class="w-full">
                <ng-container matColumnDef="invoice"><th mat-header-cell *matHeaderCellDef>Invoice</th>
                    <td mat-cell *matCellDef="let r">{{ r.invoiceNumber }}</td></ng-container>
                <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let r">{{ r.saleDate | date:'short' }}</td></ng-container>
                <ng-container matColumnDef="customer"><th mat-header-cell *matHeaderCellDef>Customer</th>
                    <td mat-cell *matCellDef="let r">{{ r.customerName || 'Walk-in' }}</td></ng-container>
                <ng-container matColumnDef="items"><th mat-header-cell *matHeaderCellDef>Items</th>
                    <td mat-cell *matCellDef="let r">{{ r.items.length }}</td></ng-container>
                <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef class="text-right">Total</th>
                    <td mat-cell *matCellDef="let r" class="text-right">{{ r.total | number:'1.2-2' }}</td></ng-container>
                <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let r">
                        <mat-chip [color]="r.status === 'Voided' ? 'warn' : 'primary'">{{ r.status }}</mat-chip>
                    </td></ng-container>
                <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef></th>
                    <td mat-cell *matCellDef="let r">
                        <button mat-icon-button (click)="view(r)"><mat-icon>visibility</mat-icon></button>
                    </td></ng-container>
                <tr mat-header-row *matHeaderRowDef="cols"></tr>
                <tr mat-row *matRowDef="let row; columns: cols"></tr>
            </table>
        </div>
    `,
})
export class SalesComponent implements OnInit {
    private readonly api = inject(SalesService);
    private readonly router = inject(Router);
    rows = signal<SaleDto[]>([]);
    cols = ['invoice', 'date', 'customer', 'items', 'total', 'status', 'actions'];

    ngOnInit(): void { this.api.getAll({ take: 200 }).subscribe(d => this.rows.set(d)); }
    view(r: SaleDto): void { this.router.navigate(['/sales', r.id]); }
}

@Component({
    selector: 'app-sale-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule, RouterModule],
    template: `
        @if (sale()) {
            <div class="p-6 max-w-4xl mx-auto">
                <button mat-button routerLink="/sales"><mat-icon>arrow_back</mat-icon> Back</button>
                <div class="flex items-center justify-between mt-2 mb-4">
                    <div>
                        <h2 class="text-2xl font-semibold">{{ sale()!.invoiceNumber }}</h2>
                        <div class="text-gray-500 text-sm">{{ sale()!.saleDate | date:'medium' }}</div>
                    </div>
                    <mat-chip [color]="sale()!.status === 'Voided' ? 'warn' : 'primary'">{{ sale()!.status }}</mat-chip>
                </div>

                <div class="mb-4 text-sm">
                    <div><strong>Customer:</strong> {{ sale()!.customerName || 'Walk-in' }} {{ sale()!.customerPhone ? '(' + sale()!.customerPhone + ')' : '' }}</div>
                </div>

                <h3 class="font-semibold mb-2">Items</h3>
                <table mat-table [dataSource]="sale()!.items" class="w-full mb-4">
                    <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef>SKU</th>
                        <td mat-cell *matCellDef="let i">{{ i.sku }}</td></ng-container>
                    <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Product</th>
                        <td mat-cell *matCellDef="let i">{{ i.productName }}<span *ngIf="i.serialNumber" class="text-xs text-gray-500"> [{{ i.serialNumber }}]</span></td></ng-container>
                    <ng-container matColumnDef="qty"><th mat-header-cell *matHeaderCellDef class="text-right">Qty</th>
                        <td mat-cell *matCellDef="let i" class="text-right">{{ i.quantity | number:'1.0-3' }}</td></ng-container>
                    <ng-container matColumnDef="unit"><th mat-header-cell *matHeaderCellDef class="text-right">Unit</th>
                        <td mat-cell *matCellDef="let i" class="text-right">{{ i.unitPrice | number:'1.2-2' }}</td></ng-container>
                    <ng-container matColumnDef="discount"><th mat-header-cell *matHeaderCellDef class="text-right">Discount</th>
                        <td mat-cell *matCellDef="let i" class="text-right">{{ i.discountAmount | number:'1.2-2' }}</td></ng-container>
                    <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef class="text-right">Line Total</th>
                        <td mat-cell *matCellDef="let i" class="text-right font-semibold">{{ i.lineTotal | number:'1.2-2' }}</td></ng-container>
                    <tr mat-header-row *matHeaderRowDef="['sku','name','qty','unit','discount','total']"></tr>
                    <tr mat-row *matRowDef="let row; columns: ['sku','name','qty','unit','discount','total']"></tr>
                </table>

                <div class="space-y-1 max-w-xs ml-auto text-sm">
                    <div class="flex justify-between"><span>Subtotal</span><span>{{ sale()!.subTotal | number:'1.2-2' }}</span></div>
                    <div class="flex justify-between"><span>Discount</span><span>−{{ sale()!.discountAmount | number:'1.2-2' }}</span></div>
                    <div class="flex justify-between"><span>Tax</span><span>{{ sale()!.taxAmount | number:'1.2-2' }}</span></div>
                    <div class="flex justify-between text-lg font-bold border-t pt-1"><span>Total</span><span>{{ sale()!.total | number:'1.2-2' }}</span></div>
                    <div class="flex justify-between"><span>Paid</span><span>{{ sale()!.paidAmount | number:'1.2-2' }}</span></div>
                    <div class="flex justify-between"><span>Balance</span><span>{{ sale()!.balance | number:'1.2-2' }}</span></div>
                </div>

                <h3 class="font-semibold mt-4 mb-2">Payments</h3>
                <table mat-table [dataSource]="sale()!.payments" class="w-full">
                    <ng-container matColumnDef="method"><th mat-header-cell *matHeaderCellDef>Method</th>
                        <td mat-cell *matCellDef="let p">{{ p.method }}</td></ng-container>
                    <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef class="text-right">Amount</th>
                        <td mat-cell *matCellDef="let p" class="text-right">{{ p.amount | number:'1.2-2' }}</td></ng-container>
                    <ng-container matColumnDef="ref"><th mat-header-cell *matHeaderCellDef>Reference</th>
                        <td mat-cell *matCellDef="let p">{{ p.reference || '-' }}</td></ng-container>
                    <ng-container matColumnDef="paid"><th mat-header-cell *matHeaderCellDef>Paid On</th>
                        <td mat-cell *matCellDef="let p">{{ p.paidOn | date:'short' }}</td></ng-container>
                    <tr mat-header-row *matHeaderRowDef="['method','amount','ref','paid']"></tr>
                    <tr mat-row *matRowDef="let row; columns: ['method','amount','ref','paid']"></tr>
                </table>

                <div class="mt-6">
                    <button mat-stroked-button color="warn" [routerLink]="['/returns/new', sale()!.id]"
                            *ngIf="sale()!.status === 'Finalized'">
                        <mat-icon>undo</mat-icon> Process Return
                    </button>
                </div>
            </div>
        }
    `,
})
export class SaleDetailComponent implements OnInit {
    private readonly api = inject(SalesService);
    sale = signal<SaleDto | null>(null);

    ngOnInit(): void {
        const id = location.pathname.split('/').pop()!;
        this.api.get(id).subscribe(s => this.sale.set(s));
    }
}
