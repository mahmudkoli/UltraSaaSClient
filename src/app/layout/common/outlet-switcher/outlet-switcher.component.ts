import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OutletsService } from 'app/core/outlets/outlets.service';
import { OutletDto } from 'app/core/outlets/outlets.types';
import { CurrentOutletService } from 'app/core/outlets/current-outlet.service';
import { AuthService } from 'app/core/auth/auth.service';

/**
 * Top-bar outlet switcher. Reads the user's allowed outlets via OutletsService
 * (already filtered server-side per UserOutlet membership) and writes the
 * choice to CurrentOutletService so every screen uses the same default.
 */
@Component({
    selector: 'outlet-switcher',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
    template: `
@if (visible()) {
    <button mat-stroked-button class="!min-h-0 !h-9 !px-3 max-w-56 truncate"
            [matMenuTriggerFor]="menu"
            [disabled]="outlets().length <= 1"
            matTooltip="Switch outlet">
        <mat-icon class="icon-size-5 mr-1">store</mat-icon>
        <span class="truncate">{{ currentName() }}</span>
        <mat-icon class="icon-size-5 ml-1" *ngIf="outlets().length > 1">expand_more</mat-icon>
    </button>
    <mat-menu #menu="matMenu" xPosition="before">
        <button mat-menu-item *ngFor="let o of outlets()"
                (click)="pick(o)"
                [class.font-semibold]="o.id === currentOutlet.outletId()">
            <mat-icon class="icon-size-5" [class.text-emerald-600]="o.id === currentOutlet.outletId()">
                {{ o.id === currentOutlet.outletId() ? 'check_circle' : 'store' }}
            </mat-icon>
            <span class="ml-2">{{ o.name }}</span>
            <span class="ml-2 text-xs text-gray-500 font-mono">{{ o.code }}</span>
        </button>
    </mat-menu>
}
    `,
})
export class OutletSwitcherComponent implements OnInit {
    private readonly outletsApi = inject(OutletsService);
    private readonly auth = inject(AuthService);
    readonly currentOutlet = inject(CurrentOutletService);

    outlets = signal<OutletDto[]>([]);

    visible = computed(() => this.outlets().length > 0);

    currentName = computed(() => {
        const id = this.currentOutlet.outletId();
        const match = this.outlets().find(o => o.id === id);
        return match?.name ?? this.outlets()[0]?.name ?? 'No outlet';
    });

    ngOnInit(): void {
        if (!this.auth.isAuthenticated()) return;
        this.outletsApi.getAll().subscribe({
            next: o => {
                this.outlets.set(o ?? []);
                if (!this.currentOutlet.outletId() && o.length > 0) {
                    this.currentOutlet.set(o[0].id);
                }
            },
            error: () => { /* unauthenticated or no permission — switcher stays hidden */ },
        });
    }

    pick(o: OutletDto): void { this.currentOutlet.set(o.id); }
}
