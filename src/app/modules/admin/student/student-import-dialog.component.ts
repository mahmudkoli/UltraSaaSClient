import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject, takeUntil } from 'rxjs';
import { StudentsService } from '../../../core/students/students.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'student-import-dialog',
    templateUrl: './student-import-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule, MatProgressBarModule],
})
export class StudentImportDialogComponent {
    file?: File;
    uploading = false;
    result?: { created: number; skipped: number; errors: string[] };
    private _destroyed$ = new Subject<void>();

    constructor(
        private _svc: StudentsService,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
        public dialogRef: MatDialogRef<StudentImportDialogComponent, boolean>,
    ) {}

    onFile(e: Event): void {
        const f = (e.target as HTMLInputElement).files?.[0];
        if (f) { this.file = f; this._cdr.markForCheck(); }
    }

    /** Phase F2 — download the .xlsx template with all expected headers + a sample row. */
    downloadTemplate(): void {
        this._svc.downloadImportTemplate().pipe(takeUntil(this._destroyed$)).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'students-import-template.xlsx';
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: () => this._notify.error('Could not download template.'),
        });
    }

    upload(): void {
        if (!this.file) return;
        this.uploading = true;
        this._svc.importExcel(this.file).pipe(takeUntil(this._destroyed$)).subscribe({
            next: (r) => {
                this.result = r;
                this.uploading = false;
                this._cdr.markForCheck();
                this._notify.success(`Imported ${r.created} students (${r.skipped} skipped).`);
            },
            error: () => {
                this.uploading = false;
                this._cdr.markForCheck();
                this._notify.error('Import failed. Check file format.');
            },
        });
    }

    close(): void {
        this.dialogRef.close(!!this.result?.created);
    }
}
