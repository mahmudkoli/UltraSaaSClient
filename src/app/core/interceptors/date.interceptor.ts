import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { DateUtils } from '../utils/date.utils';

export const dateInterceptor: HttpInterceptorFn = (
    request: HttpRequest<unknown>,
    next: HttpHandlerFn
) => {
    const dateUtils = inject(DateUtils);
    
    // Only transform POST and PUT requests
    if (request.method === 'POST' || request.method === 'PUT') {
        const transformedBody = transformDates(request.body, dateUtils);
        const transformedRequest = request.clone({ body: transformedBody });
        return next(transformedRequest);
    }
    
    return next(request);
};

function transformDates(obj: any, dateUtils: DateUtils): any {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => transformDates(item, dateUtils));
    }

    const transformed: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
        if (isDateField(key) && value) {
            // Transform date fields
            transformed[key] = dateUtils.formatDateForAPI(value as Date | string);
        } else if (typeof value === 'object' && value !== null) {
            // Recursively transform nested objects
            transformed[key] = transformDates(value, dateUtils);
        } else {
            // Keep other values as is
            transformed[key] = value;
        }
    }

    return transformed;
}

function isDateField(fieldName: string): boolean {
    const dateFields = [
        'dateOfBirth',
        'birthDate',
        'createdDate',
        'updatedDate',
        'startDate',
        'endDate',
        'dueDate',
        'expiryDate'
    ];
    
    return dateFields.some(dateField => 
        fieldName.toLowerCase().includes(dateField.toLowerCase())
    );
} 