import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { StudentsService } from '../../../core/students/students.service';
import { StudentExamResultRow } from '../../../core/students/my-child.types';
import { NotificationService } from '../../../core/services/notification.service';
import { ListPageComponent } from '../../../shared/components/list-page.component';
import { gradeClass } from './my-child.display';

interface ExamGroup {
    examName: string;
    examDate?: string;
    rows: StudentExamResultRow[];
    obtained: number;
    total: number;
    percentage: number;
}

@Component({
    selector: 'my-child-exam-results',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatIconModule, MatProgressBarModule, RouterLink, ListPageComponent],
    template: `
<app-list-page title="My Exam Results" subtitle="Your report card, grouped by exam."
    icon="grading" iconGradient="from-violet-500 to-purple-600"
    pageGradient="from-gray-50 via-violet-50/30 to-purple-50/30">
    <ng-container pageActions>
        <a routerLink="/my-profile" class="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary">
            <mat-icon class="icon-size-5 mr-1">arrow_back</mat-icon> Back to dashboard
        </a>
    </ng-container>

    <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>

    <div *ngIf="!loading" class="flex flex-col gap-6">
        <div *ngFor="let g of groups" class="rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                <div>
                    <h3 class="font-semibold text-gray-900 dark:text-white">{{ g.examName }}</h3>
                    <p class="text-xs text-gray-500" *ngIf="g.examDate">{{ g.examDate | date:'dd MMM yyyy' }}</p>
                </div>
                <div class="text-right">
                    <div class="text-lg font-bold" [ngClass]="g.percentage >= 33 ? 'text-emerald-700' : 'text-red-700'">{{ g.percentage | number:'1.1-1' }}%</div>
                    <div class="text-xs text-gray-500">{{ g.obtained | number }} / {{ g.total | number }}</div>
                </div>
            </div>
            <table class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-900/40 text-gray-500 uppercase text-xs">
                    <tr>
                        <th class="text-left font-medium px-5 py-2.5">Subject</th>
                        <th class="text-left font-medium px-5 py-2.5">Marks</th>
                        <th class="text-left font-medium px-5 py-2.5">%</th>
                        <th class="text-left font-medium px-5 py-2.5">Grade</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let r of g.rows" class="border-t border-gray-100 dark:border-gray-700/60">
                        <td class="px-5 py-2.5">{{ r.subjectName }}</td>
                        <td class="px-5 py-2.5">
                            <span *ngIf="!r.isAbsent">{{ r.marksObtained | number }} / {{ r.totalMarks | number }}</span>
                            <span *ngIf="r.isAbsent" class="text-gray-400 italic">Absent</span>
                        </td>
                        <td class="px-5 py-2.5">{{ r.isAbsent ? '—' : (r.percentage | number:'1.1-1') + '%' }}</td>
                        <td class="px-5 py-2.5"><span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" [ngClass]="gradeClass(r.grade)">{{ r.grade || '—' }}</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div *ngIf="!groups.length" class="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-10 text-center text-gray-400">
            No exam results published yet.
        </div>
    </div>
</app-list-page>
    `,
})
export class MyChildExamResultsComponent implements OnInit {
    groups: ExamGroup[] = [];
    loading = true;
    gradeClass = gradeClass;

    constructor(private _svc: StudentsService, private _cdr: ChangeDetectorRef, private _notify: NotificationService) {}

    ngOnInit(): void {
        this._svc.getMyExamResults().subscribe({
            next: (rows) => { this.groups = this.group(rows ?? []); this.loading = false; this._cdr.markForCheck(); },
            error: () => { this.loading = false; this._cdr.markForCheck(); this._notify.error('Could not load exam results.'); },
        });
    }

    private group(rows: StudentExamResultRow[]): ExamGroup[] {
        const map = new Map<string, ExamGroup>();
        for (const r of rows) {
            let g = map.get(r.examName);
            if (!g) { g = { examName: r.examName, examDate: r.examDate, rows: [], obtained: 0, total: 0, percentage: 0 }; map.set(r.examName, g); }
            g.rows.push(r);
            if (!r.isAbsent) { g.obtained += r.marksObtained; g.total += r.totalMarks; }
        }
        const groups = [...map.values()];
        groups.forEach(g => g.percentage = g.total > 0 ? (g.obtained * 100) / g.total : 0);
        return groups;
    }
}
