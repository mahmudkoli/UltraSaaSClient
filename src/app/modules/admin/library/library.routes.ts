import { Routes } from '@angular/router';
import { BookFormComponent } from './book-form.component';
import { BooksListComponent } from './books-list.component';
import { IssueFormComponent } from './issue-form.component';
import { IssuesListComponent } from './issues-list.component';

export default [
    { path: '', redirectTo: 'books', pathMatch: 'full' },
    { path: 'books', component: BooksListComponent },
    { path: 'books/create', component: BookFormComponent },
    { path: 'books/:id/edit', component: BookFormComponent },
    { path: 'issues', component: IssuesListComponent },
    { path: 'issues/create', component: IssueFormComponent },
    { path: 'issues/:id/edit', component: IssueFormComponent },
] as Routes;
