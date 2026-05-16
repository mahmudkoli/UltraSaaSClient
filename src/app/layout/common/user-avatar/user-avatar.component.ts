import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Initials-in-coloured-circle fallback when a user has no uploaded avatar.
 * Used by the topbar user-dropdown trigger and the classy sidebar header.
 *
 * <para>The colour is a deterministic hash of the name so a given user gets the
 * same swatch every session (a Gmail / Slack / GitHub convention). Initials are
 * computed Latin-first (first letter of first word + first letter of last word);
 * falls back to a question mark when the name is empty.</para>
 *
 * <para>POS context: multiple staff often share the same workstation. Showing
 * initials confirms whose session is active without needing a profile-photo
 * upload feature (which we don't plan to add pre-launch).</para>
 */
@Component({
    selector: 'user-avatar',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div [class]="containerClass" [style.background-color]="bgColor">
            <span class="text-white font-semibold uppercase select-none leading-none" [class]="textClass">{{ initials }}</span>
        </div>
    `,
})
export class UserAvatarComponent {
    @Input() name: string | null | undefined = '';
    @Input() size: 'sm' | 'md' | 'lg' = 'md';

    get initials(): string {
        const n = (this.name ?? '').trim();
        if (!n) return '?';
        const parts = n.split(/\s+/).filter(Boolean);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    /** HSL hue derived from name so the same user always gets the same colour. */
    get bgColor(): string {
        const n = (this.name ?? '').trim();
        if (!n) return '#9ca3af';
        let hash = 0;
        for (let i = 0; i < n.length; i++) hash = ((hash << 5) - hash + n.charCodeAt(i)) | 0;
        const hue = Math.abs(hash) % 360;
        // 55% saturation / 45% lightness keeps every hash within a readable
        // band — no eye-searing yellows, no near-black blues. White text on top
        // stays AA-contrast across the whole range.
        return `hsl(${hue}, 55%, 45%)`;
    }

    get containerClass(): string {
        const sizeClass =
            this.size === 'sm' ? 'w-7 h-7'
            : this.size === 'lg' ? 'w-24 h-24'
            : 'w-10 h-10';
        return `${sizeClass} rounded-full flex items-center justify-center shrink-0`;
    }

    get textClass(): string {
        return this.size === 'sm' ? 'text-xs'
             : this.size === 'lg' ? 'text-3xl'
             : 'text-sm';
    }
}
