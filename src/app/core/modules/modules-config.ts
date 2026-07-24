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

// HRM tiering (BRD §12). Core HR (employees / org-config / attendance / leave /
// ESS / communication) is baseline — always visible. The tier differentiators
// are gated at the LEAF level because payroll + reports leaves live INSIDE the
// otherwise-core `hr-management` / `system-management` groups. `isModuleVisible`
// is evaluated per-item during the recursive nav filter, so leaf ids gate fine.
export const MODULE_GATES: ModuleGate[] = [
    // Always-on baseline groups (every plan includes these).
    { id: 'my-profile',           requiresFeature: null },
    { id: 'analytics',            requiresFeature: null },
    { id: 'self-service',         requiresFeature: null },
    { id: 'hr-management',        requiresFeature: null },
    { id: 'communication',        requiresFeature: null },
    { id: 'system-management',    requiresFeature: null },

    // Pro+ : Payroll (payslips + runs in HR; salary/statutory config in System).
    { id: 'payroll',              requiresFeature: 'MODULE_PAYROLL' },
    { id: 'payroll-runs',         requiresFeature: 'MODULE_PAYROLL' },
    { id: 'salary-structures',    requiresFeature: 'MODULE_PAYROLL' },
    { id: 'statutory-config',     requiresFeature: 'MODULE_PAYROLL' },

    // Pro+ : Reports (headcount / attendance / payroll registers).
    { id: 'reports',              requiresFeature: 'MODULE_REPORTS' },
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

    // HR
    'employee-management':           'Permissions.Employees.View',
    'employee-qualifications':       'Permissions.Employees.View',
    'org-chart':                     'Permissions.Employees.View',
    'attendances':                   'Permissions.Attendances.View',
    'attendance-summary':            'Permissions.Attendances.View',
    'leaves':                        'Permissions.Leaves.Search',
    'leave-balances':                'Permissions.LeaveBalances.View',
    'payroll':                       'Permissions.PayrollSlips.View',
    'payroll-runs':                  'Permissions.PayrollRuns.View',

    // Communication
    'announcement-archive':          'Permissions.Tenants.View',
    'sms-templates':                 'Permissions.SMSTemplates.View',
    'mail-templates':                'Permissions.MailTemplates.View',
    'sms-logs':                      'Permissions.SMSLog.Search',
    'mail-logs':                     'Permissions.MailLog.Search',
    'comms-config':                  'Permissions.SMSConfig.View',

    // Org config (HRM S1.2)
    'departments':                   'Permissions.Departments.View',
    'designations':                  'Permissions.Designations.View',
    'locations':                     'Permissions.Locations.View',
    'cost-centres':                  'Permissions.CostCentres.View',
    'leave-types':                   'Permissions.LeaveTypes.View',
    'salary-structures':             'Permissions.SalaryStructures.View',
    'statutory-config':              'Permissions.StatutoryConfig.View',

    // System Management
    'user-management':               'Permissions.Users.View',
    'admin-dashboard':               'Permissions.Tenants.View',
    'reports':                       'Permissions.Employees.View',
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
