import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ProductsService } from 'app/core/catalog/catalog.service';
import { ProductDto } from 'app/core/catalog/catalog.types';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletDto } from 'app/core/outlets/outlets.types';
import { CurrentOutletService } from 'app/core/outlets/current-outlet.service';
import { ShiftsService } from 'app/core/sales/shifts.service';
import { ShiftDto } from 'app/core/sales/shifts.types';
import { RouterModule } from '@angular/router';
import { ReceiptPrintService } from 'app/core/sales/receipt-print.service';
import { CustomersService, SalesService } from 'app/core/sales/sales.service';
import { CreateSaleLine, CreateSalePayment, CustomerDto, PaymentMethod, SaleDto } from 'app/core/sales/sales.types';
import { PromotionsService } from 'app/core/marketing/marketing.service';
import { PromotionDiscountPreview } from 'app/core/marketing/marketing.types';
import { SaleLookupDialogComponent } from './sale-lookup-dialog.component';

interface CartLine extends CreateSaleLine {
    productName: string;
    sku: string;
    taxRate: number;
}

@Component({
    selector: 'app-pos',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        MatButtonModule, MatCardModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatSelectModule, MatSnackBarModule, MatTableModule, MatChipsModule, MatTooltipModule,
    ],
    template: `
        <div class="flex flex-col lg:flex-row gap-4 p-4 h-full">
            <!-- Left: product picker -->
            <div class="lg:w-1/2 flex flex-col gap-3">
                <mat-card class="!p-3">
                    <div class="flex items-center gap-3">
                        <mat-form-field appearance="outline" class="flex-1 !my-0">
                            <mat-label>Outlet</mat-label>
                            <mat-select [(ngModel)]="outletId" (ngModelChange)="onOutletChange()">
                                @for (o of outlets(); track o.id) {
                                    <mat-option [value]="o.id">{{ o.code }} — {{ o.name }}</mat-option>
                                }
                            </mat-select>
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="flex-1 !my-0">
                            <mat-label>Search SKU / name</mat-label>
                            <input matInput [(ngModel)]="search" placeholder="e.g. PARA, iPhone..." />
                        </mat-form-field>
                        <button mat-stroked-button class="!min-w-0 !px-3 h-14 self-center"
                                (click)="openSaleLookup()"
                                matTooltip="Find a previous sale and re-print the receipt">
                            <mat-icon class="icon-size-5">receipt_long</mat-icon>
                            <span class="hidden lg:inline ml-1">Find sale</span>
                        </button>
                    </div>
                    @if (currentShift(); as cs) {
                        <div class="mt-2 flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-xs">
                            <mat-icon class="icon-size-4 text-emerald-700 dark:text-emerald-300">play_circle</mat-icon>
                            <span class="text-emerald-700 dark:text-emerald-300">Shift open since {{ cs.openedAt | date:'shortTime' }} · float {{ cs.openingFloat | number:'1.2-2' }}</span>
                            <a class="ml-auto text-blue-600 hover:underline cursor-pointer" routerLink="/shifts">Manage</a>
                        </div>
                    } @else {
                        <div class="mt-2 flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs">
                            <mat-icon class="icon-size-4 text-amber-700 dark:text-amber-300">info</mat-icon>
                            <span class="text-amber-700 dark:text-amber-300">No shift open. Sales will record without shift attribution.</span>
                            <a class="ml-auto text-blue-600 hover:underline cursor-pointer" routerLink="/shifts">Open one</a>
                        </div>
                    }
                </mat-card>

                <mat-card class="flex-1 overflow-auto !p-2">
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                        @for (p of filteredProducts(); track p.id) {
                            <button class="border rounded p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                                    (click)="addToCart(p)">
                                <div class="font-medium text-sm">{{ p.name }}</div>
                                <div class="text-xs text-gray-500">{{ p.sku }}</div>
                                <div class="text-base font-semibold mt-1">{{ p.sellingPrice | number:'1.2-2' }}</div>
                            </button>
                        }
                    </div>
                    @if (filteredProducts().length === 0) {
                        <div class="text-center py-10 text-gray-500">No products. Create some in /catalog/products.</div>
                    }
                </mat-card>
            </div>

            <!-- Right: cart + payment -->
            <div class="lg:w-1/2 flex flex-col gap-3">
                <mat-card class="!p-3">
                    <h3 class="font-semibold mb-2">Customer</h3>
                    <div class="flex items-center gap-2">
                        <mat-form-field appearance="outline" class="flex-1 !my-0">
                            <mat-label>Customer (optional)</mat-label>
                            <mat-select [(ngModel)]="customerId" (ngModelChange)="onCustomerChange($event)">
                                <mat-option [value]="null">— Walk-in —</mat-option>
                                @for (c of customers(); track c.id) {
                                    <mat-option [value]="c.id">{{ c.name }}{{ c.phone ? ' (' + c.phone + ')' : '' }}</mat-option>
                                }
                            </mat-select>
                        </mat-form-field>
                    </div>
                    @if (selectedCustomer(); as c) {
                        @if (c.loyaltyPoints > 0) {
                            <div class="flex items-center gap-2 mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                <mat-icon class="icon-size-5 text-amber-600">stars</mat-icon>
                                <div class="flex flex-col flex-1">
                                    <span class="text-xs text-amber-700 dark:text-amber-300">Loyalty balance: <strong>{{ c.loyaltyPoints | number:'1.0-2' }}</strong> pts</span>
                                </div>
                                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="!my-0 w-32">
                                    <mat-label>Redeem</mat-label>
                                    <input matInput type="number" min="0" [max]="maxRedeemable()" step="1" [(ngModel)]="redeemPoints">
                                </mat-form-field>
                            </div>
                        }
                    }
                </mat-card>

                <mat-card class="flex-1 overflow-auto !p-2">
                    <h3 class="font-semibold px-1 mb-2">Cart ({{ cart().length }} items)</h3>
                    @if (cart().length === 0) {
                        <div class="text-center py-6 text-gray-500">Click a product on the left to add it.</div>
                    } @else {
                        <table class="w-full text-sm">
                            <thead class="border-b">
                                <tr>
                                    <th class="text-left px-1">Product</th>
                                    <th class="px-1 w-28">Qty</th>
                                    <th class="text-right px-1 w-20">Price</th>
                                    <th class="text-right px-1 w-24">Total</th>
                                    <th class="w-8"></th>
                                </tr>
                            </thead>
                            <tbody>
                                @for (line of cart(); track $index) {
                                    <tr class="border-b">
                                        <td class="px-1 py-2">
                                            <div class="font-medium">{{ line.productName }}</div>
                                            <div class="text-xs text-gray-500">{{ line.sku }}</div>
                                        </td>
                                        <td class="px-1">
                                            <div class="flex items-center justify-center gap-1">
                                                <button type="button"
                                                        (click)="nudgeQty(line, -1)"
                                                        [disabled]="line.quantity <= 1"
                                                        class="w-6 h-6 flex items-center justify-center rounded border text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                                        aria-label="Decrease quantity">
                                                    <mat-icon class="icon-size-4">remove</mat-icon>
                                                </button>
                                                <input type="number" min="1" step="0.01"
                                                       [(ngModel)]="line.quantity"
                                                       (ngModelChange)="recalc()"
                                                       class="w-12 border rounded px-1 py-0.5 text-right" />
                                                <button type="button"
                                                        (click)="nudgeQty(line, 1)"
                                                        class="w-6 h-6 flex items-center justify-center rounded border text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        aria-label="Increase quantity">
                                                    <mat-icon class="icon-size-4">add</mat-icon>
                                                </button>
                                            </div>
                                        </td>
                                        <td class="text-right px-1">
                                            <input type="number" min="0" step="0.01"
                                                   [(ngModel)]="line.unitPrice"
                                                   (ngModelChange)="recalc()"
                                                   class="w-full border rounded px-1 py-0.5 text-right" />
                                        </td>
                                        <td class="text-right px-1 font-semibold">{{ lineTotal(line) | number:'1.2-2' }}</td>
                                        <td>
                                            <button mat-icon-button (click)="removeLine($index)">
                                                <mat-icon>close</mat-icon>
                                            </button>
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    }
                </mat-card>

                <!-- Promo + totals -->
                <mat-card class="!p-3">
                    <div class="flex items-center gap-2 mb-3">
                        <mat-form-field appearance="outline" class="flex-1 !my-0">
                            <mat-label>Promo code</mat-label>
                            <input matInput [(ngModel)]="promoCode" />
                        </mat-form-field>
                        <button mat-stroked-button (click)="applyPromo()" [disabled]="!promoCode || cart().length === 0">
                            Apply
                        </button>
                        @if (promo()) {
                            <button mat-icon-button (click)="clearPromo()" title="Clear promo">
                                <mat-icon>close</mat-icon>
                            </button>
                        }
                    </div>
                    @if (promo()) {
                        <div class="text-sm" [class.text-green-600]="promo()!.eligible" [class.text-red-600]="!promo()!.eligible">
                            @if (promo()!.eligible) {
                                <mat-icon class="!text-base align-middle mr-1">check_circle</mat-icon>
                                {{ promo()!.code }}: −{{ promo()!.discountAmount | number:'1.2-2' }}
                            } @else {
                                <mat-icon class="!text-base align-middle mr-1">error</mat-icon>
                                {{ promo()!.rejectionReason }}
                            }
                        </div>
                    }

                    <div class="border-t pt-2 mt-2 space-y-1">
                        <div class="flex justify-between text-sm"><span>Subtotal</span><span>{{ subTotal() | number:'1.2-2' }}</span></div>
                        <div class="flex justify-between text-sm"><span>Discount</span><span>−{{ totalDiscount() | number:'1.2-2' }}</span></div>
                        <div class="flex justify-between text-sm"><span>Tax</span><span>{{ totalTax() | number:'1.2-2' }}</span></div>
                        <div class="flex justify-between text-lg font-bold border-t pt-1"><span>Total</span><span>{{ grandTotal() | number:'1.2-2' }}</span></div>
                        @if (effectiveRedeem() > 0) {
                            <div class="flex justify-between text-sm text-amber-700 dark:text-amber-300"><span>Loyalty redeemed</span><span>−{{ effectiveRedeem() | number:'1.2-2' }}</span></div>
                            <div class="flex justify-between text-md font-semibold"><span>Amount due</span><span>{{ amountDue() | number:'1.2-2' }}</span></div>
                        }
                    </div>
                </mat-card>

                <!-- Payment -->
                <mat-card class="!p-3">
                    <div class="flex items-center gap-2 mb-2">
                        <mat-form-field appearance="outline" class="!my-0">
                            <mat-label>Method</mat-label>
                            <mat-select [(ngModel)]="payMethod">
                                <mat-option value="Cash">Cash</mat-option>
                                <mat-option value="Card">Card</mat-option>
                                <mat-option value="MobileBanking">Mobile Banking</mat-option>
                                <mat-option value="BankTransfer">Bank Transfer</mat-option>
                                <mat-option value="Voucher">Voucher</mat-option>
                                <mat-option value="Credit">Credit (account)</mat-option>
                            </mat-select>
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="flex-1 !my-0">
                            <mat-label>Amount tendered</mat-label>
                            <input matInput type="number" [(ngModel)]="payAmount" [placeholder]="amountDue().toFixed(2)" />
                        </mat-form-field>
                    </div>

                    <button mat-flat-button color="primary" class="w-full !text-lg !py-2"
                            [disabled]="!canFinalize() || finalizing()"
                            (click)="finalize()">
                        @if (finalizing()) {
                            Processing…
                        } @else {
                            Finalize Sale ({{ grandTotal() | number:'1.2-2' }})
                        }
                    </button>
                </mat-card>
            </div>
        </div>
    `,
    styles: [`:host { display: block; height: calc(100vh - 4rem); }`],
})
export class PosComponent implements OnInit {
    private readonly outletsApi = inject(OutletsService);
    private readonly productsApi = inject(ProductsService);
    private readonly customersApi = inject(CustomersService);
    private readonly salesApi = inject(SalesService);
    private readonly promosApi = inject(PromotionsService);
    private readonly currentOutlet = inject(CurrentOutletService);
    private readonly shiftsApi = inject(ShiftsService);
    private readonly snack = inject(MatSnackBar);
    private readonly router = inject(Router);
    private readonly dialog = inject(MatDialog);
    private readonly receiptPrint = inject(ReceiptPrintService);

