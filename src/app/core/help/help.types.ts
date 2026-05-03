/**
 * In-app help / FAQ system. Bilingual (EN + BN — Bangladesh-first launch).
 *
 * Storage decision: static TypeScript registry shipped with the frontend
 * bundle (no backend table for MVP). Editing requires a code release —
 * acceptable while the FAQ set is small. Migrate to a backend admin if
 * non-engineers need to edit live.
 *
 * Translation note: the BN text is drafted in this repo. It should be
 * reviewed by a native Bangla speaker before public launch — machine-
 * quality Bangla reads awkwardly to native readers. The EN copy is the
 * canonical source; treat BN as a translation.
 */
export type Language = 'en' | 'bn';

export interface LocalizedText {
    en: string;
    /** Bangla translation. Mark items still pending native review with a `[draft]` prefix in the BN string. */
    bn: string;
}

export interface HelpQuestion {
    q: LocalizedText;
    a: LocalizedText;
}

export interface HelpFeature {
    id: string;
    /**
     * Route prefix that activates this feature in the help drawer when the user
     * is on it. Matched with `startsWith` against `Router.url`. Leave empty for
     * cross-cutting topics (e.g. "language switching") that aren't tied to a route.
     */
    routePrefix?: string;
    icon: string;
    title: LocalizedText;
    summary: LocalizedText;
    questions: HelpQuestion[];
}
