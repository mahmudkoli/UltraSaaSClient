import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable } from 'rxjs';
import { ProductImportMode, ProductImportSummary, InitialStockImportSummary, ProductImportError, InitialStockImportError } from './import.types';

/**
 * Dialog config — passed via `MAT_DIALOG_DATA`. The two flavors (product /
 * stock) share visuals; the differences are the title, the mode picker
 * (only product import has one), the template URL, the submit closure,
 * and the summary shape.
 */
export interface ImportDialogConfig {
    /** Tab title shown at the top of the dialog. */
    title: string;
    /** One-line orientation under the title. */
    subtitle: string;
    /** Backend URL of the .xlsx template — operator clicks Download. */
    templateUrl: string;
    /** True for the Product importer (Mode select visible). */
    showModeSelector: boolean;
    /**
     * Submit closure — called with the picked file (and Mode for products).
     * Returns either summary type. The component renders both shapes.
     */
    submit: (file: File, mode: ProductImportMode) => Observable<ProductImportSummary | InitialStockImportSummary>;
    /** Heroicons key for the title bar. */
    icon: string;
}

@Component({
    selector: 'app-import-dialog',
    standalone: true,
    imports: [
        CommonModule, FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule,
        MatProgressBarModule, MatRadioModule, MatTableModule, MatTooltipModule,
    ],
    template: `
        <div class="flex items-center gap-3 px-6 pt-5 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <mat-icon class="text-white">{{ data.icon }}</mat-icon>
            </div>
            <div class="flex flex-col">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ data.title }}</h2>
                <p class="text-xs text-gray-500">{{ data.subtitle }}</p>
            </div>
            <button mat-icon-button class="ml-auto" mat-dialog-close [disabled]="uploading()">
                <mat-icon>close</mat-icon>
            </button>
        </div>

        <div class="px-6 py-4 space-y-4 min-w-[520px]">
            @if (!summary()) {
                <!-- Step 1: pick file + mode -->
                <div class="flex items-start gap-3 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
                    <mat-icon class="text-indigo-600 mt-0.5">download</mat-icon>
                    <div class="flex-1">
                        <p class="text-sm text-gray-700 dark:text-gray-200 font-medium">Need the file format?</p>
                        <p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            Download the template, fill in your data, save as .xlsx, then upload below.
                        </p>
                        <button type="button" mat-stroked-button color="primary" class="mt-2 !h-9 !text-sm"
                                [disabled]="downloadingTemplate()" (click)="downloadTemplate()">
                            <mat-icon class="icon-size-4 mr-1">file_download</mat-icon>
                            <span>{{ downloadingTemplate() ? 'Downloading…' : 'Download template' }}</span>
                        </button>
                        @if (templateError()) {
                            <p class="text-xs text-rose-600 mt-1">{{ templateError() }}</p>
                        }
                    </div>
                </div>

                <div>
                    <input #fileInput type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden (change)="onFile($event)">
                    <button mat-stroked-button color="primary" class="!w-full !h-12" (click)="fileInput.click()">
                        <mat-icon class="icon-size-5 mr-2">upload_file</mat-icon>
                        <span>{{ file() ? file()!.name : 'Pick an .xlsx file' }}</span>
                    </button>
                    <p class="text-xs text-gray-500 mt-1.5 text-center">Max 10 MB · header row required</p>
                </div>

                @if (data.showModeSelector) {
                    <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                        <p class="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Mode</p>
                        <mat-radio-group [(ngModel)]="mode" class="flex flex-col gap-1">
                            <mat-radio-button value="AutoCreate">
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium">Auto-create &amp; skip duplicates <span class="text-gray-500 font-normal">(default)</span></span>
                                    <span class="text-xs text-gray-500">Missing categories / brands / units are created automatically. Existing SKUs are skipped.</span>
                                </div>
                            </mat-radio-button>
                            <mat-radio-button value="Update">
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium">Auto-create &amp; update existing</span>
                                    <span class="text-xs text-gray-500">Same as above, but existing SKUs get their fields overwritten with the file's values.</span>
                                </div>
                            </mat-radio-button>
                            <mat-radio-button value="Strict">
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium">Strict</span>
                                    <span class="text-xs text-gray-500">Reject the row if a category / brand / unit doesn't already exist or if the SKU is already in the system.</span>
                                </div>
                            </mat-radio-button>
                        </mat-radio-group>
                    </div>
                }

                @if (uploadError()) {
                    <div class="text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-3">
                        <mat-icon class="icon-size-5 align-middle mr-1">error</mat-icon>
                        <span class="align-middle">{{ uploadError() }}</span>
                    </div>
                }

                @if (uploading()) {
                    <mat-progress-bar mode="indeterminate"></mat-progress-bar>
                }
            } @else {
                <!-- Step 2: result summary -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div class="rounded-lg p-3 bg-gray-50 dark:bg-gray-800 text-center">
                        <div class="text-xs text-gray-500 uppercase">Total rows</div>
                        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ summary()!.total }}</div>
                    </div>
                    <div class="rounded-lg p-3 bg-emerald-50 dark:bg-emerald-900/30 text-center">
                        <div class="text-xs text-emerald-700 uppercase">Created</div>
                        <div class="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{{ summary()!.created }}</div>
                    </div>
                    @if (asProductSummary(); as ps) {
                        <div class="rounded-lg p-3 bg-blue-50 dark:bg-blue-900/30 text-center">
                            <div class="text-xs text-blue-700 uppercase">Updated</div>
                            <div class="text-2xl font-bold text-blue-700 dark:text-blue-300">{{ ps.updated }}</div>
                        </div>
                    }
                    <div class="rounded-lg p-3 bg-amber-50 dark:bg-amber-900/30 text-center">
                        <div class="text-xs text-amber-700 uppercase">Skipped</div>
                        <div class="text-2xl font-bold text-amber-700 dark:text-amber-300">{{ summary()!.skipped }}</div>
                    </div>
                    <div class="rounded-lg p-3 bg-rose-50 dark:bg-rose-900/30 text-center" [class.col-span-1]="!asProductSummary()" [class.col-span-2]="!asProductSummary() && summary()!.total === 0">
                        <div class="text-xs text-rose-700 uppercase">Failed</div>
                        <div class="text-2xl font-bold text-rose-700 dark:text-rose-300">{{ summary()!.failed }}</div>
                    </div>
                </div>

                @if (asProductSummary(); as ps) {
                    @if (ps.createdLookups.categories.length || ps.createdLookups.brands.length || ps.createdLookups.units.length) {
                        <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                            <p class="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Auto-created lookups</p>
                            <div class="flex flex-col gap-1 text-sm">
                                @if (ps.createdLookups.categories.length) {
                                    <div><span class="text-gray-500">Categories:</span> <span>{{ ps.createdLookups.categories.join(', ') }}</span></div>
                                }
                                @if (ps.createdLookups.brands.length) {
                                    <div><span class="text-gray-500">Brands:</span> <span>{{ ps.createdLookups.brands.join(', ') }}</span></div>
                                }
                                @if (ps.createdLookups.units.length) {
                                    <div><span class="text-gray-500">Units:</span> <span>{{ ps.createdLookups.units.join(', ') }}</span></div>
                                }
                            </div>
                        </div>
                    }
                }

                @if (summary()!.warnings.length) {
                    <div class="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3">
                        <p class="text-xs font-medium text-amber-700 mb-1">Warnings</p>
                        <ul class="text-sm text-amber-800 dark:text-amber-200 space-y-0.5">
                            @for (w of summary()!.warnings; track w) {
                                <li>· {{ w }}</li>
                            }
                        </ul>
                    </div>
                }

                @if (summary()!.errors.length) {
                    <div class="rounded-lg border border-rose-200 dark:border-rose-800">
                        <details class="group">
                            <summary class="flex items-center gap-2 cursor-pointer p-3 text-sm font-medium text-rose-700">
                                <mat-icon class="icon-size-4">error</mat-icon>
                                <span>{{ summary()!.errors.length }} row{{ summary()!.errors.length === 1 ? '' : 's' }} failed — click to expand</span>
                                <mat-icon class="icon-size-4 ml-auto group-open:rotate-180 transition-transform">expand_more</mat-icon>
                            </summary>
                            <div class="border-t border-rose-200 dark:border-rose-800 max-h-72 overflow-y-auto">
                                <table class="w-full text-xs">
                                    <thead class="bg-rose-50 dark:bg-rose-900/20 sticky top-0">
                                        <tr>
                                            <th class="text-left px-3 py-2">Row</th>
                                            <th class="text-left px-3 py-2">Identifier</th>
                                            <th class="text-left px-3 py-2">Message</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @for (e of summary()!.errors; track $index) {
                                            <tr class="border-t border-rose-100 dark:border-rose-900">
                                                <td class="px-3 py-2 font-mono">{{ e.row }}</td>
                                                <td class="px-3 py-2 font-mono">{{ identifierFor(e) }}</td>
                                                <td class="px-3 py-2">{{ e.message }}</td>
                                            </tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </details>
                    </div>
                }
            }
        </div>

        <div class="flex items-center justify-end gap-2 px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            @if (!summary()) {
                <button mat-button mat-dialog-close [disabled]="uploading()">Cancel</button>
                <button mat-flat-button color="primary" [disabled]="!file() || uploading()" (click)="submit()">
                    <mat-icon class="icon-size-5 mr-1">cloud_upload</mat-icon>
                    <span>{{ uploading() ? 'Importing…' : 'Import' }}</span>
                </button>
            } @else {
                <button mat-stroked-button (click)="reset()">Import another file</button>
                <button mat-flat-button color="primary" [mat-dialog-close]="summary()">Done</button>
            }
        </div>
    `,
})
export class ImportDialogComponent {
    private readonly ref = inject(MatDialogRef<ImportDialogComponent>);
    private readonly http = inject(HttpClient);
    readonly data: ImportDialogConfig = inject(MAT_DIALOG_DATA);

