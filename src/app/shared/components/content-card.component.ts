import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-content-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content-card"
         [ngClass]="cardClass">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .content-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      border: 1px solid #e5e7eb;
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }

    .content-card.hover:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transform: translateY(-1px);
    }

    .content-card.elevated {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .content-card.flat {
      box-shadow: none;
      border: 1px solid #e5e7eb;
    }

    .content-card.compact {
      padding: 1rem;
    }

    .content-card.standard {
      padding: 1.5rem;
    }

    .content-card.spacious {
      padding: 2rem;
    }

    .dark .content-card {
      background: #1f2937;
      border-color: #374151;
    }
  `]
})
export class ContentCardComponent {
  @Input() padding: 'compact' | 'standard' | 'spacious' = 'standard';
  @Input() elevation: 'flat' | 'elevated' | 'hover' = 'hover';
  @Input() customClass: string = '';

  get cardClass(): string {
    return [
      this.padding,
      this.elevation,
      this.customClass
    ].filter(Boolean).join(' ');
  }
}