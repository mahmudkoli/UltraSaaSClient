import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

/**
 * Phase v1-O (carry-forward) — generic entity picker that replaces raw GUID
 * inputs across the System Mgmt forms (hostel-allocation, library-issue,
 * transport-assignment, etc.). Material autocomplete with debounced search
 * against whichever endpoint the caller hands in.
 *
 * The control's value is the entity's id (string). The displayed text comes
 * from `displayFn(entity)`. Implements ControlValueAccessor so it slots into
 * any reactive form via `formControlName`.
 *
 *   <app-entity-picker
 *       label="Student"
 *       placeholder="Type to search students"
 *       formControlName="studentId"
 *       [searchFn]="searchStudents.bind(this)"
 *       [displayFn]="formatStudent"
 *       [resolveFn]="resolveStudent.bind(this)">
 *   </app-entity-picker>
 *
 * Wire-up rules:
 *   • searchFn(query) → Observable<TEntity[]>
 *   • displayFn(entity) → string (label shown in the dropdown + input)
 *   • resolveFn(id) → Observable<TEntity | null> — used in edit-mode when
 *     the form pre-populates a control with an id that the user hasn't
 *     typed for yet (so the input still shows a friendly label, not the
 *     raw guid).
 */
@Component({
    selector: 'app-entity-picker',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule, ReactiveFormsModule,
        MatAutocompleteModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatProgressSpinnerModule,
    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EntityPickerComponent),
            multi: true,
        },
    ],
    template: `
<mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
    <mat-label>{{ label }}</mat-label>
    <input matInput
           [formControl]="textControl"
           [matAutocomplete]="auto"
           [placeholder]="placeholder || 'Type to search…'"
           (blur)="onTouched()">
    <mat-icon matSuffix *ngIf="!searching" class="text-gray-400">search</mat-icon>
    <mat-spinner matSuffix *ngIf="searching" diameter="18"></mat-spinner>

    <mat-autocomplete #auto="matAutocomplete"
                      [displayWith]="autocompleteDisplay"
                      (optionSelected)="onOptionSelected($event)">
        <mat-option *ngIf="searching" disabled>
            <span class="text-xs text-gray-500">Searching…</span>
        </mat-option>
        <mat-option *ngFor="let item of suggestions" [value]="item">
            <span>{{ displayFn(item) }}</span>
        </mat-option>
        <mat-option *ngIf="!searching && suggestions.length === 0 && (textControl.value || '').length > 0" disabled>
            <span class="text-xs text-gray-500">No matches.</span>
        </mat-option>
    </mat-autocomplete>
</mat-form-field>
    `,
})
export class EntityPickerComponent<T extends { id: string }> implements ControlValueAccessor, OnInit, OnDestroy {
    @Input() label = 'Pick…';
    @Input() placeholder?: string;
    @Input() searchFn!: (query: string) => Observable<T[]>;
    @Input() displayFn!: (item: T) => string;
    /** Optional. If provided, resolves an id → entity for edit-mode prefill. */
    @Input() resolveFn?: (id: string) => Observable<T | null>;
    /** Default min length to start searching. */
    @Input() minSearchLength = 0;

    textControl = new FormControl<string | T>('');
    suggestions: T[] = [];
    searching = false;

    private _destroyed$ = new Subject<void>();
    private _value: string | null = null;
    private _onChange: (v: string | null) => void = () => {};
    onTouched: () => void = () => {};

    constructor(private _cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        // Wire the input's text to the searchFn. Skip when an entity object
        // is already selected (post optionSelected the value is the entity,
        // not a query string).
        this.textControl.valueChanges.pipe(
            debounceTime(250),
            distinctUntilChanged(),
            takeUntil(this._destroyed$),
            switchMap(value => {
                if (typeof value !== 'string') return of([] as T[]);
                if (value.length < this.minSearchLength) return of([] as T[]);
                this.searching = true;
                this._cdr.markForCheck();
                return this.searchFn(value);
            }),
        ).subscribe({
            next: items => {
                this.suggestions = items ?? [];
                this.searching = false;
                this._cdr.markForCheck();
            },
            error: () => {
                this.suggestions = [];
                this.searching = false;
                this._cdr.markForCheck();
            },
        });
    }

    ngOnDestroy(): void { this._destroyed$.next(); this._destroyed$.complete(); }

    autocompleteDisplay = (value: string | T | null): string => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value;
        return this.displayFn(value);
    };

    onOptionSelected(evt: MatAutocompleteSelectedEvent): void {
        const item = evt.option.value as T;
        this._value = item.id;
        this._onChange(item.id);
        this._cdr.markForCheck();
    }

    // -------- ControlValueAccessor --------

    writeValue(value: string | null): void {
        this._value = value;
        if (!value) {
            this.textControl.setValue('', { emitEvent: false });
            return;
        }
        // If we already have an entity in the input that matches, leave it.
        const current = this.textControl.value;
        if (current && typeof current !== 'string' && current.id === value) return;

        // Otherwise resolve id → entity so the input shows a friendly label.
        if (this.resolveFn) {
            this.resolveFn(value).pipe(takeUntil(this._destroyed$)).subscribe(item => {
                if (item) {
                    this.textControl.setValue(item, { emitEvent: false });
                } else {
                    this.textControl.setValue(value, { emitEvent: false });
                }
                this._cdr.markForCheck();
            });
        } else {
            // Fallback — display the raw id; better than blank.
            this.textControl.setValue(value, { emitEvent: false });
            this._cdr.markForCheck();
        }
    }

    registerOnChange(fn: (v: string | null) => void): void { this._onChange = fn; }
    registerOnTouched(fn: () => void): void { this.onTouched = fn; }
    setDisabledState?(isDisabled: boolean): void {
        isDisabled ? this.textControl.disable({ emitEvent: false }) : this.textControl.enable({ emitEvent: false });
    }
}
