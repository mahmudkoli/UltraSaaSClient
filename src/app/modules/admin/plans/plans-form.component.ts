import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PlansService } from '../../../core/billing/plans.service';
import { CreatePlanRequest, UpdatePlanRequest } from '../../../core/billing/billing.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'plans-form',
    templateUrl: './plans-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule],
})
export class PlansFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    saving = false;
    isEdit = false;
    planId?: string;
    private _destroyed$ = new Subject<void>();

    constructor(
        private _fb: FormBuilder,
        private _service: PlansService,
        private _route: ActivatedRoute,
        private _router: Router,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
    ) {
        this.form = this._fb.group({
            code: ['', [Validators.required, Validators.maxLength(32), Validators.pattern(/^[a-z0-9_-]+$/)]],
            name: ['', [Validators.required, Validators.maxLength(100)]],
            monthlyFeeBDT: [0, [Validators.required, Validators.min(0)]],
            trialDays: [0, [Validators.required, Validators.min(0)]],
            maxInstitutes: [1, [Validators.required, Validators.min(1)]],
            maxUsers: [5, [Validators.required, Validators.min(1)]],
            featureFlagsJson: ['[]'],
            isActive: [true],
        });
    }

    /** Phase v1-K6 — known feature flags. Extend as the platform adds toggles. */
    readonly knownFlags = [
        { code: 'CUSTOM_BRAND', description: 'Tenant can customize UI theme (logo / colors stay baseline)' },
    ];

    hasFlag(code: string): boolean {
        try {
            const arr = JSON.parse(this.form.value.featureFlagsJson || '[]');
            return Array.isArray(arr) && arr.includes(code);
        } catch { return false; }
    }

    setFlag(code: string, on: boolean): void {
        let arr: string[];
        try { arr = JSON.parse(this.form.value.featureFlagsJson || '[]'); if (!Array.isArray(arr)) arr = []; }
        catch { arr = []; }
        const has = arr.includes(code);
        if (on && !has) arr.push(code);
        if (!on && has) arr = arr.filter((c) => c !== code);
        this.form.patchValue({ featureFlagsJson: JSON.stringify(arr) });
    }

    ngOnInit(): void {
        this.planId = this._route.snapshot.paramMap.get('id') ?? undefined;
        if (this.planId) {
            this.isEdit = true;
            this._service.getById(this.planId).pipe(takeUntil(this._destroyed$)).subscribe({
                next: (plan) => {
                    this.form.patchValue(plan);
                    // Code is immutable post-create.
                    this.form.get('code')?.disable();
                    this._cdr.markForCheck();
                },
                error: () => this._notify.error('Could not load plan.'),
            });
        }
    }

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    save(): void {
        if (this.form.invalid) return;
        this.saving = true;
        this._cdr.markForCheck();

        if (this.isEdit && this.planId) {
            const req: UpdatePlanRequest = {
                id: this.planId,
                name: this.form.value.name,
                monthlyFeeBDT: this.form.value.monthlyFeeBDT,
                maxInstitutes: this.form.value.maxInstitutes,
                maxUsers: this.form.value.maxUsers,
                featureFlagsJson: this.form.value.featureFlagsJson || '[]',
                isActive: this.form.value.isActive,
            };
            this._service.update(this.planId, req).pipe(takeUntil(this._destroyed$)).subscribe({
                next: () => {
                    this._notify.success('Plan updated.');
                    this._router.navigate(['..'], { relativeTo: this._route });
                },
                error: () => {
                    this._notify.error('Could not update plan.');
                    this.saving = false;
                    this._cdr.markForCheck();
                },
            });
        } else {
            const req: CreatePlanRequest = {
                code: this.form.value.code,
                name: this.form.value.name,
                monthlyFeeBDT: this.form.value.monthlyFeeBDT,
                trialDays: this.form.value.trialDays,
                maxInstitutes: this.form.value.maxInstitutes,
                maxUsers: this.form.value.maxUsers,
                featureFlagsJson: this.form.value.featureFlagsJson || '[]',
            };
            this._service.create(req).pipe(takeUntil(this._destroyed$)).subscribe({
                next: () => {
                    this._notify.success('Plan created.');
                    this._router.navigate(['..'], { relativeTo: this._route });
                },
                error: () => {
                    this._notify.error('Could not create plan (code may already exist).');
                    this.saving = false;
                    this._cdr.markForCheck();
                },
            });
        }
    }

    cancel(): void {
        this._router.navigate(['..'], { relativeTo: this._route });
    }
}
