/**
 * Module-to-feature mapping for the entitlement-gated navigation.
 *
 * Each entry binds a nav group `id` (in `mock-api/common/navigation/data.ts`) to
 * an optional feature code that the current tenant's `SubscriptionPlan.FeatureFlagsJson`
 * must contain. Groups without a `requiresFeature` are core and always visible.
 *
 * Keep the codes in sync with the BE `FSHFeatures` static class. Renaming a code
 * is a breaking change to any plan that already stores it.
 *
 *   Root admin's lever: assign a tenant to a plan whose FeatureFlagsJson includes
 *   the module codes that tenant should see. The nav filter and the BE
 *   `[RequireTenantFeature]` attribute both honour the same source.
 */
export interface ModuleGate {
    /** Nav group id (must match a top-level `id` in `defaultNavigation`). */
    id: string;
    /** Feature code required on the tenant's plan, or null = always visible. */
    requiresFeature: string | null;
}

export const MODULE_GATES: ModuleGate[] = [
    // Always-on baseline modules (every plan includes these for v1).
    { id: 'my-profile',           requiresFeature: null },
    { id: 'analytics',            requiresFeature: null },
    { id: 'academic-management',  requiresFeature: null },
    { id: 'records-management',   requiresFeature: null },
    { id: 'finance-management',   requiresFeature: null },
    { id: 'system-management',    requiresFeature: null },

    // Module blocks that can be turned off per plan. Codes match
    // `FSHFeatures.Module*` on the BE.
    { id: 'hr-management',        requiresFeature: 'MODULE_HR' },
    { id: 'library-management',   requiresFeature: 'MODULE_LIBRARY' },
    { id: 'hostel-management',    requiresFeature: 'MODULE_HOSTELS' },
    { id: 'transport-management', requiresFeature: 'MODULE_TRANSPORT' },
    { id: 'communication',        requiresFeature: 'MODULE_COMMUNICATION' },
];

/**
 * Returns the set of feature codes enabled on the tenant by parsing the plan's
 * `FeatureFlagsJson`. Tolerant of malformed JSON — falls back to empty (= no
 * optional modules visible).
 */
export function parseFeatureFlags(featureFlagsJson: string | null | undefined): Set<string> {
    if (!featureFlagsJson) return new Set();
    try {
        const arr = JSON.parse(featureFlagsJson);
        return Array.isArray(arr) ? new Set(arr.map(String)) : new Set();
    } catch {
        return new Set();
    }
}

/** True if a nav group should be visible for a tenant with the given features. */
export function isModuleVisible(navId: string, enabledFeatures: Set<string>): boolean {
    const gate = MODULE_GATES.find(g => g.id === navId);
    if (!gate || !gate.requiresFeature) return true;
    return enabledFeatures.has(gate.requiresFeature);
}

/**
 * Permission required to see a given nav item, keyed by the item `id` in
 * `mock-api/common/navigation/data.ts`. Each value is the BE permission string
 * (`Permissions.<Resource>.<Action>`) that gates the page's primary read
 * endpoint — taken from that controller's `[MustHavePermission(...)]`.
 *
 * Rule: every ADMIN leaf must appear here. Items intentionally ABSENT are
 * self-service (e.g. `my-profile`) and stay visible to everyone. A student
 * (empty permission set) therefore sees only the absent/self-service items.
 *
 * Keep in sync with `src/app/app.routes.ts` `data.permission` and the BE
 * `FSHResource` / controller attributes.
 */
export const NAV_PERMISSIONS: Record<string, string> = {
    // Top-level
    'analytics':                     'Permissions.Dashboard.View',

    // Academic Management
    'user-management':               'Permissions.Users.View',
    'student-management':            'Permissions.Students.View',
    'teacher-management':            'Permissions.Teachers.View',
    'academic-year-management':      'Permissions.AcademicYears.View',
    'class-management':              'Permissions.Classes.View',
    'subject-management':            'Permissions.Subjects.View',
    'student-class-management':      'Permissions.Students.View',
    'class-subject-management':      'Permissions.ClassSubjects.View',
    'grade-bands':                   'Permissions.GradeBands.View',

    // Records Management
    'student-academics':             'Permissions.Students.View',
    'student-health':                'Permissions.Students.View',
    'teacher-qualifications':        'Permissions.Teachers.View',
    'attendance-management':         'Permissions.Attendances.View',
    'exam-management':               'Permissions.Exams.View',
    'exam-result-management':        'Permissions.ExamResults.View',
    'timetable':                     'Permissions.TimetableEntries.View',

    // HR
    'leaves':                        'Permissions.Leaves.Search',
    'payroll':                       'Permissions.PayrollSlips.View',

    // Finance
    'fee-type-management':           'Permissions.FeeTypes.View',
    'fee-structure-management':      'Permissions.FeeStructures.View',
    'fee-structure-detail-management':'Permissions.FeeStructureDetails.View',
    'fee-invoice-management':        'Permissions.FeeInvoices.View',
    'fee-reports':                   'Permissions.FeeInvoices.View',
    'reports':                       'Permissions.Students.View',
    'sibling-discount-policy':       'Permissions.SiblingDiscountPolicy.View',

    // Library
    'library-books':                 'Permissions.Books.View',
    'library-issues':                'Permissions.BookIssues.View',

    // Hostels
    'hostels':                       'Permissions.Hostels.View',
    'hostel-allocations':            'Permissions.StudentHostels.View',

    // Transport
    'transport-routes':              'Permissions.Routes.View',
    'transport-vehicles':            'Permissions.Vehicles.View',
    'transport-assignments':         'Permissions.StudentTransports.View',

    // Communication
    'events':                        'Permissions.Events.View',
    'announcement-archive':          'Permissions.Tenants.View',
    'broadcast':                     'Permissions.Tenants.Update',
    'sms-templates':                 'Permissions.SMSTemplates.View',
    'mail-templates':                'Permissions.MailTemplates.View',
    'sms-logs':                      'Permissions.SMSLog.Search',
    'mail-logs':                     'Permissions.MailLog.Search',
    'comms-config':                  'Permissions.SMSConfig.View',

    // System Management
    'admin-dashboard':               'Permissions.Tenants.View',
    'audit-trail':                   'Permissions.AuditTrails.View',
    'tenant-management':             'Permissions.Tenants.View',
    'institute-management':          'Permissions.Institutes.View',
    'subscription-plans':            'Permissions.Tenants.View',
    'my-subscription':               'Permissions.Subscription.View',
};

/**
 * True if a nav item is visible for a user holding `userPermissions`.
 * Items NOT in `NAV_PERMISSIONS` are self-service and always visible.
 */
export function hasNavPermission(navId: string, userPermissions: Set<string>): boolean {
    const required = NAV_PERMISSIONS[navId];
    return !required || userPermissions.has(required);
}
