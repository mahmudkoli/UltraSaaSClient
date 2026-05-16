import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, computed, inject, signal } from '@angular/core';
import { TenantInfoService } from 'app/core/auth/tenant-info.service';

/**
 * Renders the current tenant's uploaded logo where the Fuse layouts used to
 * hardcode `assets/images/logo/*.svg`. Falls back to the static MK Corex
 * asset (passed in via `fallbackSrc`) when:
 *   - the tenant hasn't uploaded a logo, or
 *   - the logo URL 404s for any reason (mid-deploy race, missing row, etc.).
 *
 * The `cssClass` input is forwarded to the inner `<img>` so callers can pass
 * the same Tailwind classes the original `<img>` had (e.g. `w-8`, `max-w-36`).
 * Use as a 1:1 swap:
 *   before: <img class="w-8" src="assets/images/logo/logo.svg">
 *   after:  <tenant-logo cssClass="w-8" fallbackSrc="assets/images/logo/logo.svg"></tenant-logo>
 */
@Component({
    selector: 'tenant-logo',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<img [src]="src()" [class]="cssClass" [alt]="alt" (error)="onError()" />`,
})
export class TenantLogoComponent {
    @Input() cssClass = '';
    @Input() fallbackSrc = 'assets/images/logo/logo.svg';
    @Input() alt = 'Logo';

    private readonly tenantInfo = inject(TenantInfoService);
    private readonly _errored = signal(false);

    readonly src = computed<string>(() => {
        if (this._errored()) return this.fallbackSrc;
        return this.tenantInfo.logoUrl() ?? this.fallbackSrc;
    });

    onError(): void {
        this._errored.set(true);
    }
}
