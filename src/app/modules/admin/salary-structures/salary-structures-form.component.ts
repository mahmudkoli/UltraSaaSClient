import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { SalaryStructuresService } from '../../../core/salary-structures/salary-structures.service';
import { SalaryComponentDto, SalaryComponentType, SalaryCalculationType, COMPONENT_TYPE_LABELS, CALC_TYPE_LABELS } from '../../../core/salary-structures/salary-structures.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'salary-structures-form',
    templateUrl: './salary-structures-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, ListPageComponent,
        MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule,
        MatInputModule, MatProgressBarModule, MatSelectModule, MatTooltipModule,
    ],
})
export class SalaryStructuresFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isLoading = false;
    isSaving = false;
    id: string | null = null;
    isEditMode = false;

    typeOptions = Object.entries(COMPONENT_TYPE_LABELS).map(([v, n]) => ({ value: +v, label: n }));
    calcOptions = Object.entries(CALC_TYPE_LABELS).map(([v, n]) => ({ value: +v, label: n }));

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _service: SalaryStructuresService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _route: ActivatedRoute,
        private _notificationService: NotificationService,
    ) {
        this.form = this._formBuilder.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            description: ['', [Validators.maxLength(500)]],
            basic: [0, [Validators.required, Validators.min(0)]],
            isActive: [true],
            components: this._formBuilder.array([]),
        });
    }

    get components(): FormArray {
        return this.form.get('components') as FormArray;
    }

    private componentGroup(c?: Partial<SalaryComponentDto>): FormGroup {
        return this._formBuilder.group({
            name: [c?.name || '', [Validators.required, Validators.maxLength(100)]],
            code: [c?.code || ''],
            type: [c?.type ?? SalaryComponentType.Earning, Validators.required],
            calculationType: [c?.calculationType ?? SalaryCalculationType.Fixed, Validators.required],
            value: [c?.value ?? 0, [Validators.required, Validators.min(0)]],
            isTaxable: [c?.isTaxable ?? false],
        });
    }

    addComponent(c?: Partial<SalaryComponentDto>): void {
        this.components.push(this.componentGroup(c));
    }

    removeComponent(i: number): void {
        this.components.removeAt(i);
    }

    ngOnInit(): void {
        this.id = this._route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.id;
        if (this.isEditMode && this.id) {
            this.isLoading = true;
            this._changeDetectorRef.markForCheck();
            this._service.getById(this.id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: (s) => {
                    this.form.patchValue({ name: s.name, description: s.description, basic: s.basic, isActive: s.isActive });
                    (s.components || []).forEach(c => this.addComponent(c));
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this._notificationService.error('Error loading salary structure');
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
            });
        } else {
            this.addComponent({ name: 'House Rent', type: SalaryComponentType.Earning, calculationType: SalaryCalculationType.PercentOfBasic, value: 50, isTaxable: true });
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // Client-side preview mirroring the BE calc (Fixed or % of Basic).
    private resolve(basic: number, calc: number, value: number): number {
        return calc === SalaryCalculationType.PercentOfBasic ? Math.round(basic * value / 100 * 100) / 100 : value;
    }

    get gross(): number {
        const basic = +this.form.get('basic')!.value || 0;
        const earnings = this.components.controls
            .filter(c => +c.get('type')!.value === SalaryComponentType.Earning)
            .reduce((sum, c) => sum + this.resolve(basic, +c.get('calculationType')!.value, +c.get('value')!.value || 0), 0);
        return basic + earnings;
    }

    get deductions(): number {
        const basic = +this.form.get('basic')!.value || 0;
        return this.components.controls
            .filter(c => +c.get('type')!.value === SalaryComponentType.Deduction)
            .reduce((sum, c) => sum + this.resolve(basic, +c.get('calculationType')!.value, +c.get('value')!.value || 0), 0);
    }

    get net(): number {
        return this.gross - this.deductions;
    }

    save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.isSaving = true;
        this._changeDetectorRef.markForCheck();
        const v = this.form.value;
        const components: SalaryComponentDto[] = (v.components || []).map((c: any, i: number) => ({
            name: c.name, code: c.code || undefined, type: +c.type, calculationType: +c.calculationType,
            value: +c.value || 0, isTaxable: !!c.isTaxable, displayOrder: i + 1,
        }));
        const done = {
            next: () => {
                this.isSaving = false;
                this._notificationService.success(`Salary structure ${this.isEditMode ? 'updated' : 'created'}`);
                this._router.navigate(['/salary-structures']);
            },
            error: () => {
                this.isSaving = false;
                this._changeDetectorRef.markForCheck();
                this._notificationService.error(`Error ${this.isEditMode ? 'updating' : 'creating'} salary structure`);
            },
        };
        if (this.isEditMode && this.id) {
            this._service.update(this.id, { id: this.id, name: v.name, description: v.description || undefined, basic: +v.basic, isActive: v.isActive, components })
                .pipe(takeUntil(this._unsubscribeAll)).subscribe(done);
        } else {
            this._service.create({ name: v.name, description: v.description || undefined, basic: +v.basic, components })
                .pipe(takeUntil(this._unsubscribeAll)).subscribe(done);
        }
    }

    cancel(): void {
        this._router.navigate(['/salary-structures']);
    }
}
