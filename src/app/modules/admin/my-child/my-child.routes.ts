import { Routes } from '@angular/router';
import { MyChildComponent } from './my-child.component';
import { MyChildAttendanceComponent } from './my-child-attendance.component';
import { MyChildExamResultsComponent } from './my-child-exam-results.component';
import { MyChildTimetableComponent } from './my-child-timetable.component';
import { MyChildInvoicesComponent } from './my-child-invoices.component';
import { MyChildInvoiceDetailComponent } from './my-child-invoice-detail.component';
import { MyChildEventsComponent } from './my-child-events.component';

export default [
    { path: '', component: MyChildComponent },
    { path: 'attendance', component: MyChildAttendanceComponent },
    { path: 'exam-results', component: MyChildExamResultsComponent },
    { path: 'timetable', component: MyChildTimetableComponent },
    { path: 'invoices', component: MyChildInvoicesComponent },
    { path: 'invoices/:id', component: MyChildInvoiceDetailComponent },
    { path: 'events', component: MyChildEventsComponent },
] as Routes;
