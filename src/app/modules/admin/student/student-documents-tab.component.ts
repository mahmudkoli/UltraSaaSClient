import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
    CreateStudentDocumentRequest,
    StudentDocumentDto,
    StudentDocumentsService,
    STUDENT_DOCUMENT_TYPE_LABELS,
    StudentDocumentType,
} from '../../../core/students/student-documents.service';
import { NotificationService } from '../../../core/services/notification.service';

/**
 * Phase v1-O (K9) — Documents tab rendered inside the student-form mat-tab-group.
 * Self-contained: lists uploaded docs, supports new uploads (base64 data-URI),
 * delete-with-confirm. Disabled in create mode — needs a persisted studentId.
 */
@Component({
    selector: 'student-documents-tab',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule, FormsModule,
        MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
        MatProgressBarModule, MatSelectModule, MatTooltipModule,
    ],
    template: `
<div *ngIf="!studentId" class="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-300">
    Save the student first — documents can be uploaded from the Edit screen.
</div>

<div *ngIf="studentId">
    <div class="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
        <mat-form-field appearance="outline" class="w-full">
            <mat-label>Document type</mat-label>
            <mat-select [(value)]="selectedType">
                <mat-option *ngFor="let opt of typeOptions" [value]="opt.value">{{ opt.label }}</mat-option>
            </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full md:col-span-2">
            <mat-label>Description (optional)</mat-label>
            <input matInput [(ngModel)]="description" maxlength="500" placeholder="Short note shown next to the file">
        </mat-form-field>
    </div>

    <div class="flex items-center gap-3 mb-4">
        <input type="file" class="hidden" #fileInput (change)="onFileSelected($event)"
               accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx">
        <button mat-flat-button color="primary" (click)="fileInput.click()" [disabled]="uploading">
            <mat-icon class="mr-1">cloud_upload</mat-icon>
            {{ uploading ? 'Uploading…' : 'Choose file' }}
        </button>
        <span class="text-xs text-gray-500">Max 10 MB · PDF / images / Word / Excel.</span>
    </div>

    <mat-progress-bar *ngIf="loading || uploading" mode="indeterminate" class="mb-4"></mat-progress-bar>

    <div *ngIf="!loading" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let d of docs" class="border-t border-gray-100 dark:border-gray-700 hover:bg-blue-50/30">
                    <td class="px-4 py-2">
                        <div class="flex flex-col">
                            <span class="font-medium text-gray-900 dark:text-gray-100">{{ d.fileName }}</span>
                            <span *ngIf="d.description" class="text-xs text-gray-500">{{ d.description }}</span>
                        </div>
                    </td>
                    <td class="px-4 py-2 text-sm">{{ typeLabel(d.documentType) }}</td>
                    <td class="px-4 py-2 text-sm">{{ d.fileSizeBytes / 1024 | number:'1.0-1' }} KB</td>
                    <td class="px-4 py-2 text-xs text-gray-500">{{ d.createdOn | date:'medium' }}</td>
                    <td class="px-4 py-2 text-right whitespace-nowrap">
                        <a mat-icon-button [href]="absolute(d.fileUrl)" target="_blank" matTooltip="Open in new tab">
                            <mat-icon class="!w-5 !h-5 !text-base">open_in_new</mat-icon>
                        </a>
                        <button mat-icon-button color="warn" (click)="remove(d)" matTooltip="Delete">
                            <mat-icon class="!w-5 !h-5 !text-base">delete</mat-icon>
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div *ngIf="docs.length === 0" class="py-12 text-center text-sm text-gray-500">No documents uploaded yet.</div>
    </div>
</div>
    `,
})
export class StudentDocumentsTabComponent implements OnInit {
    @Input() studentId?: string;

    docs: StudentDocumentDto[] = [];
    loading = false;
    uploading = false;
    selectedType: StudentDocumentType = StudentDocumentType.Other;
    description = '';

    typeOptions = Object.entries(STUDENT_DOCUMENT_TYPE_LABELS).map(([value, label]) => ({
        value: Number(value) as StudentDocumentType,
        label,
    }));

    constructor(
        private _svc: StudentDocumentsService,
        private _notify: NotificationService,
        private _cdr: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        if (this.studentId) this.load();
    }

    typeLabel(t: StudentDocumentType): string {
        return STUDENT_DOCUMENT_TYPE_LABELS[t] ?? 'Other';
    }

    absolute(url: string): string {
        if (!url) return '#';
        if (/^https?:\/\//i.test(url)) return url;
        return `/${url.replace(/^\/+/, '')}`;
    }

    load(): void {
        if (!this.studentId) return;
        this.loading = true;
        this._svc.list(this.studentId).subscribe({
            next: docs => { this.docs = docs; this.loading = false; this._cdr.markForCheck(); },
            error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load documents.'); },
        });
    }

    onFileSelected(evt: Event): void {
        const input = evt.target as HTMLInputElement;
        if (!input.files?.length || !this.studentId) return;
        const file = input.files[0];
        if (file.size > 10 * 1024 * 1024) {
            this._notify.error('File too large — max 10 MB.');
            input.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const data = reader.result as string;
            const extMatch = file.name.match(/\.[^.]+$/);
            const ext = (extMatch ? extMatch[0] : '').toLowerCase();
            const name = file.name.replace(/\.[^.]+$/, '');

            const req: CreateStudentDocumentRequest = {
                studentId: this.studentId!,
                documentType: this.selectedType,
                description: this.description || undefined,
                file: { name, extension: ext, data },
            };

            this.uploading = true;
            this._cdr.markForCheck();
            this._svc.create(req).subscribe({
                next: () => {
                    this.uploading = false;
                    this.description = '';
                    input.value = '';
                    this._notify.success('Document uploaded.');
                    this.load();
                },
                error: () => {
                    this.uploading = false;
                    input.value = '';
                    this._cdr.markForCheck();
                    this._notify.error('Upload failed.');
                },
            });
        };
        reader.readAsDataURL(file);
    }

    remove(d: StudentDocumentDto): void {
        if (!confirm(`Delete "${d.fileName}"?`)) return;
        this._svc.delete(d.id).subscribe({
            next: () => { this._notify.success('Document deleted.'); this.load(); },
            error: () => this._notify.error('Delete failed.'),
        });
    }
}
