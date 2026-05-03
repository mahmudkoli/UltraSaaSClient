import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HelpService } from 'app/core/help/help.service';

/**
 * Tiny `?` icon dropped into the layout toolbar. Toggles the help drawer.
 * Stateless — every visual concern lives on HelpService (open/close, language)
 * and the drawer itself.
 */
@Component({
    selector: 'help-button',
    standalone: true,
    imports: [MatButtonModule, MatIconModule, MatTooltipModule],
    template: `
        <button mat-icon-button (click)="help.toggle()" matTooltip="Help / সহায়তা" aria-label="Open help">
            <mat-icon>help_outline</mat-icon>
        </button>
    `,
})
export class HelpButtonComponent {
    readonly help = inject(HelpService);
}
