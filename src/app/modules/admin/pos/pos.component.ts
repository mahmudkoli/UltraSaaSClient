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
import { TenantInfoService } from 'app/core/auth/tenant-info.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ProductsService, UnitsService } from 'app/core/catalog/catalog.service';
import { ProductDto, UnitDto } from 'app/core/catalog/catalog.types';
import { StocksService, StockSerialsService } from 'app/core/inventory/inventory.service';
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
import { ShareInvoiceDialogComponent } from '../sales/share-invoice-dialog.component';

interface CartLine extends CreateSaleLine {
    productName: string;
    sku: string;
    taxRate: number;
    /** Per-product POS-input gates copied from the source ProductDto so we can
     * render Serial/IMEI/Batch inputs only for products that actually need
     * them — tenant vertical alone (Electronics/Pharmacy/Generic) is too
     * coarse, especially on Generic where the catalog mixes everything. */
    requiresSerial?: boolean;
    isImeiRequired?: boolean;
    requiresBatch?: boolean;
    /** Phase 2.36e — client-side validation state of `serialNumber`.
     * 'pending' while the by-serial GET is in flight; 'valid' on a clean
     * `InStock + correct outlet + correct product` match; 'invalid'
     * otherwise. Pure UX hint — server is still authoritative at finalize. */
    serialValidation?: 'pending' | 'valid' | 'invalid';
    /** Human-readable reason when serialValidation === 'invalid'. */
    serialError?: string;
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
                            @if (search()) {
                                <button matSuffix mat-icon-button type="button" aria-label="Clear search"
                                        (click)="clearSearch()">
                                    <mat-icon class="icon-size-5">close</mat-icon>
                                </button>
                            } @else {
                                <mat-icon matSuffix class="text-gray-400" matTooltip="Tip: scan a barcode to auto-add. Or type and press Enter to add the matching SKU.">qr_code_scanner</mat-icon>
                            }
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
                                    @if (p.isOutletPriceOverride && p.outletSellingPrice != null) {
                                        <div class="flex flex-col items-start leading-tight">
                                            <span class="text-base font-semibold text-emerald-700 dark:text-emerald-400">{{ p.outletSellingPrice | number:'1.2-2' }}</span>
                                            @if (p.isOfferActive && p.offerPrice != null) {
                                                <span class="text-[10px] text-amber-600 line-through">{{ p.offerPrice | number:'1.2-2' }}</span>
                                            }
                                            <span class="text-[10px] text-gray-500 line-through">{{ p.sellingPrice | number:'1.2-2' }}</span>
                                        </div>
                                    } @else if (p.isOfferActive && p.offerPrice != null) {
                                        <div class="flex flex-col items-start leading-tight">
                                            <span class="text-base font-semibold text-amber-700 dark:text-amber-400">{{ p.offerPrice | number:'1.2-2' }}</span>
                                            <span class="text-[10px] text-gray-500 line-through">{{ p.sellingPrice | number:'1.2-2' }}</span>
                                        </div>
                                    } @else {
                                        <div class="text-base font-semibold">{{ p.sellingPrice | number:'1.2-2' }}</div>
                                    }
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
                <mat-card class="!p-2">
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
                    @if (cartHasStockIssue()) {
                        <div class="mb-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
                            <mat-icon class="icon-size-5">error</mat-icon>
                            <span>One or more lines exceed available stock at this outlet. Adjust the qty before finalizing.</span>
                        </div>
                    }
                    @if (cartHasSerialIssue()) {
                        <div class="mb-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
                            <mat-icon class="icon-size-5">error</mat-icon>
                            <span>One or more serial numbers are not valid for this outlet / product. Hover the red icon for details.</span>
                        </div>
                    }
                    @if (cartHasMissingRequiredSerial()) {
                        <div class="mb-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                            <mat-icon class="icon-size-5">info</mat-icon>
                            <span>Serial number required on serialized product lines before finalize.</span>
                        </div>
                    }
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
                                            @if (line.requiresSerial) {
                                            <div class="flex items-center gap-1 mt-1">
                                                <input type="text"
                                                       [(ngModel)]="line.serialNumber"
                                                       (blur)="validateLineSerial(line)"
                                                       [placeholder]="(line.isImeiRequired ? 'Serial / IMEI' : 'Serial number') + ' (required)'"
                                                       class="text-[11px] font-mono w-40 border rounded px-1 py-0.5"
                                                       [class.!border-rose-400]="line.serialValidation === 'invalid' || (line.requiresSerial && !(line.serialNumber ?? '').trim())"
                                                       [class.!border-emerald-400]="line.serialValidation === 'valid'" />
                                                @if (line.serialValidation === 'pending') {
                                                    <mat-icon class="icon-size-4 text-gray-400 animate-pulse">hourglass_empty</mat-icon>
                                                } @else if (line.serialValidation === 'valid') {
                                                    <mat-icon class="icon-size-4 text-emerald-600" matTooltip="Serial is in stock at this outlet">check_circle</mat-icon>
                                                } @else if (line.serialValidation === 'invalid') {
                                                    <mat-icon class="icon-size-4 text-rose-600" [matTooltip]="line.serialError ?? 'Invalid serial'">error</mat-icon>
                                                }
                                            </div>
                                            }
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
                                                       class="w-12 border rounded px-1 py-0.5 text-right"
                                                       [class.!border-rose-400]="lineExceedsStock(line)"
                                                       [class.!text-rose-600]="lineExceedsStock(line)"
                                                       [matTooltip]="lineExceedsStock(line) ? ('Only ' + stockFor(line.productId) + ' in stock at this outlet') : ''" />
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
                <mat-card class="!p-2">
                    <div class="flex items-center gap-1 mb-1">
                        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1 !my-0">
                            <mat-label>Promo code</mat-label>
                            <input matInput [(ngModel)]="promoCode" />
                        </mat-form-field>
                        <button mat-stroked-button class="!h-10 !min-w-0 !px-3" (click)="applyPromo()" [disabled]="!promoCode || cart().length === 0">
                            Apply
                        </button>
                        @if (promo()) {
                            <button mat-icon-button class="!w-8 !h-8" (click)="clearPromo()" title="Clear promo">
                                <mat-icon class="icon-size-4">close</mat-icon>
                            </button>
                        }
                    </div>
                    @if (promo()) {
                        <div class="text-xs" [class.text-green-600]="promo()!.eligible" [class.text-red-600]="!promo()!.eligible">
                            @if (promo()!.eligible) {
                                <mat-icon class="!text-sm align-middle mr-1">check_circle</mat-icon>
                                {{ promo()!.code }}: −{{ promo()!.discountAmount | number:'1.2-2' }}
                            } @else {
                                <mat-icon class="!text-sm align-middle mr-1">error</mat-icon>
                                {{ promo()!.rejectionReason }}
                            }
                        </div>
                    }