    outlets = signal<OutletDto[]>([]);
    products = signal<ProductDto[]>([]);
    customers = signal<CustomerDto[]>([]);
    cart = signal<CartLine[]>([]);
    promo = signal<PromotionDiscountPreview | null>(null);
    currentShift = signal<ShiftDto | null>(null);
    finalizing = signal(false);

    outletId: string | null = null;
    customerId: string | null = null;
    search = '';
    promoCode = '';
    payMethod: PaymentMethod = 'Cash';
    payAmount: number | null = null;
    redeemPoints: number = 0;

    filteredProducts = computed(() => {
        const q = this.search.trim().toLowerCase();
        const all = this.products();
        if (!q) return all.slice(0, 60);
        return all.filter(p =>
            p.name.toLowerCase().includes(q)
            || p.sku.toLowerCase().includes(q)
            || (p.barcode ?? '').toLowerCase().includes(q)
        ).slice(0, 60);
    });

    subTotal = computed(() =>
        this.cart().reduce((s, l) => s + Math.max(0, l.unitPrice * l.quantity - l.discountAmount), 0));
    totalDiscount = computed(() =>
        this.cart().reduce((s, l) => s + l.discountAmount, 0) + (this.promo()?.eligible ? this.promo()!.discountAmount : 0));
    totalTax = computed(() => {
        const promoDisc = this.promo()?.eligible ? this.promo()!.discountAmount : 0;
        const subAfterPromo = Math.max(0, this.subTotal() - promoDisc);
        // approximate tax pro-rata using line tax rates
        if (subAfterPromo === 0) return 0;
        const weighted = this.cart().reduce((s, l) => {
            const lineNet = Math.max(0, l.unitPrice * l.quantity - l.discountAmount);
            return s + lineNet * (l.taxRate / 100);
        }, 0);
        return Math.round(weighted * 100) / 100;
    });
    grandTotal = computed(() => Math.max(0, this.subTotal() - (this.promo()?.eligible ? this.promo()!.discountAmount : 0) + this.totalTax()));

