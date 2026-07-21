import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

/**
 * MK Corex HRM dashboard (placeholder).
 *
 * The Edu analytics dashboard (student / health / fee KPIs) was removed in the
 * F0 frontend strip. A proper HRM dashboard — headcount, attendance, leave and
 * payroll summaries — is a later FE sprint (see docs/hrm 05-ROADMAP F1–F4).
 * Until then this is a neutral landing with quick links into the HR modules.
 */
@Component({
    selector       : 'analytics-dashboard',
    standalone     : true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports        : [CommonModule, RouterLink, MatIconModule],
    template       : `
        <div class="flex flex-col flex-auto min-w-0 p-6 sm:p-10">
            <div class="mb-8">
                <h1 class="text-3xl font-bold tracking-tight">MK Corex HRM</h1>
                <p class="mt-1 text-secondary">
                    Welcome. The HR dashboard with headcount, attendance, leave and
                    payroll insights is on the way — jump into a module to get started.
                </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <a *ngFor="let tile of tiles"
                   [routerLink]="tile.link"
                   class="flex items-center p-6 rounded-2xl shadow bg-card hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-700">
                        <mat-icon class="text-primary-700" [svgIcon]="tile.icon"></mat-icon>
                    </div>
                    <div class="ml-4">
                        <div class="text-lg font-semibold leading-none">{{ tile.title }}</div>
                        <div class="mt-1 text-sm text-secondary">{{ tile.subtitle }}</div>
                    </div>
                </a>
            </div>
        </div>
    `,
})
export class AnalyticsDashboardComponent {
    tiles = [
        { title: 'Employees', subtitle: 'Manage staff records', icon: 'heroicons_outline:identification', link: '/employees' },
        { title: 'Leaves', subtitle: 'Leave applications & approvals', icon: 'heroicons_outline:calendar', link: '/leaves' },
        { title: 'Payroll', subtitle: 'Payslips & runs', icon: 'heroicons_outline:banknotes', link: '/payroll' },
        { title: 'Users', subtitle: 'Accounts & roles', icon: 'heroicons_outline:users', link: '/users' },
        { title: 'Institute', subtitle: 'Company profile', icon: 'heroicons_outline:building-office', link: '/institute' },
        { title: 'Subscription', subtitle: 'Plan & billing', icon: 'heroicons_outline:credit-card', link: '/subscription' },
    ];
}
