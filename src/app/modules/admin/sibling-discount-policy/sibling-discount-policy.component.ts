import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subject, takeUntil } from 'rxjs';
import { SiblingDiscountPolicyService } from '../../../core/sibling-discount-policy/sibling-discount-policy.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ListPageComponent } from '../../../shared/components/list-page.component';

@Component({
    selector: 'sibling-discount-policy',
    templateUrl: './sibling-discount-policy.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressBarModule,
        MatSlideToggleModule,
        ListPageComponent,
    ],
})
export class SiblingDiscountPolicyComponent implements OnInit, OnDestroy {
    loading = false;
    saving = false;
    form: FormGroup;
    private _destroyed$ = new Subject<void>();

    constructor(
        private _svc: SiblingDiscountPolicyService,
        private _fb: FormBuilder,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
    ) {
        this.form = this._fb.group({
            isEnabled: [false],
            secondChildDiscountPercent: [10, [Validators.required, Validators.min(0), Validators.max(100)]],
            thirdChildDiscountPercent: [15, [Validators.required, Validators.min(0), Validators.max(100)]],
            fourthPlusChildDiscountPercent: [20, [Validators.required, Validators.min(0), Validators.max(100)]],
            maxDiscountPercentage: [null, [Validators.min(0), Validators.max(100)]],
        });
    }

    ngOnInit(): void { this.load(); }
    ngOnDestroy(): void { this._destroyed$.next(); this._destroyed$.complete(); }

    load(): void {
        this.loading = true;
        this._svc.get().pipe(takeUntil(this._destroyed$)).subscribe({
            next: (p) => {
                this.form.patchValue({
                    isEnabled: !!p.isEnabled,
                    secondChildDiscountPercent: p.secondChildDiscountPercent ?? 10,
                    thirdChildDiscountPercent: p.thirdChildDiscountPercent ?? 15,
                    fourthPlusChildDiscountPercent: p.fourthPlusChildDiscountPercent ?? 20,
                    maxDiscountPercentage: p.maxDiscountPercentage ?? null,
                });
                this.loading = false;
                this._cdr.markForCheck();
            },
            error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load sibling-discount policy.'); },
        });
    }

    save(): void {
        if (this.form.invalid) return;
        this.saving = true;
        this._svc.upsert(this.form.value).pipe(takeUntil(this._destroyed$)).subscribe({
            next: () => { this.saving = false; this._notify.success('Saved.'); this._cdr.markForCheck(); },
            error: () => { this.saving = false; this._cdr.markForCheck(); this._notify.error('Save failed.'); },
        });
    }
}