    readonly file = signal<File | null>(null);
    /** Plain field — ngModel two-way binding needs a writable property; signal isn't directly bindable. */
    mode: ProductImportMode = 'AutoCreate';
    readonly uploading = signal(false);
    readonly uploadError = signal<string | null>(null);
    readonly summary = signal<ProductImportSummary | InitialStockImportSummary | null>(null);
    readonly downloadingTemplate = signal(false);
    readonly templateError = signal<string | null>(null);

    /**
     * Pulls the template as a blob via HttpClient (so the auth interceptor adds
     * the JWT + tenant header). A plain `<a href>` would fire a fresh browser
     * request without those headers and trigger the backend's 401.
     */
    downloadTemplate(): void {
        this.downloadingTemplate.set(true);
        this.templateError.set(null);
        this.http.get(this.data.templateUrl, { responseType: 'blob', observe: 'response' }).subscribe({
            next: (resp) => {
                this.downloadingTemplate.set(false);
                const blob = resp.body;
                if (!blob) {
                    this.templateError.set('Empty template response.');
                    return;
                }
                // Filename from Content-Disposition; fall back to a default.
                const cd = resp.headers.get('Content-Disposition') ?? '';
                const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
                const filename = match?.[1] ?? 'import-template.xlsx';
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            },
            error: (err: HttpErrorResponse) => {
                this.downloadingTemplate.set(false);
                const msg = err?.error?.exception ?? err?.error?.messages?.[0] ?? err?.message ?? 'Could not download template.';
                this.templateError.set(typeof msg === 'string' ? msg : 'Could not download template.');
            },
        });
    }

