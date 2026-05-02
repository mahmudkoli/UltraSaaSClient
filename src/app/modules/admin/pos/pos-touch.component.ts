import { Component, ViewEncapsulation } from '@angular/core';
import { PosComponent } from './pos.component';

/**
 * Touch / Kiosk POS layout — bigger fonts, taller buttons, more breathing
 * room. Designed for touchscreen terminals where fat-finger taps are
 * common. Same logic as the default POS.
 */
@Component({
    selector: 'app-pos-touch',
    standalone: true,
    imports: [PosComponent],
    encapsulation: ViewEncapsulation.None,
    host: { class: 'flex-1 flex flex-col min-h-0' },
    template: `<div class="pos-layout-touch flex-1 flex flex-col min-h-0"><app-pos></app-pos></div>`,
    styles: [`
        .pos-layout-touch { font-size: 16px; }
        .pos-layout-touch h3 { font-size: 18px; }
        .pos-layout-touch .text-base { font-size: 17px !important; }
        .pos-layout-touch .text-sm { font-size: 15px !important; }
        .pos-layout-touch .text-xs { font-size: 14px !important; }
        .pos-layout-touch button.mat-mdc-stroked-button,
        .pos-layout-touch button.mat-mdc-raised-button,
        .pos-layout-touch button.mat-mdc-flat-button {
            min-height: 56px !important;
            font-size: 16px !important;
            padding-left: 24px !important;
            padding-right: 24px !important;
        }
        .pos-layout-touch button.mat-mdc-icon-button { width: 48px !important; height: 48px !important; }
        .pos-layout-touch mat-card { padding: 16px !important; }
        .pos-layout-touch input { font-size: 17px !important; padding: 12px !important; }
        .pos-layout-touch .gap-3 { gap: 1rem !important; }
        .pos-layout-touch .gap-4 { gap: 1.25rem !important; }
        .pos-layout-touch .grid { gap: 1rem !important; }
        .pos-layout-touch .grid > button { padding: 1rem !important; min-height: 96px; }
        .pos-layout-touch .icon-size-4 { font-size: 22px !important; width: 22px !important; height: 22px !important; }
        .pos-layout-touch .icon-size-5 { font-size: 26px !important; width: 26px !important; height: 26px !important; }
    `],
})
export class PosTouchComponent {}
