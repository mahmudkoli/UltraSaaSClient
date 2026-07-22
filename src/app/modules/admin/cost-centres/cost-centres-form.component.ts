import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { CostCentresService } from '../../../core/cost-centres/cost-centres.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'cost-centres-form',
    templateUrl: './cost-centres-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, ListPageComponent,
        MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule,
        MatInputModule, MatProgressBarModule,
    ],
})
export class CostCentresFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isLoading = false;
    isSaving = false;
    id: string | null = null;
    isEditMode = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _service: CostCentresService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _route: ActivatedRoute,
        private _notificationService: NotificationService,
    ) {
        this.form = this._formBuilder.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            code: ['', [Validators.maxLength(50)]],
            description: ['', [Validators.maxLength(500)]],
            isActive: [true],
        });
    }

    ngOnInit(): void {
        this.id = this._route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.id;
        if (this.isEditMode && this.id) {
            this.isLoading = true;
            this._changeDetectorRef.markForCheck();
            this._service.getById(this.id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
                next: (item) => {
                    this.form.patchValue({ name: item.name, code: item.code, description: item.description, isActive: item.isActive });
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: () => {
                    this._notificationService.error('Error loading cost centre');
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
            });
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.isSaving = true;
        this._changeDetectorRef.markForCheck();
        const v = this.form.value;
        const done = {
            next: () => {
                this.isSaving = false;
                this._notificationService.success(`Cost centre ${this.isEditMode ? 'updated' : 'created'}`);
                this._router.navigate(['/cost-centres']);
            },
            error: () => {
                this.isSaving = false;
                this._changeDetectorRef.markForCheck();
                this._notificationService.error(`Error ${this.isEditMode ? 'updating' : 'creating'} cost centre`);
            },
        };
        if (this.isEditMode && this.id) {
            this._service.update(this.id, { id: this.id, name: v.name, code: v.code || undefined, description: v.description || undefined, isActive: v.isActive })
                .pipe(takeUntil(this._unsubscribeAll)).subscribe(done);
        } else {
            this._service.create({ name: v.name, code: v.code || undefined, description: v.description || undefined })
                .pipe(takeUntil(this._unsubscribeAll)).subscribe(done);
        }
    }

    cancel(): void {
        this._router.navigate(['/cost-centres']);
    }
}
