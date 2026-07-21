import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmployeesService } from '../../../core/employees/employees.service';
import { GenerationProgress } from '../../../core/employees/employees.types';

@Component({
    selector: 'employee-dev-tools-dialog',
    template: `
        <div class="flex flex-col max-w-md w-full">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b">
                <div class="flex items-center space-x-3">
                    <div class="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                        <mat-icon class="text-purple-600">code</mat-icon>
                    </div>
                    <div>
                        <h2 class="text-lg font-semibold text-gray-900">Developer Tools</h2>
                        <p class="text-sm text-gray-500">Generate and manage test employee data</p>
                    </div>
                </div>
                <button mat-icon-button [mat-dialog-close]>
                    <mat-icon>close</mat-icon>
                </button>
            </div>

            <div class="p-6 space-y-6">
                <!-- Generate Random Employees -->
                <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div class="flex items-center space-x-3 mb-4">
                        <mat-icon class="text-blue-600">group_add</mat-icon>
                        <div>
                            <h3 class="text-sm font-medium text-gray-900">Generate Random Employees</h3>
                            <p class="text-xs text-gray-500">Create test employee data for development</p>
                        </div>
                    </div>
                    
                    <form [formGroup]="generationForm" class="space-y-3">
                        <mat-form-field appearance="outline" class="w-full">
                            <mat-label>Number of Employees</mat-label>
                            <input matInput formControlName="nSeed" type="number" min="1" max="100">
                            <mat-hint>Generate between 1-100 employees</mat-hint>
                        </mat-form-field>
                        
                        <button 
                            type="button"
                            mat-raised-button 
                            color="primary"
                            [disabled]="isGenerating || generationForm.invalid"
                            (click)="generateRandomEmployees()"
                            class="w-full">
                            <mat-icon *ngIf="!isGenerating">person_add</mat-icon>
                            <mat-icon *ngIf="isGenerating" class="animate-spin">sync</mat-icon>
                            {{ isGenerating ? 'Generating...' : 'Generate Employees' }}
                        </button>
                    </form>
                </div>

                <!-- Progress -->
                <div *ngIf="generationProgress" class="bg-gray-50 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium text-gray-700">{{ generationProgress.message }}</span>
                        <span class="text-sm text-gray-500">{{ generationProgress.progress }}%</span>
                    </div>
                    <mat-progress-bar 
                        mode="determinate" 
                        [value]="generationProgress.progress"
                        [color]="generationProgress.status === 'error' ? 'warn' : 'primary'">
                    </mat-progress-bar>
                    
                    <div *ngIf="generationProgress.generatedCount !== undefined" class="mt-2 text-xs text-gray-600">
                        Generated {{ generationProgress.generatedCount }} of {{ generationProgress.totalCount }} employees
                    </div>
                </div>

                <!-- Cleanup Section -->
                <div class="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div class="flex items-center space-x-3 mb-4">
                        <mat-icon class="text-red-600">delete_sweep</mat-icon>
                        <div>
                            <h3 class="text-sm font-medium text-gray-900">Cleanup Test Data</h3>
                            <p class="text-xs text-gray-500">Remove all randomly generated employees</p>
                        </div>
                    </div>
                    
                    <button 
                        type="button"
                        mat-raised-button 
                        color="warn"
                        [disabled]="isDeleting"
                        (click)="deleteRandomEmployees()"
                        class="w-full">
                        <mat-icon *ngIf="!isDeleting">delete_sweep</mat-icon>
                        <mat-icon *ngIf="isDeleting" class="animate-spin">sync</mat-icon>
                        {{ isDeleting ? 'Deleting...' : 'Delete Random Employees' }}
                    </button>
                </div>

                <!-- Warning -->
                <div class="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <div class="flex items-start space-x-2">
                        <mat-icon class="text-yellow-600 mt-0.5" style="font-size: 16px; width: 16px; height: 16px;">warning</mat-icon>
                        <div class="text-xs text-yellow-800">
                            <strong>Development Use Only:</strong> These tools are intended for development and testing purposes only. Use with caution in production environments.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
                <button type="button" mat-button [mat-dialog-close]>Close</button>
            </div>
        </div>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressBarModule,
    ],
})
export class EmployeeDevToolsDialogComponent implements OnInit, OnDestroy {
    generationForm: FormGroup;
    generationProgress: GenerationProgress | null = null;
    isGenerating = false;
    isDeleting = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _employeesService: EmployeesService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<EmployeeDevToolsDialogComponent>
    ) {
        this.generationForm = this._formBuilder.group({
            nSeed: [10, [Validators.required, Validators.min(1), Validators.max(100)]]
        });
    }

    ngOnInit(): void {
        // Subscribe to generation progress
        this._employeesService.generationProgress$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(progress => {
                this.generationProgress = progress;
                this.isGenerating = progress?.status === 'generating';
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
        this._employeesService.resetGenerationProgress();
    }

    generateRandomEmployees(): void {
        if (this.generationForm.valid) {
            const request = this.generationForm.value;

            this._employeesService.generateRandom(request)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe({
                    next: (response) => {
                        this._snackBar.open('Random employees generated successfully!', 'Close', {
                            duration: 3000,
                            panelClass: ['success-snackbar']
                        });

                        // Close dialog after successful generation
                        setTimeout(() => {
                            this.dialogRef.close(true);
                        }, 2000);
                    },
                    error: (error) => {
                        console.error('Generation failed:', error);
                        this._snackBar.open('Failed to generate employees. Please try again.', 'Close', {
                            duration: 5000,
                            panelClass: ['error-snackbar']
                        });
                    }
                });
        }
    }

    deleteRandomEmployees(): void {
        this.isDeleting = true;
        this._changeDetectorRef.markForCheck();

        this._employeesService.deleteRandom()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.isDeleting = false;
                    this._snackBar.open('Random employees deleted successfully!', 'Close', {
                        duration: 3000,
                        panelClass: ['success-snackbar']
                    });

                    // Close dialog after successful deletion
                    setTimeout(() => {
                        this.dialogRef.close(true);
                    }, 1000);

                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    this.isDeleting = false;
                    console.error('Deletion failed:', error);
                    this._snackBar.open('Failed to delete employees. Please try again.', 'Close', {
                        duration: 5000,
                        panelClass: ['error-snackbar']
                    });
                    this._changeDetectorRef.markForCheck();
                }
            });
    }
} 