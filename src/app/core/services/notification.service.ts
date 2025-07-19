import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor(private _snackBar: MatSnackBar) { }

    /**
     * Show success notification
     */
    success(message: string, duration: number = 3000): void {
        this.show(message, 'success', duration);
    }

    /**
     * Show error notification
     */
    error(message: string, duration: number = 5000): void {
        this.show(message, 'error', duration);
    }

    /**
     * Show warning notification
     */
    warning(message: string, duration: number = 4000): void {
        this.show(message, 'warning', duration);
    }

    /**
     * Show info notification
     */
    info(message: string, duration: number = 3000): void {
        this.show(message, 'info', duration);
    }

    /**
     * Show notification
     */
    private show(message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number): void {
        const config: MatSnackBarConfig = {
            duration: duration,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: [`fuse-snackbar-${type}`]
        };

        this._snackBar.open(message, 'Close', config);
    }
} 