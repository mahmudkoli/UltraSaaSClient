import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

export interface PageHeaderAction {
  label: string;
  icon?: string;
  routerLink?: string;
  click?: () => void;
  type?: 'primary' | 'secondary' | 'fab';
  color?: 'primary' | 'accent' | 'warn';
  class?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterModule
  ],
  template: `
    <div class="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center space-x-4">
        <div class="page-header__icon flex items-center justify-center w-12 h-12 rounded-xl shadow-md"
             [ngClass]="iconClass">
          <mat-icon class="text-white text-2xl">{{ icon }}</mat-icon>
        </div>
        <div>
          <h1 class="page-header__title text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {{ title }}
          </h1>
          <p *ngIf="subtitle" class="page-header__subtitle mt-1 text-sm text-gray-600 dark:text-gray-400">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <div *ngIf="actions?.length" class="page-header__actions flex items-center gap-3 flex-shrink-0">
        <ng-container *ngFor="let action of actions">

          <!-- FAB Button -->
          <button *ngIf="action.type === 'fab'"
                  mat-fab
                  [color]="action.color || 'primary'"
                  [routerLink]="action.routerLink"
                  (click)="action.click && action.click()"
                  [matTooltip]="action.label"
                  [class]="action.class">
            <mat-icon>{{ action.icon }}</mat-icon>
          </button>

          <!-- Primary Button -->
          <button *ngIf="action.type === 'primary'"
                  mat-raised-button
                  [color]="action.color || 'primary'"
                  [routerLink]="action.routerLink"
                  (click)="action.click && action.click()"
                  [class]="action.class">
            <mat-icon *ngIf="action.icon" class="mr-2">{{ action.icon }}</mat-icon>
            {{ action.label }}
          </button>

          <!-- Secondary Button -->
          <button *ngIf="action.type === 'secondary' || !action.type"
                  mat-stroked-button
                  [color]="action.color"
                  [routerLink]="action.routerLink"
                  (click)="action.click && action.click()"
                  [class]="action.class">
            <mat-icon *ngIf="action.icon" class="mr-2">{{ action.icon }}</mat-icon>
            {{ action.label }}
          </button>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      min-height: 80px;
    }

    .page-header__icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .page-header__icon.tenant {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .page-header__icon.institute {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .page-header__icon.security {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .page-header__icon.features {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .page-header__icon.dashboard {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }

    @media (max-width: 640px) {
      .page-header__actions {
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() icon: string = 'widgets';
  @Input() iconType: 'tenant' | 'institute' | 'security' | 'features' | 'dashboard' | 'default' = 'default';
  @Input() actions?: PageHeaderAction[];

  get iconClass(): string {
    return `page-header__icon ${this.iconType}`;
  }
}