import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BusinessType, TenantInfoService } from 'app/core/auth/tenant-info.service';

/**
 * Defense-in-depth companion to nav `meta.businessType` filtering — prevents
 * a bookmarked URL like `/inventory/serials` from rendering for a tenant
 * whose vertical doesn't own that page. Mirrors the backend
 * `[RequireBusinessType]` action filter: Generic + tenant-info-not-yet-loaded
 * pass; everything else must match the allow-list.
 */
export const verticalGuard = (...allowed: BusinessType[]): CanActivateFn => () => {
    const tenantInfo = inject(TenantInfoService);
    const router = inject(Router);

    if (tenantInfo.isVertical(...allowed)) return true;

    return router.parseUrl('/signed-in-redirect');
};
