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
