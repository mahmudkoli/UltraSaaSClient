import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PlansService } from '../../../core/billing/plans.service';
import { CreatePlanRequest, UpdatePlanRequest } from '../../../core/billing/billing.types';
import { CurrencyDescriptor, CurrencyService } from '../../../core/currency/currency.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ListPageComponent } from '../../../shared/components/list-page.component';

@Component({
    selector: 'plans-form',
    templateUrl: './plans-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, ListPageComponent],
})
export class PlansFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    saving = false;
    isEdit = false;
    planId?: string;
    /** Driven by /api/currencies — one price input rendered per descriptor. */
    currencies: CurrencyDescriptor[] = [];
    private _destroyed$ = new Subject<void>();

    constructor(
        private _fb: FormBuilder,
        private _service: PlansService,
        private _currencyService: CurrencyService,
        private _route: ActivatedRoute,
        private _router: Router,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
    ) {
        this.form = this._fb.group({
            code: ['', [Validators.required, Validators.maxLength(32), Validators.pattern(/^[a-z0-9_-]+$/)]],
            name: ['', [Validators.required, Validators.maxLength(100)]],
            // Per-currency prices live in this FormGroup, populated dynamically
            // once /api/currencies returns. Each child control is keyed by ISO code.
            prices: this._fb.group({}),
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

    get pricesGroup(): FormGroup {
        return this.form.get('prices') as FormGroup;
    }

    ngOnInit(): void {
        this._currencyService.list().pipe(takeUntil(this._destroyed$)).subscribe({
            next: (currencies) => {
                this.currencies = currencies;
                // Add one form control per supported currency. Primary defaults
                // to 0 (cheapest possible); alternates default to null (empty
                // input → "plan not available in this currency" semantics).
                const group = this.pricesGroup;
                for (const c of currencies) {
                    if (!group.contains(c.code)) {
                        group.addControl(c.code, new FormControl<number | null>(
                            c.isPrimary ? 0 : null,
                            [Validators.min(0)],
                        ));
                    }
                }
                this._cdr.markForCheck();
                // Edit path loads after currencies arrive, so patchValue can
                // hit the now-existing child controls.
                this._loadIfEditing();
            },
            error: () => this._notify.error('Could not load currency list.'),
        });
    }

    private _loadIfEditing(): void {
        this.planId = this._route.snapshot.paramMap.get('id') ?? undefined;
        if (!this.planId) return;
        this.isEdit = true;
        this._service.getById(this.planId).pipe(takeUntil(this._destroyed$)).subscribe({
            next: (plan) => {
                this.form.patchValue({
                    code: plan.code,
                    name: plan.name,
                    trialDays: plan.trialDays,
                    maxInstitutes: plan.maxInstitutes,
                    maxUsers: plan.maxUsers,
                    featureFlagsJson: plan.featureFlagsJson,
                    isActive: plan.isActive,
                });
                for (const c of this.currencies) {
                    const v = plan.prices?.[c.code];
                    this.pricesGroup.get(c.code)?.setValue(v ?? null);
                }
                this.form.get('code')?.disable(); // Code is immutable post-create.
                this._cdr.markForCheck();
            },
            error: () => this._notify.error('Could not load plan.'),
        });
    }

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    /** Build the prices dict, dropping currencies left blank (= not offered). */
    private _collectPrices(): Record<string, number> {
        const raw = this.pricesGroup.value as Record<string, number | null>;
        const out: Record<string, number> = {};
        for (const [code, v] of Object.entries(raw)) {
            if (v != null && v >= 0) out[code] = v;
        }
        return out;
    }

    save(): void {
        if (this.form.invalid) return;
        const prices = this._collectPrices();
        if (Object.keys(prices).length === 0) {
            this._notify.error('At least one currency price is required.');
            return;
        }
        this.saving = true;
        this._cdr.markForCheck();

        if (this.isEdit && this.planId) {
            const req: UpdatePlanRequest = {
                id: this.planId,
                name: this.form.value.name,
                prices,
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
                prices,
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
