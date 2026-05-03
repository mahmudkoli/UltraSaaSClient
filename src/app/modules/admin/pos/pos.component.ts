import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, inject, signal, computed } from '@angular/core';
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
import { ProductsService, UnitsService } from 'app/core/catalog/catalog.service';
import { ProductDto, UnitDto } from 'app/core/catalog/catalog.types';
import { StocksService } from 'app/core/inventory/inventory.service';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletDto } from 'app/core/outlets/outlets.types';
import { CurrentOutletService } from 'app/core/outlets/current-outlet.service';
import { ShiftsService } from 'app/core/sales/shifts.service';
import { ShiftDto } from 'app/core/sales/shifts.types';
import { RouterModule } from '@angular/router';
import { ReceiptPrintService } from 'app/core/sales/receipt-print.service';
import { ParkedCartsService, RecalledCartDto } from 'app/core/sales/parked-cart.service';
import { CustomersService, SalesService } from 'app/core/sales/sales.service';
import { CreateSaleLine, CreateSalePayment, CustomerDto, PaymentMethod, SaleDto } from 'app/core/sales/sales.types';
import { BrandingProfilesService } from 'app/core/branding/branding.service';
import { BrandingProfileDto } from 'app/core/branding/branding.types';
import { PromotionsService } from 'app/core/marketing/marketing.service';
import { PromotionDiscountPreview } from 'app/core/marketing/marketing.types';
import { SaleLookupDialogComponent } from './sale-lookup-dialog.component';
import { ParkedCartsDialogComponent } from './parked-carts-dialog.component';
import { ManagerOverrideDialogComponent, ManagerOverrideResult } from './manager-override-dialog.component';
import { QuickAddCustomerDialogComponent } from './quick-add-customer-dialog.component';

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
                        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1 !my-0">
                            <mat-label>Outlet</mat-label>
                            <mat-select [(ngModel)]="outletId" (ngModelChange)="onOutletChange()">
                                @for (o of outlets(); track o.id) {
                                    <mat-option [value]="o.id">{{ o.code }} — {{ o.name }}</mat-option>
                                }
                            </mat-select>
                        </mat-form-field>
                        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1 !my-0">
                            <mat-label>Search SKU / name / scan barcode</mat-label>
                            <input matInput #searchInput
                                   [ngModel]="search()" (ngModelChange)="search.set($event)"
                                   (keyup.enter)="onSearchEnter()"
                                   placeholder="Type or scan to add..." />
                            <mat-icon matSuffix class="text-gray-400" matTooltip="Tip: scan a barcode to auto-add. Or type and press Enter to add the matching SKU.">qr_code_scanner</mat-icon>
                        </mat-form-field>
                        <button mat-stroked-button class="!min-w-0 !px-3 !h-14"
                                (click)="openSaleLookup()"
                                matTooltip="Find a previous sale and re-print the receipt">
                            <mat-icon class="icon-size-5">receipt_long</mat-icon>
                            <span class="hidden lg:inline ml-1">Find sale</span>
                        </button>
                        <button mat-stroked-button class="!min-w-0 !px-3 !h-14 relative"
                                (click)="openParkedCarts()"
                                [matTooltip]="parkedCount() > 0 ? parkedCount() + ' parked cart(s)' : 'No parked carts'">
                            <mat-icon class="icon-size-5">pause_circle</mat-icon>
                            <span class="hidden lg:inline ml-1">Recall</span>
                            @if (parkedCount() > 0) {
                                <span class="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{{ parkedCount() }}</span>
                            }
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
                    <!-- Stock filter toggle: hides products with 0 at the current outlet. -->
                    <div class="flex items-center justify-between gap-2 px-1 py-1 mb-1.5 text-xs">
                        <span class="text-gray-500">{{ filteredProducts().length }} product{{ filteredProducts().length === 1 ? '' : 's' }}</span>
                        <label class="inline-flex items-center gap-1.5 cursor-pointer select-none">
                            <input type="checkbox" [checked]="inStockOnly()" (change)="inStockOnly.set($any($event.target).checked)" class="accent-indigo-600">
                            <span class="text-gray-600 dark:text-gray-300">In stock only</span>
                        </label>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                        @for (p of filteredProducts(); track p.id) {
                            <button class="border rounded p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 relative"
                                    [class.opacity-60]="stockFor(p.id) <= 0"
                                    (click)="addToCart(p)">
                                <div class="font-medium text-sm">{{ p.name }}</div>
                                <div class="text-xs text-gray-500">{{ p.sku }}</div>
                                <div class="flex items-center justify-between gap-2 mt-1">
                                    <div class="text-base font-semibold">{{ p.sellingPrice | number:'1.2-2' }}</div>
                                    <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap"
                                          [class]="stockChipClass(p)"
                                          [matTooltip]="stockFor(p.id) <= 0 ? 'Out of stock at this outlet' : (p.reorderLevel > 0 && stockFor(p.id) <= p.reorderLevel ? 'At or below reorder level (' + p.reorderLevel + ')' : 'In stock')">
                                        {{ stockLabel(p) }}
                                    </span>
                                </div>
                            </button>
                        }
                    </div>
                    @if (filteredProducts().length === 0) {
                        <div class="text-center py-10 text-gray-500">
                            @if (inStockOnly() && products().length > 0) {
                                <span>Nothing in stock at this outlet matches.</span>
                                <button class="text-blue-600 underline ml-1" (click)="inStockOnly.set(false)">Show all anyway</button>
                            } @else {
                                <span>No products. Create some in /catalog/products.</span>
                            }
                        </div>
                    }
                </mat-card>
            </div>

            <!-- Right: cart + payment -->
            <div class="lg:w-1/2 flex flex-col gap-3">
                <mat-card class="!p-3">
                    <h3 class="font-semibold mb-2">Customer</h3>
                    <div class="flex items-center gap-2">
                        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1 !my-0">
                            <mat-label>Customer (optional)</mat-label>
                            <mat-select [(ngModel)]="customerId" (ngModelChange)="onCustomerChange($event)">
                                <mat-option [value]="null">— Walk-in —</mat-option>
                                <mat-option [value]="ADD_CUSTOMER_SENTINEL" class="!text-emerald-700 dark:!text-emerald-300">
                                    <mat-icon class="icon-size-4 align-middle mr-1">person_add</mat-icon>
                                    <span class="align-middle">Add new customer…</span>
                                </mat-option>
                                @for (c of customers(); track c.id) {
                                    <mat-option [value]="c.id">{{ c.name }}{{ c.phone ? ' (' + c.phone + ')' : '' }}</mat-option>
                                }
                            </mat-select>
                        </mat-form-field>
                        @if (brandingProfiles().length > 0) {
                            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="!my-0 w-48"
                                            matTooltip="Receipt template — falls back to outlet default if unset">
                                <mat-label>Receipt</mat-label>
                                <mat-select [(ngModel)]="brandingProfileId">
                                    <mat-option [value]="null">— Outlet default —</mat-option>
                                    @for (p of brandingProfiles(); track p.id) {
                                        <mat-option [value]="p.id">{{ p.name }}</mat-option>
                                    }
                                </mat-select>
                            </mat-form-field>
                        }
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
                        <div class="flex flex-col items-center justify-center text-center py-10 text-gray-500 min-h-32">
                            <mat-icon class="icon-size-12 text-gray-300 dark:text-gray-600 mb-2">shopping_cart</mat-icon>
                            <div>Add a product to start.</div>
                        </div>
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
                        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1 !my-0">
                            <mat-label>Promo code</mat-label>
                            <input matInput [(ngModel)]="promoCode" />
                        </mat-form-field>
                        <button mat-stroked-button class="!h-14" (click)="applyPromo()" [disabled]="!promoCode || cart().length === 0">
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

                    <div class="flex gap-2">
                        <button mat-flat-button color="primary" class="flex-1 !text-lg !py-2"
                                [disabled]="!canFinalize() || finalizing()"
                                (click)="finalize()">
                            @if (finalizing()) {
                                Processing…
                            } @else {
                                Finalize ({{ grandTotal() | number:'1.2-2' }})
                            }
                        </button>
                        <button mat-stroked-button color="accent" class="!text-base !py-2 !px-3"
                                [disabled]="!canFinalize() || parking()"
                                (click)="park()"
                                matTooltip="Save this cart for later — customer stepping away?">
                            <mat-icon class="icon-size-5 mr-1">pause_circle</mat-icon>
                            <span>Park</span>
                        </button>
                    </div>
                </mat-card>
            </div>
        </div>
    `,
    styles: [`:host { display: block; height: calc(100vh - 4rem); }`],
})
export class PosComponent implements OnInit, AfterViewInit {
    /** Native ref to the product search input — focused on view init and again
     * after every Finalize / Park so the cashier can immediately type or scan
     * the next item without clicking. */
    @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
    private readonly outletsApi = inject(OutletsService);
    private readonly productsApi = inject(ProductsService);
    private readonly unitsApi = inject(UnitsService);
    private readonly stocksApi = inject(StocksService);
    private readonly customersApi = inject(CustomersService);
    private readonly salesApi = inject(SalesService);
    private readonly promosApi = inject(PromotionsService);
    private readonly currentOutlet = inject(CurrentOutletService);
    private readonly shiftsApi = inject(ShiftsService);
    private readonly snack = inject(MatSnackBar);
    private readonly router = inject(Router);
    private readonly dialog = inject(MatDialog);
    private readonly receiptPrint = inject(ReceiptPrintService);
    private readonly parkedApi = inject(ParkedCartsService);
    private readonly brandingApi = inject(BrandingProfilesService);

    // Number of parked carts at the current outlet (badge on the Recall button).
    parkedCount = signal(0);
    parking = signal(false);

    /** Active branding profiles available to the current tenant — drives the per-sale picker. */
    brandingProfiles = signal<BrandingProfileDto[]>([]);

    /** Per-product stock at the *current* outlet. Map productId → quantity.
     * Refreshed on outlet change. Empty map = "stock data not available yet"
     * — we still let the cashier add to cart; the domain layer enforces the
     * negative-stock guard at finalize time. */
    stockByProduct = signal<Map<string, number>>(new Map());

    /** When true (default), the product picker hides items with quantity ≤ 0
     * at the current outlet. Toggle off to ring up "we have one in the back"
     * sales — the finalize step will reject if stock truly is 0. */
    inStockOnly = signal(true);

    /** Units indexed by id. Used to render the stock chip with its unit code
     * (e.g. "12 PCS", "2.5 KG"); a number alone is ambiguous for weight items. */
    unitsById = signal<Map<string, UnitDto>>(new Map());

    outlets = signal<OutletDto[]>([]);
    products = signal<ProductDto[]>([]);
    customers = signal<CustomerDto[]>([]);
    cart = signal<CartLine[]>([]);
    promo = signal<PromotionDiscountPreview | null>(null);
    currentShift = signal<ShiftDto | null>(null);
    finalizing = signal(false);

    outletId: string | null = null;
    customerId: string | null = null;
    /** Per-sale branding profile override. Pre-fills from outlet default on outlet change; null = use outlet default. */
    brandingProfileId: string | null = null;
    search = signal('');
    promoCode = '';
    payMethod: PaymentMethod = 'Cash';
    payAmount: number | null = null;
    redeemPoints: number = 0;

    filteredProducts = computed(() => {
        const q = this.search().trim().toLowerCase();
        const stocks = this.stockByProduct();
        const inStockOnly = this.inStockOnly();
        const all = this.products();
        const matchesSearch = (p: ProductDto) =>
            !q || p.name.toLowerCase().includes(q)
               || p.sku.toLowerCase().includes(q)
               || (p.barcode ?? '').toLowerCase().includes(q);
        // Filter on stock only when we actually have stock data; an unfilled
        // map means "stock not loaded yet" — show everything rather than hide
        // the whole catalog while the request is in flight.
        const passesStockFilter = (p: ProductDto) => {
            if (!inStockOnly || stocks.size === 0) return true;
            return (stocks.get(p.id) ?? 0) > 0;
        };
        return all.filter(p => matchesSearch(p) && passesStockFilter(p)).slice(0, 60);
    });

    /** Stock quantity for a product at the current outlet. 0 if no stock row yet (never received). */
    stockFor(productId: string): number {
        return this.stockByProduct().get(productId) ?? 0;
    }

    /** Renders the stock chip text — number + unit code with the right decimal
     * precision. e.g. "12 PCS", "2.5 KG", "0 PCS". Falls back to bare number
     * when the unit isn't loaded yet. */
    stockLabel(p: ProductDto): string {
        const qty = this.stockFor(p.id);
        const unit = p.unitId ? this.unitsById().get(p.unitId) : undefined;
        const decimals = unit?.decimalPlaces ?? 0;
        const num = qty.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: Math.min(decimals, 3),
        });
        return unit?.code ? `${num} ${unit.code}` : num;
    }

    /** CSS class for the stock chip — red ≤0, amber at/below reorder level, gray otherwise. */
    stockChipClass(p: ProductDto): string {
        const qty = this.stockFor(p.id);
        if (qty <= 0) return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
        if (p.reorderLevel > 0 && qty <= p.reorderLevel) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }

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

    canFinalize = computed(() => this.cart().length > 0 && !!this.outletId);

    ngAfterViewInit(): void {
        // Land on the search box ready to type / scan. setTimeout pushes the
        // focus call past Material's own focus management for the page chrome.
        setTimeout(() => this.focusSearch(), 0);
    }

    /** Focus the search input. Tolerant of the ref not being available yet
     * (e.g. early-lifecycle or while a dialog has trapped focus). */
    private focusSearch(): void {
        try { this.searchInput?.nativeElement.focus(); } catch { /* noop */ }
    }

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
            this.brandingProfileId = this.outletDefaultBranding();
            this.refreshShift();
            this.refreshParkedCount();
            this.refreshStock();
        });
        this.productsApi.getAll({ isActive: true }).subscribe(p => this.products.set(p));
        // Units feed the stock-chip's unit code (e.g. "12 PCS", "2.5 KG").
        // Tenant-wide list, fetched once at load — units rarely change at runtime.
        this.unitsApi.getAll().subscribe({
            next: units => {
                const map = new Map<string, UnitDto>();
                for (const u of units ?? []) map.set(u.id, u);
                this.unitsById.set(map);
            },
            error: () => this.unitsById.set(new Map()),
        });
        this.customersApi.getAll().subscribe(c => this.customers.set(c));
        // Quietly ignore failures — cashier without View permission still gets a working POS,
        // they just don't see the override picker (server falls back to outlet default).
        this.brandingApi.getAll().subscribe({
            next: rows => this.brandingProfiles.set((rows ?? []).filter(p => p.isActive)),
            error: () => this.brandingProfiles.set([]),
        });
    }

    onOutletChange(): void {
        this.currentOutlet.set(this.outletId);
        this.brandingProfileId = this.outletDefaultBranding();
        this.refreshShift();
        this.refreshParkedCount();
        this.refreshStock();
    }

    private refreshStock(): void {
        if (!this.outletId) { this.stockByProduct.set(new Map()); return; }
        this.stocksApi.byOutlet(this.outletId).subscribe({
            next: rows => {
                const map = new Map<string, number>();
                for (const s of rows ?? []) map.set(s.productId, s.quantity);
                this.stockByProduct.set(map);
            },
            // Quietly fall back to "no stock data" — the picker will show every
            // product, and the finalize step still enforces stock invariants.
            error: () => this.stockByProduct.set(new Map()),
        });
    }

    /** The current outlet's default branding profile id, or null. */
    private outletDefaultBranding(): string | null {
        const o = this.outlets().find(x => x.id === this.outletId);
        return o?.defaultBrandingProfileId ?? null;
    }

    private refreshParkedCount(): void {
        if (!this.outletId) { this.parkedCount.set(0); return; }
        this.parkedApi.byOutlet(this.outletId).subscribe({
            next: list => this.parkedCount.set(list.length),
            error: () => this.parkedCount.set(0),
        });
    }

    private refreshShift(): void {
        if (!this.outletId) { this.currentShift.set(null); return; }
        this.shiftsApi.current(this.outletId).subscribe({
            next: s => this.currentShift.set(s ?? null),
            error: () => this.currentShift.set(null),
        });
    }

    /**
     * Auto-add on Enter: resolves the search term to exactly one product
     * (barcode match wins, falls back to exact SKU). Most barcode scanners
     * end every scan with Enter, so this is the cashier's main scan path —
     * one scan = one cart line, no click. Manual typing-then-Enter follows
     * the same path. Multiple matches or no match: no-op (cashier keeps
     * looking, no surprise add).
     */
    onSearchEnter(): void {
        const term = this.search().trim();
        if (!term) return;
        const all = this.products();
        // Barcode match is exact, case-sensitive (real barcodes are numeric).
        let match = all.find(p => p.barcode && p.barcode === term);
        if (!match) {
            // SKU match is exact, case-insensitive (matches the domain's
            // ToUpperInvariant on Product.SKU).
            const lower = term.toLowerCase();
            const skuMatches = all.filter(p => p.sku.toLowerCase() === lower);
            if (skuMatches.length === 1) match = skuMatches[0];
        }
        if (!match) return; // ambiguous / no hit — let the cashier click manually
        this.addToCart(match);
        this.search.set('');
    }

    addToCart(p: ProductDto): void {
        const existing = this.cart().find(l => l.productId === p.id && !l.serialNumber);
        if (existing) {
            existing.quantity += 1;
            this.cart.set([...this.cart()]);
            this.recalc();
            // Clear the search and return focus so the cashier can immediately
            // type / scan the next item. Mirrors the Enter / scan auto-add
            // path (Phase 2.32) — having the typed-then-clicked path stay
            // stuck on the previous query was an asymmetry / minor bug.
            this.search.set('');
            setTimeout(() => this.focusSearch(), 0);
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
        // Clear the search + refocus, so a fast cashier can keep adding without
        // re-clicking or manually deleting the previous query.
        this.search.set('');
        setTimeout(() => this.focusSearch(), 0);
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

    /**
     * Sentinel option in the customer dropdown — picking it opens the quick-add
     * dialog instead of selecting a real customer. String form so it never
     * collides with a real Guid.
     */
    readonly ADD_CUSTOMER_SENTINEL = '__add_new_customer__';

    onCustomerChange(id: string | null): void {
        if (id === this.ADD_CUSTOMER_SENTINEL) {
            // Reset selection immediately so the dropdown doesn't visually stay
            // on "Add new customer…" while the dialog is open.
            this.customerId = null;
            const ref = this.dialog.open(QuickAddCustomerDialogComponent, { width: '460px' });
            ref.afterClosed().subscribe((created: CustomerDto | undefined) => {
                if (!created) return;
                // Optimistic insert at the top of the list so the cashier sees
                // the new row immediately; full refresh would also work but
                // costs an extra round-trip during checkout flow.
                this.customers.set([created, ...this.customers()]);
                this.customerId = created.id;
            });
            return;
        }
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
        this.submitSale(apiLines, payments, customer);
    }

    private submitSale(
        apiLines: CreateSaleLine[],
        payments: CreateSalePayment[],
        customer: CustomerDto | undefined,
        discountAuthorizedByUserId?: string,
    ): void {
        this.finalizing.set(true);
        this.salesApi.create({
            outletId: this.outletId!,
            customerId: this.customerId ?? undefined,
            customerName: customer?.name,
            customerPhone: customer?.phone,
            lines: apiLines,
            payments,
            loyaltyPointsRedeemed: this.effectiveRedeem() > 0 ? this.effectiveRedeem() : undefined,
            discountAuthorizedByUserId,
            brandingProfileId: this.brandingProfileId ?? undefined,
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
                // Refresh stock — the just-finalized sale decremented quantities
                // server-side; the chips would otherwise stay stale until the
                // cashier switches outlets or reloads.
                this.refreshStock();
                // Return focus to the search box so the next customer can be
                // rung up immediately by typing / scanning.
                setTimeout(() => this.focusSearch(), 0);
            },
            error: (err) => {
                this.finalizing.set(false);
                const msg = err?.error?.exception ?? err?.error?.title ?? err?.message ?? 'Sale failed';
                // Strict-pricing rejection: server says price doesn't match resolved price.
                // If the cashier hasn't already obtained a manager override, prompt for one.
                const looksLikePriceOverride = err?.status === 403
                    && typeof msg === 'string'
                    && /Unit price .* does not match resolved price/i.test(msg)
                    && !discountAuthorizedByUserId;
                if (looksLikePriceOverride) {
                    const ref = this.dialog.open(ManagerOverrideDialogComponent, {
                        width: '460px',
                        data: {
                            requiredPermission: 'Permissions.Sales.Discount',
                            reason: 'A unit price on this sale differs from the resolved price. A manager with discount permission must authorize.',
                        },
                    });
                    ref.afterClosed().subscribe((result: ManagerOverrideResult | null) => {
                        if (!result) return;
                        this.snack.open(`Approved by ${result.authorizedUserName} — finalizing…`, 'OK', { duration: 3000 });
                        this.submitSale(apiLines, payments, customer, result.authorizedUserId);
                    });
                    return;
                }
                this.snack.open(msg, 'OK', { duration: 6000 });
            },
        });
    }

    private printReceipt(sale: SaleDto): void {
        const outlet = this.outlets().find(o => o.id === sale.outletId);
        this.receiptPrint.print(sale, outlet);
    }

    openSaleLookup(): void {
        const outlet = this.outlets().find(o => o.id === this.outletId);
        this.dialog.open(SaleLookupDialogComponent, {
            width: '720px',
            data: { outletId: this.outletId || undefined, outletName: outlet?.name, outlet: outlet ?? undefined },
        });
    }

    park(): void {
        if (!this.outletId || this.cart().length === 0) return;
        const customer = this.selectedCustomer();
        const label = prompt(
            `Park this cart? Optional label (e.g. "Mr. Karim — blue shirt"):`,
            customer?.name ?? '');
        if (label === null) return;  // cancelled

        this.parking.set(true);
        this.parkedApi.park({
            outletId: this.outletId,
            customerId: this.customerId,
            customerName: customer?.name,
            customerPhone: customer?.phone,
            label: label || null,
            lines: this.cart().map(l => ({
                productId: l.productId,
                productName: l.productName,
                sku: l.sku,
                quantity: l.quantity,
                unitPrice: l.unitPrice,
                discountAmount: l.discountAmount,
                serialNumber: l.serialNumber,
                batchNumber: l.batchNumber,
                weightKg: l.weightKg,
            })),
            promoCode: this.promoCode || undefined,
            loyaltyPointsRedeemed: this.redeemPoints || undefined,
        }).subscribe({
            next: () => {
                this.parking.set(false);
                this.snack.open('Cart parked. Recall from the toolbar when the customer returns.', 'OK', { duration: 4000 });
                this.cart.set([]);
                this.promo.set(null);
                this.promoCode = '';
                this.payAmount = null;
                this.customerId = null;
                this.redeemPoints = 0;
                this.refreshParkedCount();
                // Cart cleared post-park; cashier can ring up the next customer immediately.
                setTimeout(() => this.focusSearch(), 0);
            },
            error: err => {
                this.parking.set(false);
                const msg = err?.error?.exception ?? err?.error?.title ?? err?.message ?? 'Park failed';
                this.snack.open(msg, 'OK', { duration: 6000 });
            },
        });
    }

    openParkedCarts(): void {
        if (!this.outletId) return;
        const outlet = this.outlets().find(o => o.id === this.outletId);
        const ref = this.dialog.open(ParkedCartsDialogComponent, {
            width: '720px',
            data: { outletId: this.outletId, outletName: outlet?.name },
        });
        ref.afterClosed().subscribe((recalled: RecalledCartDto | undefined) => {
            this.refreshParkedCount();
            if (!recalled) return;

            // Restore cart state. Cart lines already carry productName/sku snapshots.
            this.cart.set(recalled.lines.map(l => ({
                productId: l.productId,
                productName: l.productName ?? '(recalled item)',
                sku: l.sku ?? '',
                taxRate: 0,  // best-effort; the active product list will re-resolve when re-touched
                quantity: l.quantity,
                unitPrice: l.unitPrice,
                discountAmount: l.discountAmount,
                serialNumber: l.serialNumber,
                batchNumber: l.batchNumber,
                weightKg: l.weightKg,
            })));
            this.customerId = recalled.customerId ?? null;
            this.promoCode = recalled.promoCode ?? '';
            this.redeemPoints = recalled.loyaltyPointsRedeemed ?? 0;
            this.recalc();
            this.snack.open(`Recalled ${recalled.label || recalled.customerName || 'parked cart'}`, 'OK', { duration: 3000 });
        });
    }
}
