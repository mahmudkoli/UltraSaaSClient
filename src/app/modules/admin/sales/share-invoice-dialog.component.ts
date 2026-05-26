import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { SalesService } from 'app/core/sales/sales.service';
import { TenantService } from 'app/core/tenant/tenant.service';

export interface ShareInvoiceDialogData {
    saleId: string;
    invoiceNumber: string;
    outletName: string;
    customerPhone?: string;
}

type Lang = 'bn' | 'en';

/**
 * "Share invoice" dialog. Generates (idempotently) the public share token for the sale,
 * builds the public viewer URL, and presents three send paths — WhatsApp deep link,
 * clipboard copy, and the Web Share API where supported. The Bangla preset is the
 * default since the target market is Bangladesh; English is one click away.
 */
@Component({
    selector: 'app-share-invoice-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslocoModule, MatButtonModule, MatButtonToggleModule, MatDialogModule,
        MatFormFieldModule, MatIconModule, MatInputModule, MatTooltipModule],
    template: `
<div class="p-6 min-w-[460px] max-w-[520px]">
    <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
            <mat-icon class="text-emerald-600">share</mat-icon>
        </div>
        <div>
            <h2 class="text-lg font-semibold">{{ 'SALES.DIALOG.SHARE_TITLE' | transloco }}</h2>
            <p class="text-xs text-gray-500">{{ 'SALES.DIALOG.SHARE_SUBTITLE' | transloco:{ invoice: data.invoiceNumber } }}</p>
        </div>
    </div>

    @if (loading()) {
        <div class="flex items-center justify-center py-8 text-gray-500">
            <mat-icon class="icon-size-5 mr-2 animate-spin">progress_activity</mat-icon>
            <span>{{ 'SALES.DIALOG.PREPARING' | transloco }}</span>
        </div>
    } @else if (errorMsg()) {
        <div class="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-sm text-rose-700 dark:text-rose-200">
            {{ errorMsg() }}
        </div>
        <div class="flex justify-end mt-4">
            <button mat-button (click)="ref.close()">{{ 'COMMON.CLOSE' | transloco }}</button>
        </div>
    } @else if (url()) {
        <mat-form-field appearance="outline" class="w-full">
            <mat-label>{{ 'SALES.DIALOG.PUBLIC_LINK' | transloco }}</mat-label>
            <input matInput [value]="url()" readonly>
            <button mat-icon-button matSuffix (click)="copyLink()" [matTooltip]="'SALES.DIALOG.COPY_LINK_TOOLTIP' | transloco">
                <mat-icon>content_copy</mat-icon>
            </button>
        </mat-form-field>

        <div class="flex items-center justify-between mt-2 mb-2">
            <span class="text-xs uppercase tracking-wider text-gray-500">{{ 'SALES.DIALOG.MESSAGE_LANGUAGE' | transloco }}</span>
            <mat-button-toggle-group [(ngModel)]="lang" hideSingleSelectionIndicator>
                <mat-button-toggle value="bn">বাংলা</mat-button-toggle>
                <mat-button-toggle value="en">English</mat-button-toggle>
            </mat-button-toggle-group>
        </div>

        <mat-form-field appearance="outline" class="w-full">
            <mat-label>{{ 'SALES.DIALOG.MESSAGE_PREVIEW' | transloco }}</mat-label>
            <textarea matInput [value]="message()" readonly rows="3"
                [class.font-bangla]="lang === 'bn'"></textarea>
        </mat-form-field>

        @if (!data.customerPhone) {
            <p class="text-xs text-amber-700 dark:text-amber-300 -mt-2 mb-2 flex items-center gap-1">
                <mat-icon class="icon-size-4">info</mat-icon>
                {{ 'SALES.DIALOG.NO_PHONE_NOTE' | transloco }}
            </p>
        }

        <div class="flex flex-col sm:flex-row gap-2 justify-end mt-4">
            <button mat-stroked-button (click)="copyLink()">
                <mat-icon class="icon-size-5 mr-1">link</mat-icon>
                <span>{{ 'SALES.DIALOG.COPY_LINK' | transloco }}</span>
            </button>
            @if (canNativeShare) {
                <button mat-stroked-button (click)="nativeShare()">
                    <mat-icon class="icon-size-5 mr-1">ios_share</mat-icon>
                    <span>{{ 'SALES.DIALOG.SHARE_BUTTON' | transloco }}</span>
                </button>
            }
            <button mat-flat-button class="!bg-emerald-600 !text-white" (click)="openWhatsApp()">
                <mat-icon class="icon-size-5 mr-1">whatsapp</mat-icon>
                <span>{{ 'SALES.DIALOG.WHATSAPP' | transloco }}</span>
            </button>
        </div>
    }
</div>
    `,
    styles: [`
        .font-bangla { font-family: 'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif; }
    `],
})
export class ShareInvoiceDialogComponent implements OnInit {
    private readonly salesApi = inject(SalesService);
    private readonly tenantSvc = inject(TenantService);
    private readonly snack = inject(MatSnackBar);
    private readonly _transloco = inject(TranslocoService);