                    <div class="border-t pt-2 mt-1.5 space-y-1">
                        <div class="flex justify-between text-sm"><span class="text-gray-600 dark:text-gray-400">Subtotal</span><span class="font-medium tabular-nums">{{ subTotal() | number:'1.2-2' }}</span></div>
                        <div class="flex justify-between text-sm"><span class="text-gray-600 dark:text-gray-400">Discount</span><span class="font-medium tabular-nums">−{{ totalDiscount() | number:'1.2-2' }}</span></div>
                        <div class="flex justify-between text-sm"><span class="text-gray-600 dark:text-gray-400">Tax</span><span class="font-medium tabular-nums">{{ totalTax() | number:'1.2-2' }}</span></div>
                        <div class="flex justify-between text-lg font-bold border-t pt-1 mt-0.5"><span>Total</span><span class="tabular-nums">{{ grandTotal() | number:'1.2-2' }}</span></div>
                        @if (effectiveRedeem() > 0) {
                            <div class="flex justify-between text-sm text-amber-700 dark:text-amber-300"><span>Loyalty redeemed</span><span class="font-medium tabular-nums">−{{ effectiveRedeem() | number:'1.2-2' }}</span></div>
                            <div class="flex justify-between text-base font-semibold"><span>Amount due</span><span class="tabular-nums">{{ amountDue() | number:'1.2-2' }}</span></div>
                        }
                    </div>
                </mat-card>

