import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Initials avatar — renders the logged-in user's initials in a coloured circle
 * (fallback when there's no uploaded avatar image). Mirrors the POS user-avatar.
 */
@Component({
    selector: 'user-avatar',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [CommonModule],
    template: `
        <div class="flex items-center justify-center rounded-full shrink-0"
             [ngClass]="sizeClass"
             [style.background-color]="bg">
            <span class="text-white font-semibold uppercase select-none leading-none" [ngClass]="textClass">{{ initials }}</span>
        </div>
    `,
})
export class UserAvatarComponent {
    @Input() name?: string | null;
    @Input() email?: string | null;
    @Input() size: 'sm' | 'md' | 'lg' = 'md';

    /** First letters of the first + last name parts (or first two of a single word / email local-part). */
    get initials(): string {
        const source = (this.name && this.name.trim()) || (this.email || '').split('@')[0] || '';
        const parts = source.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return '?';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    get bg(): string { return 'rgb(75, 52, 178)'; }

    get sizeClass(): string {
        return { sm: 'w-7 h-7', md: 'w-10 h-10', lg: 'w-24 h-24' }[this.size];
    }

    get textClass(): string {
        return { sm: 'text-xs', md: 'text-base', lg: 'text-3xl' }[this.size];
    }
}
