import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';
import { ListPageComponent } from '../../../shared/components/list-page.component';

interface SentAnnouncementDto {
    batchId: string;
    title: string;
    body: string;
    severity: string;
    audience: string;
    linkUrl?: string;
    sentOn: string;
    deliveredTo: number;
    readCount: number;
}

@Component({
    selector: 'announcement-archive',
    templateUrl: './announcement-archive.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, DatePipe, MatButtonModule, MatIconModule, MatProgressBarModule, MatTableModule, MatTooltipModule, ListPageComponent],
})
export class AnnouncementArchiveComponent implements OnInit, OnDestroy {
    rows: SentAnnouncementDto[] = [];
    loading = false;
    expandedId: string | null = null;
    cols = ['sentOn', 'title', 'severity', 'audience', 'delivery', 'actions'];
    private _destroyed$ = new Subject<void>();

    constructor(
        private _http: HttpClient,
        private _cdr: ChangeDetectorRef,
        private _notify: NotificationService,
    ) {}

    ngOnInit(): void { this.load(); }
    ngOnDestroy(): void { this._destroyed$.next(); this._destroyed$.complete(); }

    load(): void {
        this.loading = true;
        this._http.get<SentAnnouncementDto[]>(`${environment.apiUrl}/api/announcements/search?take=100`)
            .pipe(takeUntil(this._destroyed$))
            .subscribe({
                next: (r) => { this.rows = r; this.loading = false; this._cdr.markForCheck(); },
                error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load announcement archive.'); },
            });
    }

    toggleExpand(id: string): void { this.expandedId = this.expandedId === id ? null : id; }

    severityClass(s: string): string {
        switch (s) {
            case 'Urgent': return 'bg-red-100 text-red-800';
            case 'Warning': return 'bg-amber-100 text-amber-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    }

    readPercent(r: SentAnnouncementDto): number {
        return r.deliveredTo > 0 ? Math.round((r.readCount / r.deliveredTo) * 100) : 0;
    }
}
