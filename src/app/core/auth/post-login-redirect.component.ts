import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionsService } from 'app/core/auth/permissions.service';

/**
 * Phase 2.48 — post-login landing router. Replaces the old static
 * `redirectTo: 'pos'` so root admins land on the platform dashboard and
 * tenant admins (with Dashboards.View, when 2.49 ships) land on the tenant
 * dashboard. Until 2.49, the middle branch falls through to /pos cleanly.
 *
 * Priority:
 *   1. Tenants.View                → /admin-dashboard   (root admin)
 *   2. Dashboards.View             → /dashboard         (reserved for 2.49 — falls to /pos for now)
 *   3. else                        → /pos               (cashier landing)
 */
@Component({
    selector: 'app-post-login-redirect',
    standalone: true,
    template: '',
})
export class PostLoginRedirectComponent implements OnInit {
    private readonly perms = inject(PermissionsService);
    private readonly router = inject(Router);

    ngOnInit(): void {
        const target = this.resolve();
        this.router.navigateByUrl(target, { replaceUrl: true });
    }

    private resolve(): string {
        // Root admin holds Tenants.View — the universal root permission marker.
        if (this.perms.has('Permissions.Tenants.View')) return '/admin-dashboard';
        // Reserved for Phase 2.49 tenant dashboard. Today nobody holds the perm
        // (it's not in any role pool), so this branch is never hit — but the
        // resolver is shaped so 2.49 only needs to seed the permission, not
        // change routing logic.
        if (this.perms.has('Permissions.Dashboards.View')) return '/dashboard';
        return '/pos';
    }
}
