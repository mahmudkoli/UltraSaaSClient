import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { EVENT_TYPES, EventDto, EventsService } from '../../../core/events/events.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ListPageComponent } from '../../../shared/components/list-page.component';

@Component({
    selector: 'events-list',
    templateUrl: './events-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, DatePipe, ReactiveFormsModule, RouterModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatProgressBarModule, MatTableModule, MatTooltipModule, ListPageComponent],
})
export class EventsListComponent implements OnInit, OnDestroy {
    rows: EventDto[] = [];
    total = 0; pageIndex = 0; pageSize = 25; loading = false;
    search = new FormControl('');
    cols = ['icon', 'title', 'type', 'location', 'status', 'actions'];
    private _destroyed$ = new Subject<void>();

    typeLabel(t: number): string { return EVENT_TYPES.find(e => e.v === t)?.l || '—'; }

    constructor(private _svc: EventsService, private _cdr: ChangeDetectorRef, private _router: Router, private _notify: NotificationService) {}

    ngOnInit(): void {
        this.search.valueChanges.pipe(takeUntil(this._destroyed$), debounceTime(300), distinctUntilChanged())
            .subscribe(() => { this.pageIndex = 0; this.load(); });
        this.load();
    }
    ngOnDestroy(): void { this._destroyed$.next(); this._destroyed$.complete(); }

    load(): void {
        this.loading = true;
        this._svc.search({ pageNumber: this.pageIndex + 1, pageSize: this.pageSize, keyword: this.search.value || undefined })
            .pipe(takeUntil(this._destroyed$)).subscribe({
                next: (r) => { this.rows = r.data; this.total = r.totalCount; this.loading = false; this._cdr.markForCheck(); },
                error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load events.'); },
            });
    }

    onPage(e: PageEvent): void { this.pageIndex = e.pageIndex; this.pageSize = e.pageSize; this.load(); }
    add(): void { this._router.navigate(['/events/create']); }
    edit(e: EventDto): void { this._router.navigate(['/events', e.id, 'edit']); }
    remove(e: EventDto): void {
        if (!confirm(`Delete event "${e.title}"?`)) return;
        this._svc.delete(e.id).pipe(takeUntil(this._destroyed$)).subscribe({
            next: () => { this._notify.success('Deleted.'); this.load(); },
            error: () => this._notify.error('Delete failed.'),
        });
    }
}
