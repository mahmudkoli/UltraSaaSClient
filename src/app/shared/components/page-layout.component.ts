import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent, PageHeaderAction } from './page-header.component';
import { LoadingStateComponent } from './loading-state.component';

// Re-export for convenience
export type { PageHeaderAction };

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    LoadingStateComponent
  ],
  template: `
    <div class="page-layout flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">

      <!-- Header -->
      <app-page-header
        [title]="title"
        [subtitle]="subtitle"
        [icon]="icon"
        [iconType]="iconType"
        [actions]="actions">
      </app-page-header>

      <!-- Content Area -->
      <div class="page-content flex-1 overflow-auto">
        <div class="content-container mx-auto" [ngClass]="contentClass">

          <!-- Loading State -->
          <app-loading-state
            *ngIf="loading"
            [message]="loadingMessage"
            [size]="loadingSize">
          </app-loading-state>

          <!-- Main Content -->
          <div *ngIf="!loading" class="main-content">
            <ng-content></ng-content>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-layout {
      background: #f9fafb;
    }

    .content-container {
      padding: 1.5rem;
    }

    .content-container.max-width-4xl {
      max-width: 56rem;
    }

    .content-container.max-width-6xl {
      max-width: 72rem;
    }

    .content-container.max-width-7xl {
      max-width: 80rem;
    }

    .content-container.full-width {
      max-width: none;
      width: 100%;
      padding: 0;
    }

    @media (max-width: 640px) {
      .content-container {
        padding: 1rem;
      }
    }

    .dark .page-layout {
      background: #111827;
    }
  `]
})
export class PageLayoutComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() icon: string = 'widgets';
  @Input() iconType: 'tenant' | 'institute' | 'security' | 'features' | 'dashboard' | 'default' = 'default';
  @Input() actions?: PageHeaderAction[];

  @Input() loading: boolean = false;
  @Input() loadingMessage: string = 'Loading...';
  @Input() loadingSize: 'small' | 'medium' | 'large' = 'medium';

  @Input() maxWidth: '4xl' | '6xl' | '7xl' | 'full' = '6xl';

  get contentClass(): string {
    return `max-width-${this.maxWidth}`;
  }
}