    selectedCustomer = computed(() => this.customers().find(c => c.id === this.customerId) ?? null);

    /** Max points the cashier can redeem on this sale: capped by both balance and grand total. */
    maxRedeemable = computed(() => {
        const c = this.selectedCustomer();
        if (!c) return 0;
        return Math.floor(Math.min(c.loyaltyPoints, this.grandTotal()));
    });

    /** Effective points actually redeemed (clamped to what's allowed). */
    effectiveRedeem = computed(() => {
        const requested = Number(this.redeemPoints) || 0;
        return Math.max(0, Math.min(requested, this.maxRedeemable()));
    });

    /** Amount the cashier still needs to collect after loyalty deduction. */
    amountDue = computed(() => Math.max(0, this.grandTotal() - this.effectiveRedeem()));

    canFinalize = computed(() => !!this.outletId && this.cart().length > 0);

    ngOnInit(): void {
        this.outletsApi.getAll().subscribe(o => {
            this.outlets.set(o);
            if (o.length === 0) return;
            // Restore the last-used outlet if it's still in the user's allowed list,
            // otherwise fall back to the first available outlet.
            const remembered = this.currentOutlet.outletId();
            const match = remembered && o.find(x => x.id === remembered);
            this.outletId = match ? match.id : o[0].id;
            this.currentOutlet.set(this.outletId);
            this.refreshShift();
        });
        this.productsApi.getAll({ isActive: true }).subscribe(p => this.products.set(p));
        this.customersApi.getAll().subscribe(c => this.customers.set(c));
    }

