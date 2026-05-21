import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { EVENT_TYPES, EventsService } from '../../../core/events/events.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'event-form',
    templateUrl: './event-form.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, MatSelectModule],
})
export class EventFormComponent implements OnInit {
    form: FormGroup;
    saving = false; loading = false;
    editingId?: string;
    types = EVENT_TYPES;
    patterns = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

    constructor(private _svc: EventsService, private _fb: FormBuilder, private _route: ActivatedRoute, private _router: Router, private _cdr: ChangeDetectorRef, private _notify: NotificationService) {
        this.form = this._fb.group({
            title: ['', [Validators.required, Validators.maxLength(150)]],
            description: [''],
            startDate: [new Date().toISOString().slice(0, 10), [Validators.required]],
            endDate: [new Date().toISOString().slice(0, 10), [Validators.required]],
            startTime: [''],
            endTime: [''],
            eventType: [1, [Validators.required]],
            location: [''],
            isAllDay: [true],
            isActive: [true],
            organizer: [''],
            contactPerson: [''],
            contactPhone: [''],
            contactEmail: [''],
            color: ['#4F46E5'],
            remarks: [''],
            isRecurring: [false],
            recurrencePattern: [''],
            recurrenceInterval: [null],
            recurrenceEndDate: [''],
            maxParticipants: [null],
            registrationFee: [null],
            registrationDeadline: [''],
            requiresRegistration: [false],
        });
    }

    ngOnInit(): void {
        const id = this._route.snapshot.paramMap.get('id');
        if (id) {
            this.editingId = id;
            this.loading = true;
            this._svc.getById(id).subscribe({
                next: (e) => {
                    this.form.patchValue({
                        ...e,
                        startDate: e.startDate?.slice(0, 10),
                        endDate: e.endDate?.slice(0, 10),
                        recurrenceEndDate: e.recurrenceEndDate?.slice(0, 10),
                    });
                    this.loading = false; this._cdr.markForCheck();
                },
                error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load event.'); },
            });
        }
    }

    save(): void {
        if (this.form.invalid) return;
        this.saving = true;
        const v = this.form.value;
        const obs = this.editingId ? this._svc.update(this.editingId, { id: this.editingId, ...v }) : this._svc.create(v);
        obs.subscribe({
            next: () => { this.saving = false; this._notify.success('Saved.'); this._router.navigate(['/events']); },
            error: () => { this.saving = false; this._cdr.markForCheck(); this._notify.error('Save failed.'); },
        });
    }

    cancel(): void { this._router.navigate(['/events']); }
}
