import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { InstitutesService } from '../../../core/institutes/institutes.service';
import { CreateInstituteRequest } from '../../../core/institutes/institutes.types';

interface ImportRow {
    data: CreateInstituteRequest;
    valid: boolean;
    error?: string;
    result?: 'created' | 'failed';
}

/**
 * #32 — CSV bulk-import of institutes. Parses client-side, validates required
 * columns, previews, then fans out the existing create endpoint per row (reporting
 * per-row success/failure). Required headers: tenantId, code, displayName, type, contactEmail.
 */
@Component({
    selector: 'institute-import',
    templateUrl: './institute-import.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatTableModule, MatTooltipModule],
})
export class InstituteImportComponent {
    private static readonly REQUIRED = ['tenantId', 'code', 'displayName', 'type', 'contactEmail'];
    private static readonly TYPES = ['school', 'college', 'university'];

    rows: ImportRow[] = [];
    fileName = '';
    parseError = '';
    importing = false;
    done = false;
    createdCount = 0;
    failedCount = 0;
    cols = ['status', 'tenantId', 'code', 'displayName', 'type', 'contactEmail'];

    constructor(private _svc: InstitutesService, private _router: Router) {}

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files && input.files[0];
        input.value = '';
        if (!file) return;
        this.fileName = file.name;
        this.parseError = '';
        this.done = false;
        const reader = new FileReader();
        reader.onload = () => {
            try { this.rows = this.parse(reader.result as string); }
            catch (e) { this.parseError = (e as Error).message; this.rows = []; }
        };
        reader.readAsText(file);
    }

    get validCount(): number { return this.rows.filter(r => r.valid).length; }

    /** Minimal RFC-4180-ish parser: handles quoted fields and embedded commas/quotes. */
    private parse(text: string): ImportRow[] {
        const records = this.toRecords(text.replace(/\r\n/g, '\n').replace(/\r/g, '\n'));
        if (records.length === 0) throw new Error('The file is empty.');
        const headers = records[0].map(h => h.trim());
        const missing = InstituteImportComponent.REQUIRED.filter(r => !headers.includes(r));
        if (missing.length) throw new Error(`Missing required column(s): ${missing.join(', ')}. Expected: ${InstituteImportComponent.REQUIRED.join(', ')}.`);

        const idx = (name: string) => headers.indexOf(name);
        const out: ImportRow[] = [];
        for (let i = 1; i < records.length; i++) {
            const cells = records[i];
            if (cells.length === 1 && cells[0].trim() === '') continue; // skip blank lines
            const get = (n: string) => (idx(n) >= 0 ? (cells[idx(n)] ?? '').trim() : '');
            const data: CreateInstituteRequest = {
                tenantId: get('tenantId'),
                code: get('code'),
                displayName: get('displayName'),
                type: get('type'),
                contactEmail: get('contactEmail'),
                country: get('country') || undefined,
                contactPhone: get('contactPhone') || undefined,
                addressLine: get('addressLine') || undefined,
                city: get('city') || undefined,
                state: get('state') || undefined,
                postalCode: get('postalCode') || undefined,
                website: get('website') || undefined,
            };
            let error: string | undefined;
            const missingField = InstituteImportComponent.REQUIRED.find(f => !get(f));
            if (missingField) error = `Missing ${missingField}`;
            else if (!InstituteImportComponent.TYPES.includes(data.type.toLowerCase())) error = `Invalid type "${data.type}" (School/College/University)`;
            else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.contactEmail)) error = 'Invalid contactEmail';
            out.push({ data, valid: !error, error });
        }
        if (out.length === 0) throw new Error('No data rows found.');
        return out;
    }

    private toRecords(text: string): string[][] {
        const records: string[][] = [];
        let field = '', row: string[] = [], inQuotes = false;
        for (let i = 0; i < text.length; i++) {
            const c = text[i];
            if (inQuotes) {
                if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
                else field += c;
            } else if (c === '"') inQuotes = true;
            else if (c === ',') { row.push(field); field = ''; }
            else if (c === '\n') { row.push(field); records.push(row); row = []; field = ''; }
            else field += c;
        }
        if (field !== '' || row.length > 0) { row.push(field); records.push(row); }
        return records;
    }

    import(): void {
        const valid = this.rows.filter(r => r.valid);
        if (valid.length === 0) return;
        this.importing = true;
        forkJoin(valid.map(r =>
            this._svc.create(r.data).pipe(
                map(() => { r.result = 'created' as const; return true; }),
                catchError(() => { r.result = 'failed' as const; return of(false); }),
            ),
        )).subscribe((results) => {
            this.createdCount = results.filter(Boolean).length;
            this.failedCount = results.length - this.createdCount;
            this.importing = false;
            this.done = true;
        });
    }

    reset(): void { this.rows = []; this.fileName = ''; this.parseError = ''; this.done = false; this.createdCount = 0; this.failedCount = 0; }
    back(): void { this._router.navigate(['/institute']); }
}
