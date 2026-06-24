import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

/**
 * Global 404 page (Phase v1 QA C2). Rendered by the `**` wildcard route so
 * unknown URLs land here instead of hanging forever on the loading screen.
 */
@Component({
    selector: 'not-found',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink],
    template: `
        <div class="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            <div class="flex items-center justify-center h-24 w-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-6">
                <mat-icon class="!w-12 !h-12 !text-5xl text-white">travel_explore</mat-icon>
            </div>
            <div class="text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">404</div>
            <h1 class="mt-2 text-2xl font-semibold text-gray-800 dark:text-gray-100">Page not found</h1>
            <p class="mt-2 max-w-md text-gray-500 dark:text-gray-400">
                The page you’re looking for doesn’t exist or may have been moved.
            </p>
            <a mat-flat-button color="primary" routerLink="/" class="mt-6">
                <mat-icon class="mr-2">home</mat-icon>
                Back to Home
            </a>
        </div>
    `,
})
export class NotFoundComponent {}