    /** Type-narrowing helper — returns the summary as ProductImportSummary if it has the `updated` field. */
    asProductSummary = computed<ProductImportSummary | null>(() => {
        const s = this.summary();
        return s && 'updated' in s ? (s as ProductImportSummary) : null;
    });

    onFile(event: Event): void {
        const input = event.target as HTMLInputElement;
        const f = input.files?.[0] ?? null;
        input.value = '';
        if (f && !f.name.toLowerCase().endsWith('.xlsx')) {
            this.uploadError.set('Only .xlsx files are supported. Save your CSV as Excel first.');
            this.file.set(null);
            return;
        }
        this.uploadError.set(null);
        this.file.set(f);
    }

    submit(): void {
        const f = this.file();
        if (!f) return;
        this.uploading.set(true);
        this.uploadError.set(null);
        this.data.submit(f, this.mode).subscribe({
            next: (s) => {
                this.uploading.set(false);
                this.summary.set(s);
            },
            error: (err: HttpErrorResponse) => {
                this.uploading.set(false);
                const msg = err?.error?.exception ?? err?.error?.messages?.[0] ?? err?.message ?? 'Import failed';
                this.uploadError.set(typeof msg === 'string' ? msg : 'Import failed');
            },
        });
    }

    reset(): void {
        this.summary.set(null);
        this.file.set(null);
        this.uploadError.set(null);
        this.mode = 'AutoCreate';
    }

    identifierFor(e: ProductImportError | InitialStockImportError): string {
        if ('outletCode' in e && (e.outletCode || e.sku)) {
            return [e.outletCode, (e as InitialStockImportError).sku].filter(Boolean).join(' / ');
        }
        return e.sku ?? '—';
    }
}