    loading = signal(true);
    errorMsg = signal<string | null>(null);
    url = signal<string>('');
    lang: Lang = 'bn';

    readonly canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

    constructor(
        public ref: MatDialogRef<ShareInvoiceDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ShareInvoiceDialogData,
    ) {}

    ngOnInit(): void {
        const tenantId = this.tenantSvc.resolve();
        if (!tenantId) {
            this.loading.set(false);
            this.errorMsg.set(this._transloco.translate('SALES.DIALOG.TENANT_NOT_RESOLVED'));
            return;
        }
        this.salesApi.createShareToken(this.data.saleId).subscribe({
            next: ({ token }) => {
                this.loading.set(false);
                this.url.set(this.buildUrl(token, tenantId));
            },
            error: err => {
                this.loading.set(false);
                this.errorMsg.set(err?.error?.exception ?? err?.error?.title ?? this._transloco.translate('SALES.DIALOG.COULD_NOT_CREATE_LINK'));
            },
        });
    }

    /** Public viewer URL — Angular route on the same origin as the SPA, tenant in query string for Finbuckle. */
    private buildUrl(token: string, tenantId: string): string {
        const origin = window.location.origin;
        const tq = encodeURIComponent(tenantId);
        return `${origin}/invoice/${encodeURIComponent(token)}?tenant=${tq}`;
    }

    /** Bangla default — the target market. English is one click away. */
    message(): string {
        const outlet = this.data.outletName || '';
        const u = this.url();
        if (this.lang === 'bn') {
            return outlet
                ? `আপনার রসিদ — ${outlet}\n${u}`
                : `আপনার রসিদ:\n${u}`;
        }
        return outlet
            ? `Your receipt — ${outlet}\n${u}`
            : `Your receipt:\n${u}`;
    }

    openWhatsApp(): void {
        const text = encodeURIComponent(this.message());
        const phone = (this.data.customerPhone || '').replace(/[^\d+]/g, '');
        // wa.me requires international format without the leading +. If no phone,
        // omit the path segment so WhatsApp prompts the cashier to pick a contact.
        const phoneSegment = phone ? `${phone.startsWith('+') ? phone.slice(1) : phone}` : '';
        const link = phoneSegment
            ? `https://wa.me/${phoneSegment}?text=${text}`
            : `https://wa.me/?text=${text}`;
        window.open(link, '_blank', 'noopener');
    }

    async copyLink(): Promise<void> {
        try {
            await navigator.clipboard.writeText(this.url());
            this.snack.open(
                this._transloco.translate('SALES.DIALOG.LINK_COPIED'),
                this._transloco.translate('COMMON.YES'),
                { duration: 2000 });
        } catch {
            this.snack.open(
                this._transloco.translate('SALES.DIALOG.COULD_NOT_COPY'),
                this._transloco.translate('COMMON.YES'),
                { duration: 3500 });
        }
    }

    async nativeShare(): Promise<void> {
        try {
            await navigator.share({
                title: this._transloco.translate('SALES.DIALOG.NATIVE_SHARE_TITLE', { invoice: this.data.invoiceNumber }),
                text: this.message(),
                url: this.url(),
            });
        } catch {
            /* user cancelled — silent */
        }
    }
}
