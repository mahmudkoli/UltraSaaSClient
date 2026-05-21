import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutesService } from '../../../core/transport/transport.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'route-form',
    templateUrl: './route-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule],
})
export class RouteFormComponent implements OnInit {
    form: FormGroup;
    saving = false; loading = false;
    editingId?: string;

    constructor(private _svc: RoutesService, private _fb: FormBuilder, private _route: ActivatedRoute, private _router: Router, private _cdr: ChangeDetectorRef, private _notify: NotificationService) {
        this.form = this._fb.group({
            name: ['', [Validators.required, Validators.maxLength(150)]],
            code: ['', [Validators.required, Validators.maxLength(50)]],
            description: [''],
            startLocation: ['', [Validators.required]],
            endLocation: ['', [Validators.required]],
            distance: [0, [Validators.required, Validators.min(0)]],
            estimatedTime: ['00:30:00', [Validators.required]],
            fare: [0, [Validators.required, Validators.min(0)]],
            isActive: [true],
            stops: [''],
            remarks: [''],
        });
    }

    ngOnInit(): void {
        const id = this._route.snapshot.paramMap.get('id');
        if (id) {
            this.editingId = id;
            this.loading = true;
            this._svc.getById(id).subscribe({
                next: (r) => { this.form.patchValue(r); this.loading = false; this._cdr.markForCheck(); },
                error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load route.'); },
            });
        }
    }

    save(): void {
        if (this.form.invalid) return;
        this.saving = true;
        const v = this.form.value;
        const obs = this.editingId ? this._svc.update(this.editingId, { id: this.editingId, ...v }) : this._svc.create(v);
        obs.subscribe({
            next: () => { this.saving = false; this._notify.success('Saved.'); this._router.navigate(['/transport/routes']); },
            error: () => { this.saving = false; this._cdr.markForCheck(); this._notify.error('Save failed.'); },
        });
    }

    cancel(): void { this._router.navigate(['/transport/routes']); }
}