    onOutletChange(): void {
        this.currentOutlet.set(this.outletId);
        this.refreshShift();
    }

    private refreshShift(): void {
        if (!this.outletId) { this.currentShift.set(null); return; }
        this.shiftsApi.current(this.outletId).subscribe({
            next: s => this.currentShift.set(s ?? null),
            error: () => this.currentShift.set(null),
        });
    }

    addToCart(p: ProductDto): void {
        const existing = this.cart().find(l => l.productId === p.id && !l.serialNumber);
        if (existing) {
            existing.quantity += 1;
            this.cart.set([...this.cart()]);
            this.recalc();
            return;
        }

        // Add the line at the base price first (instant feedback), then resolve
        // the per-outlet override and patch in the override price if any. This
        // keeps the UI snappy while still honoring outlet-specific pricing.
        const newLine: CartLine = {
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            quantity: 1,
            unitPrice: p.sellingPrice,
            discountAmount: 0,
            taxRate: p.taxRate,
        };
        this.cart.set([...this.cart(), newLine]);
        this.recalc();

        if (this.outletId) {
            this.productsApi.resolvePrice(p.id, this.outletId).subscribe({
                next: r => {
                    if (r.isOverride) {
                        const updated = this.cart().map(l =>
                            l === newLine || (l.productId === p.id && !l.serialNumber && l.unitPrice === p.sellingPrice && l.quantity === 1)
                                ? { ...l, unitPrice: r.sellingPrice }
                                : l);
                        this.cart.set(updated);
                        this.recalc();
                    }
                },
                error: () => { /* keep base price on lookup failure */ },
            });
        }
    }

    removeLine(idx: number): void {
        const next = [...this.cart()];
        next.splice(idx, 1);
        this.cart.set(next);
        this.recalc();
    }