                <!-- Payment -->
                <mat-card class="!p-2">
                    <div class="flex items-center gap-1 mb-1">
                        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="!my-0 w-44">
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
                        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1 !my-0">
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
    private readonly serialsApi = inject(StockSerialsService);
    private readonly customersApi = inject(CustomersService);
    private readonly salesApi = inject(SalesService);
    private readonly promosApi = inject(PromotionsService);
    private readonly currentOutlet = inject(CurrentOutletService);
    private readonly shiftsApi = inject(ShiftsService);
    private readonly snack = inject(MatSnackBar);
    private readonly router = inject(Router);
    private readonly dialog = inject(MatDialog);
    private readonly receiptPrint = inject(ReceiptPrintService);
    private readonly tenantInfo = inject(TenantInfoService);

    showElectronics = (): boolean => this.tenantInfo.isVertical('Electronics');
    private readonly parkedApi = inject(ParkedCartsService);
    private readonly brandingApi = inject(BrandingProfilesService);
    private readonly _confirm = inject(FuseConfirmationService);

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

    /** True for any cart line whose quantity exceeds available stock at the
     * current outlet. Stock-data-not-loaded → no warning (don't block sales
     * because the chip data hasn't arrived yet). */
    lineExceedsStock = (line: CartLine): boolean => {
        const stockMap = this.stockByProduct();
        if (stockMap.size === 0) return false;
        const available = stockMap.get(line.productId) ?? 0;
        return line.quantity > available;
    };

    /** Computed once per change so the Finalize button + warning banner share
     * the same evaluation. */
    cartHasStockIssue = computed(() => this.cart().some(l => this.lineExceedsStock(l)));

    /** True when any cart line has a typed-but-invalid serial. Pending state
     * is tolerated (still in flight); only confirmed 'invalid' blocks. */
    cartHasSerialIssue = computed(() => this.cart().some(l => l.serialValidation === 'invalid'));

    /** True when any line is for a serial-tracked product but the serial input
     * is still empty. Mirrors the server-side validator so the cashier sees
     * the block locally instead of paying a 400 round-trip on Finalize. */
    cartHasMissingRequiredSerial = computed(() =>
        this.cart().some(l => l.requiresSerial && !(l.serialNumber ?? '').trim()));

    canFinalize = computed(() =>
        this.cart().length > 0
        && !!this.outletId
        && !this.cartHasStockIssue()
        && !this.cartHasSerialIssue()
        && !this.cartHasMissingRequiredSerial()
    );

    /**
     * Validate the typed serial on a cart line: GET /api/stockserials/by-serial/{sn}
     * → check status === 'InStock' AND outletId matches the active outlet AND
     * productId matches the line's product. Updates the line's
     * serialValidation / serialError fields in place. Pure UX — server still
     * does the authoritative check at finalize.
     */
    validateLineSerial(line: CartLine): void {
        const sn = (line.serialNumber ?? '').trim();
        if (!sn) {
            line.serialValidation = undefined;
            line.serialError = undefined;
            return;
        }
        line.serialValidation = 'pending';
        line.serialError = undefined;
        this.serialsApi.bySerial(sn).subscribe({
            next: (s) => {
                if (s.status !== 'InStock') {
                    line.serialValidation = 'invalid';
                    line.serialError = `Serial is ${s.status}, not InStock.`;
                } else if (s.outletId !== this.outletId) {
                    line.serialValidation = 'invalid';
                    line.serialError = 'Serial belongs to a different outlet.';
                } else if (s.productId !== line.productId) {
                    line.serialValidation = 'invalid';
                    line.serialError = `Serial belongs to a different product.`;
                } else {
                    line.serialValidation = 'valid';
                    line.serialError = undefined;
                }
                // Trigger a signal change so the template re-evaluates the
                // cartHasSerialIssue computed.
                this.cart.set([...this.cart()]);
            },
            error: () => {
                line.serialValidation = 'invalid';
                line.serialError = 'Serial not found.';
                this.cart.set([...this.cart()]);
            },
        });
    }

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

