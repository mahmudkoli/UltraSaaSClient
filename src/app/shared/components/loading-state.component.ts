import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="loading-state flex items-center justify-center" [ngClass]="containerClass">
      <div class="loading-content text-center space-y-4">
        <mat-spinner [diameter]="spinnerSize" class="mx-auto"></mat-spinner>
        <div *ngIf="message" class="loading-message">
          <p class="text-gray-600 dark:text-gray-400" [ngClass]="messageClass">
            {{ message }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-state {
      min-height: 200px;
    }

    .loading-state.fullscreen {
      min-height: 50vh;
    }

    .loading-state.compact {
      min-height: 120px;
    }

    .loading-content {
      padding: 2rem;
    }
  `]
})
export class LoadingStateComponent {
  @Input() message: string = 'Loading...';
  @Input() size: 'small' | 'medium' | 'large' | 'fullscreen' = 'medium';
  @Input() overlay: boolean = false;

  get containerClass(): string {
    const classes = [];

    switch (this.size) {
      case 'small':
        classes.push('compact');
        break;
      case 'large':
      case 'fullscreen':
        classes.push('fullscreen');
        break;
      default:
        break;
    }

    if (this.overlay) {
      classes.push('fixed', 'inset-0', 'bg-white', 'bg-opacity-80', 'dark:bg-gray-900', 'dark:bg-opacity-80', 'z-50');
    }

    return classes.join(' ');
  }

  get spinnerSize(): number {
    switch (this.size) {
      case 'small':
        return 32;
      case 'large':
      case 'fullscreen':
        return 64;
      default:
        return 48;
    }
  }

  get messageClass(): string {
    switch (this.size) {
      case 'small':
        return 'text-sm';
      case 'large':
      case 'fullscreen':
        return 'text-lg';
      default:
        return 'text-base';
    }
  }
}