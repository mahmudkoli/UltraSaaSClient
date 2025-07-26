import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DateUtils {
    
    /**
     * Format date to prevent timezone issues
     * Ensures the date selected by user is preserved exactly
     */
    formatDateForAPI(date: Date | string | null | undefined): string {
        if (!date) return '';
        
        const dateObj = new Date(date);
        
        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return '';
        }
        
        // Get the date components in local timezone
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        
        // Return date in YYYY-MM-DD format to avoid timezone issues
        return `${year}-${month}-${day}`;
    }

    /**
     * Format date for display
     */
    formatDateForDisplay(date: Date | string | null | undefined): string {
        if (!date) return '';
        
        const dateObj = new Date(date);
        
        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return '';
        }
        
        return dateObj.toLocaleDateString();
    }

    /**
     * Convert string date to Date object
     */
    parseDate(dateString: string | null | undefined): Date | null {
        if (!dateString) return null;
        
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    }

    /**
     * Check if date is valid
     */
    isValidDate(date: Date | string | null | undefined): boolean {
        if (!date) return false;
        
        const dateObj = new Date(date);
        return !isNaN(dateObj.getTime());
    }
} 