    /** X-button handler: wipe the box and refocus so the cashier can type fresh. */
    clearSearch(): void {
        this.search.set('');
        this.focusSearch();
    }

    ngOnInit(): void {
        this.outletsApi.getAll().subscribe(o => {
            this.outlets.set(o);
            if (o.length === 0) {
                // No outlets at all — fetch products without outlet pricing so the picker still works.
                this.refreshProducts();
                return;
            }
            // Restore the last-used outlet if it's still in the user's allowed list,
            // otherwise fall back to the first available outlet.
            const remembered = this.currentOutlet.outletId();
            const match = remembered && o.find(x => x.id === remembered);
            this.outletId = match ? match.id : o[0].id;
            this.prevOutletId = this.outletId;
            this.currentOutlet.set(this.outletId);
            this.brandingProfileId = this.outletDefaultBranding();
            this.refreshShift();
            this.refreshParkedCount();
            this.refreshStock();
            // Re-fetch products now that we have an outletId so cards show outlet-resolved prices.
            this.refreshProducts();
        });
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

    /** Previous outletId, captured BEFORE ngModel applies the new value, so we
     * can revert if the cashier cancels the "discard cart?" confirm. */
    private prevOutletId: string | null = null;

    onOutletChange(): void {
        // Guard: switching outlets mid-sale silently abandoned the cart pre-2.36d.
        // Now we confirm — cancel rolls the picker back, OK clears the cart so
        // the new outlet's stock chips / shift / parked-cart state align.
        if (this.cart().length > 0 && this.prevOutletId && this.outletId !== this.prevOutletId) {
            const n = this.cart().length;
            const target = this.outletId;
            const previous = this.prevOutletId;
            // Revert the picker until the user confirms — async dialog means
            // we can't block, so optimistic switch would briefly show the new
            // outlet's data even if they cancel.
            this.outletId = previous;
            this._confirm.open({
                title: 'Discard cart?',
                message: `Switching outlets will discard your cart of ${n} item${n === 1 ? '' : 's'}.`,
                icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
                actions: { confirm: { label: 'Discard & switch', color: 'warn' }, cancel: { label: 'Stay here' } },
            }).afterClosed().subscribe(result => {
                if (result !== 'confirmed') return;
                this.outletId = target;
                this.cart.set([]);
                this.promo.set(null);
                this.promoCode = '';
                this.payAmount = null;
                this.customerId = null;
                this.redeemPoints = 0;
                this.applyOutletSwitch();
            });
            return;
        }
        this.applyOutletSwitch();
    }

    private applyOutletSwitch(): void {
        this.prevOutletId = this.outletId;
        this.currentOutlet.set(this.outletId);
        this.brandingProfileId = this.outletDefaultBranding();
        this.refreshShift();
        this.refreshParkedCount();
        this.refreshStock();
        // Outlet-resolved prices are stamped server-side from the outletId param —
        // re-fetch so product cards show the right price after a switch.
        this.refreshProducts();
    }

    private refreshProducts(): void {
        const params: { isActive: boolean; outletId?: string } = { isActive: true };
        if (this.outletId) params.outletId = this.outletId;
        this.productsApi.getAll(params).subscribe(p => this.products.set(p));
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
        if (match) {
            this.addToCart(match);
            this.search.set('');
            return;
        }
        // No product match — the term might be a stock-serial number scanned
        // off an electronics item's box. Try the by-serial lookup; on hit at
        // the current outlet, add the product line with the serial pre-set.
        // Killer feature for electronics shops: scan once, no manual typing.
        // Skip the by-serial probe entirely for non-Electronics tenants — the
        // /api/stockserials endpoint is gated [Electronics, Generic] so a
        // Pharmacy/Supermarket tenant would just get a 403 every scan.
        if (!this.showElectronics()) return;
        this.serialsApi.bySerial(term).subscribe({
            next: (serial) => {
                if (serial.status !== 'InStock' || serial.outletId !== this.outletId) return;
                const sProduct = all.find(p => p.id === serial.productId);
                if (!sProduct) return;
                this.addToCartWithSerial(sProduct, term);
                this.search.set('');
            },
            error: () => { /* not a serial either — leave the search term, cashier picks manually */ },
        });
    }

    /** Adds a fresh cart line for a serial-tracked item with the serial
     * already populated + validated. Skips the duplicate-line merge from
     * regular `addToCart` because each serial is a separate physical unit. */
    /** Price to use for a fresh cart line. Mirrors the server-side resolution
     * chain: outlet override > active offer > catalog base. The DTO carries
     * all three so we don't need a round-trip — resolvePrice() still patches
     * later if outlet pricing changed since the page loaded. */
    private effectivePrice(p: ProductDto): number {
        if (p.isOutletPriceOverride && p.outletSellingPrice != null) return p.outletSellingPrice;
        if (p.isOfferActive && p.offerPrice != null) return p.offerPrice;
        return p.sellingPrice;
    }

    addToCartWithSerial(p: ProductDto, serialNumber: string): void {
        const newLine: CartLine = {
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            quantity: 1,
            unitPrice: this.effectivePrice(p),
            discountAmount: 0,
            taxRate: p.taxRate,
            serialNumber,
            serialValidation: 'valid',
            requiresSerial: p.requiresSerial,
            isImeiRequired: p.isImeiRequired,
            requiresBatch: p.requiresBatch,
        };
        this.cart.set([...this.cart(), newLine]);
        this.recalc();
        // Resolve outlet pricing (if any) — same path as addToCart, just for
        // the just-pushed line.
        if (this.outletId) {
            this.productsApi.resolvePrice(p.id, this.outletId).subscribe({
                next: r => {
                    if (r.isOverride) {
                        const updated = this.cart().map(l =>
                            l === newLine ? { ...l, unitPrice: r.sellingPrice } : l);
                        this.cart.set(updated);
                        this.recalc();
                    }
                },
                error: () => { /* keep base price */ },
            });
        }
        setTimeout(() => this.focusSearch(), 0);
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
            unitPrice: this.effectivePrice(p),
            discountAmount: 0,
            taxRate: p.taxRate,
            requiresSerial: p.requiresSerial,
            isImeiRequired: p.isImeiRequired,
            requiresBatch: p.requiresBatch,
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
                // Fetch the finalized sale for the receipt and offer to share the
                // public link via WhatsApp / clipboard. Reset the cart either way
                // so the next customer can start ringing up.
                this.salesApi.get(id).subscribe(sale => this.printReceipt(sale));
                const outletName = this.outlets().find(o => o.id === this.outletId)?.name ?? '';
                this.snack.open(`Sale finalized — invoice in print queue.`, 'Share', { duration: 6000 })
                    .onAction().subscribe(() => {
                        this.salesApi.get(id).subscribe(sale => {
                            this.dialog.open(ShareInvoiceDialogComponent, {
                                width: '520px',
                                data: {
                                    saleId: id,
                                    invoiceNumber: sale.invoiceNumber,
                                    outletName,
                                    customerPhone: sale.customerPhone,
                                },
                            });
                        });
                    });
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
