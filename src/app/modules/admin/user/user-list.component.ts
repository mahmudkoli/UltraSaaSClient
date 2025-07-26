import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, BehaviorSubject, filter } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { trigger, transition, style, animate } from '@angular/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UserService } from '../../../core/user/user.service';
import { UserDetailsDto, UserListFilter, PaginationResponseOfUserDetailsDto } from '../../../core/user/user.types';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'user-list',
    templateUrl: './user-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,

    animations: [
        fuseAnimations,
        trigger('fadeInUp', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ])
    ],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        MatTooltipModule,
        RouterModule,
    ],
})
export class UserListComponent implements OnInit, OnDestroy {
    users: UserDetailsDto[] = [];
    filteredUsers: UserDetailsDto[] = [];
    isLoading = false;
    isSearching = false;
    searchTerm = '';
    selectedStatus: string = 'all';
    
    // Pagination
    pagination: PaginationResponseOfUserDetailsDto | null = null;
    currentPage = 1;
    pageSize = 10;
    totalCount = 0;
    
    // Search debouncing
    private _searchSubject = new BehaviorSubject<string | null>(null);
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _userService: UserService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _notificationService: NotificationService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.setupSearchDebouncing();
        this.loadUsers();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadUsers(): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        console.log('Loading users...');

        const filter: UserListFilter = {
            pageNumber: this.currentPage,
            pageSize: this.pageSize,
            orderBy: ['firstName'] // Array of strings as per API spec
        };

        if (this.searchTerm) {
            filter.keyword = this.searchTerm; // Use keyword for general search
        }

        if (this.selectedStatus !== 'all') {
            filter.isActive = this.selectedStatus === 'active';
        }

        console.log('Sending filter:', filter);

        this._userService.searchUsers(filter)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    console.log('API Response:', response);
                    
                    // Handle paginated response
                    if (response && response.data) {
                        // Paginated response
                        this.users = response.data;
                        this.filteredUsers = response.data;
                        this.pagination = response;
                        this.totalCount = response.totalCount;
                    } else {
                        // Fallback
                        this.users = [];
                        this.filteredUsers = [];
                        this.pagination = null;
                        this.totalCount = 0;
                    }
                    
                    console.log('Processed users:', this.users);
                    console.log('Processed filteredUsers:', this.filteredUsers);
                    
                    this.isLoading = false;
                    this.isSearching = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading users:', error);
                    this.users = [];
                    this.filteredUsers = [];
                    this.pagination = null;
                    this.totalCount = 0;
                    this.isLoading = false;
                    this.isSearching = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    setupSearchDebouncing(): void {
        // Setup debounced search with 500ms delay
        this._searchSubject
            .pipe(
                debounceTime(500), // Wait 500ms after last input
                distinctUntilChanged(), // Only emit if value changed
                filter(searchTerm => searchTerm !== null), // Only process non-null values
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(searchTerm => {
                this.searchTerm = searchTerm as string || '';
                this.currentPage = 1; // Reset to first page when searching
                this.isSearching = true;
                this._changeDetectorRef.markForCheck();
                this.loadUsers();
            });
    }

    onSearchChange(value: string): void {
        // Emit the search value to the debounced subject
        this._searchSubject.next(value);
    }

    onStatusChange(): void {
        this.currentPage = 1; // Reset to first page when changing status
        this.loadUsers();
    }

    onPageChange(event: any): void {
        this.currentPage = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.loadUsers();
    }

    toggleUserStatus(user: UserDetailsDto): void {
        const action = user.isActive ? 'deactivate' : 'activate';
        const confirmation = this._fuseConfirmationService.open({
            title: `Confirm ${action}`,
            message: `Are you sure you want to ${action} this user?`,
            actions: {
                confirm: {
                    label: `${action.charAt(0).toUpperCase() + action.slice(1)}`,
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._userService.toggleUserStatus(user.id, !user.isActive)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe({
                        next: () => {
                            // Update the user status locally
                            user.isActive = !user.isActive;
                            this._changeDetectorRef.markForCheck();
                            this._notificationService.success(`User ${action}d successfully`);
                        },
                        error: (error) => {
                            console.error(`Error ${action}ing user:`, error);
                            this._notificationService.error(`Failed to ${action} user`);
                        }
                    });
            }
        });
    }





    getFullName(user: UserDetailsDto): string {
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        return `${firstName} ${lastName}`.trim() || 'N/A';
    }

    getPaginationDisplayText(): string {
        if (!this.pagination) return '';
        
        const start = (this.pagination.currentPage - 1) * this.pagination.pageSize + 1;
        const end = Math.min(this.pagination.currentPage * this.pagination.pageSize, this.pagination.totalCount);
        
        return `Showing ${start} to ${end} of ${this.pagination.totalCount} results`;
    }



} 