    nudgeQty(line: CartLine, delta: number): void {
        const next = Math.max(1, (line.quantity ?? 0) + delta);
        if (next === line.quantity) return;
        line.quantity = next;
        this.recalc();
    }

    recalc(): void {
        // Touching the signal so computed() re-runs
        this.cart.set([...this.cart()]);
    }

    lineTotal(l: CartLine): number {
        const sub = Math.max(0, l.unitPrice * l.quantity - l.discountAmount);
        return Math.round((sub + sub * (l.taxRate / 100)) * 100) / 100;
    }

    onCustomerChange(_id: string | null): void {
        // Reset loyalty redemption when the customer changes — points belong to a customer.
        this.redeemPoints = 0;
    }

    applyPromo(): void {
        const code = this.promoCode.trim();
        if (!code || this.cart().length === 0) return;
        const lines = this.cart().map(l => ({ productId: l.productId, quantity: l.quantity, unitPrice: l.unitPrice }));
        this.promosApi.previewDiscount(code, lines).subscribe({
            next: (p) => this.promo.set(p),
            error: () => this.snack.open('Promo lookup failed', 'OK', { duration: 3000 }),
        });
    }

    clearPromo(): void {
        this.promo.set(null);
        this.promoCode = '';
    }

    finalize(): void {
        if (!this.outletId || this.cart().length === 0) return;
        const due = this.amountDue();
        const payAmt = this.payAmount ?? due;
        if (payAmt + 0.01 < due) {
            this.snack.open(`Insufficient payment (${payAmt.toFixed(2)} < ${due.toFixed(2)})`, 'OK', { duration: 3000 });
            return;
        }

        // Spread promo discount proportionally across line discountAmount so the API totals match
        const promoDisc = this.promo()?.eligible ? this.promo()!.discountAmount : 0;
        const subBeforePromo = this.subTotal();
        const apiLines: CreateSaleLine[] = this.cart().map(l => {
            const lineNet = Math.max(0, l.unitPrice * l.quantity - l.discountAmount);
            const share = subBeforePromo > 0 ? lineNet / subBeforePromo : 0;
            const extraDiscount = Math.round(promoDisc * share * 100) / 100;
            return {
                productId: l.productId,
                quantity: l.quantity,
                unitPrice: l.unitPrice,
                discountAmount: l.discountAmount + extraDiscount,
                serialNumber: l.serialNumber,
                batchNumber: l.batchNumber,
                weightKg: l.weightKg,
            };
        });

        const payments: CreateSalePayment[] = [{ amount: payAmt, method: this.payMethod }];
        const customer = this.customers().find(c => c.id === this.customerId);

        this.finalizing.set(true);
        this.salesApi.create({
            outletId: this.outletId,
            customerId: this.customerId ?? undefined,
            customerName: customer?.name,
            customerPhone: customer?.phone,
            lines: apiLines,
            payments,
            loyaltyPointsRedeemed: this.effectiveRedeem() > 0 ? this.effectiveRedeem() : undefined,
        }).subscribe({
            next: (id) => {
                this.finalizing.set(false);
                // Fetch the finalized sale for the receipt and let the cashier
                // either print or jump to the detail page. Reset the cart in
                // either case so the next customer can start ringing up.
                this.salesApi.get(id).subscribe(sale => this.printReceipt(sale));
                this.snack.open(`Sale finalized! Invoice → /sales/${id}`, 'View', { duration: 5000 })
                    .onAction().subscribe(() => this.router.navigate(['/sales', id]));
                // Refresh customer list so the next sale sees updated loyalty balance.
                if (this.customerId) this.customersApi.getAll().subscribe(c => this.customers.set(c));
                this.cart.set([]);
                this.promo.set(null);
                this.promoCode = '';
                this.payAmount = null;
                this.customerId = null;
                this.redeemPoints = 0;
            },
            error: (err) => {
                this.finalizing.set(false);
                const msg = err?.error?.exception ?? err?.error?.title ?? err?.message ?? 'Sale failed';
                this.snack.open(msg, 'OK', { duration: 6000 });
            },
        });
    }

    private printReceipt(sale: SaleDto): void {
        const outletName = this.outlets().find(o => o.id === sale.outletId)?.name;
        this.receiptPrint.print(sale, outletName);
    }

    openSaleLookup(): void {
        const outlet = this.outlets().find(o => o.id === this.outletId);
        this.dialog.open(SaleLookupDialogComponent, {
            width: '720px',
            data: { outletId: this.outletId || undefined, outletName: outlet?.name },
        });
    }
}
