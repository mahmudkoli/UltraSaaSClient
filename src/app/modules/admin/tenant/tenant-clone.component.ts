import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TenantsService } from '../../../core/tenants/tenants.service';
import { TenantDto } from '../../../core/tenants/tenants.types';

/**
 * #33 — clone another tenant's permissions + theme onto this tenant as a starting
 * template. Features are plan-derived (set via the subscription plan), so they are
 * not part of the clone.
 */
@Component({
    selector: 'tenant-clone',
    templateUrl: './tenant-clone.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatProgressBarModule, MatSelectModule,
    ],
})
export class TenantCloneComponent implements OnInit {
    targetId = '';
    tenants: TenantDto[] = [];
    sourceControl = new FormControl<string>('');
    loading = false;
    saving = false;

    constructor(
        private _svc: TenantsService,
        private _route: ActivatedRoute,
        private _router: Router,
        private _confirm: FuseConfirmationService,
    ) {}

    ngOnInit(): void {
        this.targetId = this._route.snapshot.paramMap.get('id') || '';
        this.loading = true;
        this._svc.getAll().subscribe({
            next: (t) => { this.tenants = t.filter(x => x.id !== this.targetId); this.loading = false; },
            error: () => { this.loading = false; },
        });
    }

    clone(): void {
        const sourceId = this.sourceControl.value;
        if (!sourceId) return;
        this.saving = true;
        this._svc.cloneFrom(this.targetId, sourceId).subscribe({
            next: () => {
                this.saving = false;
                this._confirm.open({
                    title: 'Settings cloned',
                    message: `Copied permissions & theme from "${sourceId}" to "${this.targetId}".`,
                    actions: { confirm: { label: 'OK' } },
                }).afterClosed().subscribe(() => this._router.navigate(['/tenant', this.targetId]));
            },
            error: () => {
                this.saving = false;
                this._confirm.open({
                    title: 'Clone failed',
                    message: 'Could not clone tenant settings. Please try again.',
                    actions: { confirm: { label: 'OK' } },
                });
            },
        });
    }

    cancel(): void { this._router.navigate(['/tenant', this.targetId]); }
}
