import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * Canonical list-page chrome — matches the established Fuse pattern used by
 * pre-freeze admin pages (students / classes / tenants etc.).
 *
 *   <app-list-page
 *     title="Hostels"
 *     subtitle="Hostel buildings with occupancy + warden + monthly fee."
 *     icon="apartment"
 *     iconGradient="from-amber-500 to-orange-600"
 *     pageGradient="from-gray-50 via-amber-50/30 to-orange-50/30">
 *     <ng-container pageActions>
 *       <mat-form-field>...search</mat-form-field>
 *       <button mat-fab color="primary"><mat-icon>add</mat-icon></button>
 *     </ng-container>
 *
 *     <!-- card / table / form body goes here -->
 *   </app-list-page>
 */
@Component({
    selector: 'app-list-page',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'flex flex-col flex-auto min-w-0' },
    template: `
<div class="flex flex-col flex-auto min-w-0 bg-gradient-to-br {{ pageGradient }} dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative">
    <div class="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0); background-size: 20px 20px;"></div>
    </div>
    <div class="relative z-10 flex flex-col flex-auto min-w-0">
        <div class="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-0 sm:items-center sm:justify-between p-2 sm:py-3 sm:px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r {{ iconGradient }} rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200">
                    <mat-icon class="text-white">{{ icon }}</mat-icon>
                </div>
                <div>
                    <h2 class="text-3xl font-bold tracking-tight leading-7 sm:leading-10 truncate bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {{ title }}
                    </h2>
                    <p *ngIf="subtitle" class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ subtitle }}</p>
                </div>
            </div>
            <div class="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 sm:flex-none sm:items-center sm:justify-end gap-3">
                <ng-content select="[pageActions]"></ng-content>
            </div>
        </div>
        <div class="flex-auto p-4 sm:p-6">
            <ng-content></ng-content>
        </div>
    </div>
</div>
    `
})
export class ListPageComponent {
    @Input() title = '';
    @Input() subtitle?: string;
    @Input() icon = 'widgets';
    @Input() iconGradient = 'from-blue-500 to-purple-600';
    @Input() pageGradient = 'from-gray-50 via-blue-50/30 to-purple-50/30';
}
