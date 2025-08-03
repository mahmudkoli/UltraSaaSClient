import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StudentsService } from '../../../core/students/students.service';
import { ExportStudentsRequest, ExportProgress } from '../../../core/students/students.types';

export interface ExportDialogData {
    totalStudents: number;
    selectedStudents?: string[];
    filters?: any;
}

@Component({
    selector: 'student-export-dialog',
    template: `
        <div class="flex flex-col max-w-md w-full">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b">
                <div class="flex items-center space-x-3">
                    <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                        <mat-icon class="text-blue-600">download</mat-icon>
                    </div>
                    <div>
                        <h2 class="text-lg font-semibold text-gray-900">Export Students</h2>
                        <p class="text-sm text-gray-500">Download {{ data.totalStudents }} student records</p>
                    </div>
                </div>
                <button mat-icon-button [mat-dialog-close]>
                    <mat-icon>close</mat-icon>
                </button>
            </div>

            <form [formGroup]="exportForm" class="p-6 space-y-6">
                <!-- Format Selection -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                    <mat-form-field appearance="outline" class="w-full">
                        <mat-select formControlName="format">
                            <mat-option value="excel">
                                <div class="flex items-center space-x-2">
                                    <mat-icon class="text-green-600">table_chart</mat-icon>
                                    <span>Excel (.xlsx)</span>
                                </div>
                            </mat-option>
                            <mat-option value="csv">
                                <div class="flex items-center space-x-2">
                                    <mat-icon class="text-orange-600">description</mat-icon>
                                    <span>CSV (.csv)</span>
                                </div>
                            </mat-option>
                            <mat-option value="pdf">
                                <div class="flex items-center space-x-2">
                                    <mat-icon class="text-red-600">picture_as_pdf</mat-icon>
                                    <span>PDF (.pdf)</span>
                                </div>
                            </mat-option>
                        </mat-select>
                    </mat-form-field>
                </div>

                <!-- Options -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-3">Export Options</label>
                    <div class="space-y-2">
                        <mat-checkbox formControlName="includeInactive">
                            Include inactive students
                        </mat-checkbox>
                        <mat-checkbox formControlName="includeParentInfo">
                            Include parent information
                        </mat-checkbox>
                        <mat-checkbox formControlName="includeContactInfo">
                            Include emergency contacts
                        </mat-checkbox>
                    </div>
                </div>

                <!-- Progress -->
                <div *ngIf="exportProgress" class="bg-gray-50 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium text-gray-700">{{ exportProgress.message }}</span>
                        <span class="text-sm text-gray-500">{{ exportProgress.progress }}%</span>
                    </div>
                    <mat-progress-bar 
                        mode="determinate" 
                        [value]="exportProgress.progress"
                        [color]="exportProgress.status === 'error' ? 'warn' : 'primary'">
                    </mat-progress-bar>
                    
                    <!-- Download Button -->
                    <div *ngIf="exportProgress.status === 'completed' && exportProgress.downloadUrl" class="mt-3">
                        <button 
                            type="button"
                            mat-raised-button 
                            color="primary"
                            (click)="downloadFile()"
                            class="w-full">
                            <mat-icon>download</mat-icon>
                            Download {{ exportProgress.fileName }}
                        </button>
                    </div>
                </div>
            </form>

            <!-- Actions -->
            <div class="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
                <button type="button" mat-button [mat-dialog-close]>Cancel</button>
                <button 
                    type="button"
                    mat-raised-button 
                    color="primary"
                    [disabled]="isExporting"
                    (click)="startExport()">
                    <mat-icon *ngIf="!isExporting">file_download</mat-icon>
                    <mat-icon *ngIf="isExporting" class="animate-spin">sync</mat-icon>
                    {{ isExporting ? 'Exporting...' : 'Start Export' }}
                </button>
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
        MatCheckboxModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatProgressBarModule,
        MatSelectModule,
    ],
})
export class StudentExportDialogComponent implements OnInit, OnDestroy {
    exportForm: FormGroup;
    exportProgress: ExportProgress | null = null;
    isExporting = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formBuilder: FormBuilder,
        private _studentsService: StudentsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<StudentExportDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ExportDialogData
    ) {
        this.exportForm = this._formBuilder.group({
            format: ['excel'],
            includeInactive: [false],
            includeParentInfo: [true],
            includeContactInfo: [true]
        });
    }

    ngOnInit(): void {
        // Subscribe to export progress
        this._studentsService.exportProgress$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(progress => {
                this.exportProgress = progress;
                this.isExporting = progress?.status === 'preparing' || progress?.status === 'exporting';
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
        this._studentsService.resetExportProgress();
    }

    startExport(): void {
        const formValue = this.exportForm.value;
        
        const request: ExportStudentsRequest = {
            // Add filters based on current view or selected students
            ...(this.data.filters || {}),
        };

        this._studentsService.export(request)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (blob) => {
                    // File download will be handled by the progress callback
                },
                error: (error) => {
                    console.error('Export failed:', error);
                    this._snackBar.open('Export failed. Please try again.', 'Close', {
                        duration: 5000,
                        panelClass: ['error-snackbar']
                    });
                }
            });
    }

    downloadFile(): void {
        if (this.exportProgress?.downloadUrl && this.exportProgress?.fileName) {
            const link = document.createElement('a');
            link.href = this.exportProgress.downloadUrl;
            link.download = this.exportProgress.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the URL
            window.URL.revokeObjectURL(this.exportProgress.downloadUrl);
            
            this._snackBar.open('Download completed successfully!', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
            });

            // Close dialog after download
            setTimeout(() => {
                this.dialogRef.close();
            }, 1000);
        }
    }
} 