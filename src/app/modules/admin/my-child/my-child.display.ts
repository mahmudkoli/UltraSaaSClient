// Shared display helpers for the student self-service detail pages.
// Keeps the numeric-enum → label/badge mapping in one place.

const ATTENDANCE_LABELS: Record<number, string> = {
    1: 'Present', 2: 'Absent', 3: 'Late', 4: 'Half Day',
    5: 'Excused', 6: 'Medical', 7: 'Holiday', 8: 'Weekend',
};

export function attendanceLabel(status: number): string {
    return ATTENDANCE_LABELS[status] ?? '—';
}

export function attendanceClass(status: number): string {
    switch (status) {
        case 1: return 'bg-emerald-100 text-emerald-800';            // Present
        case 3: case 4: return 'bg-amber-100 text-amber-800';        // Late / Half Day
        case 2: return 'bg-red-100 text-red-800';                    // Absent
        case 5: case 6: return 'bg-blue-100 text-blue-800';          // Excused / Medical
        default: return 'bg-gray-100 text-gray-800';                 // Holiday / Weekend
    }
}

const INVOICE_LABELS: Record<number, string> = {
    1: 'Pending', 2: 'Partial', 3: 'Paid', 4: 'Overdue',
    5: 'Cancelled', 6: 'Refunded', 7: 'Disputed', 8: 'On Hold',
};

export function invoiceStatusLabel(status: number): string {
    return INVOICE_LABELS[status] ?? '—';
}

export function invoiceStatusClass(status: number): string {
    switch (status) {
        case 3: return 'bg-emerald-100 text-emerald-800';   // Paid
        case 2: return 'bg-blue-100 text-blue-800';         // Partial
        case 1: return 'bg-amber-100 text-amber-800';       // Pending
        case 4: case 7: return 'bg-red-100 text-red-800';   // Overdue / Disputed
        default: return 'bg-gray-100 text-gray-800';        // Cancelled / Refunded / OnHold
    }
}

const EVENT_LABELS: Record<number, string> = {
    1: 'Academic', 2: 'Holiday', 3: 'Exam', 4: 'Meeting', 5: 'Orientation',
    6: 'Graduation', 7: 'Award', 9: 'Sports', 10: 'Cultural', 11: 'Parent Meeting',
    12: 'Field Trip', 13: 'Annual Day', 14: 'Sports Day',
};

export function eventTypeLabel(type: number): string {
    return EVENT_LABELS[type] ?? 'Event';
}

export function gradeClass(grade?: string): string {
    if (!grade) return 'bg-gray-100 text-gray-800';
    const g = grade.toUpperCase();
    if (g.startsWith('A')) return 'bg-emerald-100 text-emerald-800';
    if (g.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (g.startsWith('C')) return 'bg-amber-100 text-amber-800';
    if (g.startsWith('D')) return 'bg-orange-100 text-orange-800';
    if (g === 'ABS') return 'bg-gray-200 text-gray-700';
    return 'bg-red-100 text-red-800';
}

/** BDT money format — Arabic numerals, per project currency convention. */
export function money(v: number | null | undefined): string {
    const n = Number(v ?? 0);
    return 'BDT ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
