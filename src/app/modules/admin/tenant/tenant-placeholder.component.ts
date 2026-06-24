import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';

/**
 * Generic "coming soon" placeholder for tenant sub-features whose backend was
 * dropped in Phase v1-C2.2 (billing, usage). Wired so the Tenant-Management
 * action buttons navigate somewhere meaningful instead of dead-ending on a
 * non-existent route (Phase v1 QA C3). Title/blurb come from route `data`.
 */
@Component({
    selector: 'tenant-placeholder',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink],
    template: `
        <div class="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
            <div class="flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-6">
                <mat-icon class="!w-10 !h-10 !text-4xl text-white">{{ icon }}</mat-icon>
            </div>
            <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">{{ title }}</h1>
            <p class="mt-2 max-w-md text-gray-500 dark:text-gray-400">{{ message }}</p>
            <a mat-stroked-button routerLink="/tenant" class="mt-6">
                <mat-icon class="mr-2">arrow_back</mat-icon>
                Back to Tenant Management
            </a>
        </div>
    `,
})
export class TenantPlaceholderComponent {
    title = 'Coming soon';
    message = 'This feature is not available yet.';
    icon = 'construction';

    constructor(route: ActivatedRoute) {
        const data = route.snapshot.data;
        if (data['title']) this.title = data['title'];
        if (data['message']) this.message = data['message'];
        if (data['icon']) this.icon = data['icon'];
    }
}
