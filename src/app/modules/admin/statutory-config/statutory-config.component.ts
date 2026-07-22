import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { StatutoryConfigService } from '../../../core/statutory-config/statutory-config.service';
import { StatutoryCalcResult } from '../../../core/statutory-config/statutory-config.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'statutory-config',
    templateUrl: './statutory-config.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, ListPageComponent,
        MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule,
    ],
})
export class StatutoryConfigComponent implements OnInit {
    form: FormGroup;
    estForm: FormGroup;
    isLoading = false;
    isSaving = false;
    exists = false;
    estimate?: StatutoryCalcResult;

    private _unsubscribeAll = new Subject<any>();

    constructor(
        private _fb: FormBuilder,
        private _service: StatutoryConfigService,
        private _cdr: ChangeDetectorRef,
        private _notification: NotificationService,
    ) {
        this.form = this._fb.group({
            fiscalYear: ['2025-26', [Validators.required, Validators.maxLength(20)]],
            effectiveFrom: [new Date().toISOString().substring(0, 10), Validators.required],
            isPlaceholder: [true],
            generalTaxThreshold: [0, [Validators.required, Validators.min(0)]],
            womenSeniorExtraThreshold: [0, Validators.min(0)],
            taxSlabsJson: ['[]', Validators.required],
            rebateIncomePct: [0, Validators.min(0)],
            rebateInvestmentPct: [0, Validators.min(0)],
            rebateCap: [0, Validators.min(0)],
            minimumTaxExisting: [0, Validators.min(0)],
            minimumTaxNew: [0, Validators.min(0)],
            pfEmployeeRate: [0, [Validators.min(0), Validators.max(100)]],
            pfEmployerRate: [0, [Validators.min(0), Validators.max(100)]],
            pfEligibilityMonths: [12, Validators.min(0)],
            gratuityDaysPerYear: [30, Validators.min(0)],
            gratuityDaysPerYearOver10: [45, Validators.min(0)],
            festivalBonusCount: [2, Validators.min(0)],
            festivalBonusMonths: [1, Validators.min(0)],
            deductionCapPct: [50, [Validators.min(0), Validators.max(100)]],
            overtimeMultiplier: [2, Validators.min(0)],
        });
        this.estForm = this._fb.group({
            monthlyBasic: [40000, Validators.min(0)],
            monthlyTaxableEarnings: [68000, Validators.min(0)],
            annualEligibleInvestment: [0, Validators.min(0)],
        });
    }

    ngOnInit(): void {
        this.isLoading = true;
        this._cdr.markForCheck();
        this._service.getCurrent().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (cfg) => {
                if (cfg) {
                    this.exists = true;
                    this.form.patchValue({ ...cfg, effectiveFrom: (cfg.effectiveFrom || '').substring(0, 10) });
                }
                this.isLoading = false;
                this._cdr.markForCheck();
            },
            error: () => { this.isLoading = false; this._cdr.markForCheck(); },
        });
    }

    save(): void {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        this.isSaving = true;
        this._cdr.markForCheck();
        this._service.set(this.form.value).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: () => {
                this.isSaving = false; this.exists = true;
                this._notification.success('Statutory config saved');
                this._cdr.markForCheck();
            },
            error: () => {
                this.isSaving = false;
                this._notification.error('Failed to save statutory config');
                this._cdr.markForCheck();
            },
        });
    }

    runEstimate(): void {
        const v = this.estForm.value;
        this._service.estimate({
            monthlyBasic: +v.monthlyBasic || 0,
            monthlyTaxableEarnings: +v.monthlyTaxableEarnings || 0,
            annualEligibleInvestment: +v.annualEligibleInvestment || 0,
        }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (r) => { this.estimate = r; this._cdr.markForCheck(); },
            error: () => this._notification.error('Estimate failed — save a config first'),
        });
    }
}
