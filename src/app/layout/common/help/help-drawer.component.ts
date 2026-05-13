import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { HelpService } from 'app/core/help/help.service';
import { HelpFeature, HelpQuestion, Language } from 'app/core/help/help.types';

interface SearchResult {
    feature: HelpFeature;
    questions: HelpQuestion[];
    /** Higher = more relevant. Active-feature match gets a big bonus so it ranks first. */
    score: number;
}

/**
 * Right-side slide-in help panel. Mounted once at the layout level so it sits
 * on top of every page. Renders the HelpService's current state:
 *  - language toggle (EN | বাংলা)
 *  - the active feature's questions auto-expanded first
 *  - a list of all other features as collapsible cards
 *
 * Storage / dependencies: pure CSS transform for the slide-in (no @fuse/drawer
 * dependency), Material expansion panels for the per-feature accordion.
 */
@Component({
    selector: 'help-drawer',
    standalone: true,
    imports: [
        CommonModule, FormsModule, MatButtonModule, MatExpansionModule, MatIconModule, MatRippleModule,
    ],
    template: `
        <!-- Backdrop -->
        @if (help.open()) {
            <div class="help-backdrop" (click)="help.close()" aria-hidden="true"></div>
        }

        <!-- Panel -->
        <aside class="help-panel print:hidden" [class.open]="help.open()" role="complementary" aria-label="Help">
            <header class="help-head">
                <div class="flex items-center gap-2">
                    <mat-icon class="text-indigo-600">help_outline</mat-icon>
                    <h2 class="text-lg font-semibold">{{ headerTitle() }}</h2>
                </div>
                <div class="flex items-center gap-1">
                    <button class="lang-pill" [class.active]="lang() === 'en'" (click)="setLang('en')">EN</button>
                    <button class="lang-pill" [class.active]="lang() === 'bn'" (click)="setLang('bn')" lang="bn">বাংলা</button>
                    <button mat-icon-button (click)="help.close()" aria-label="Close help">
                        <mat-icon>close</mat-icon>
                    </button>
                </div>
            </header>

            <div class="help-search">
                <mat-icon class="help-search-icon">search</mat-icon>
                <input type="text" class="help-search-input"
                       [ngModel]="query()"
                       (ngModelChange)="query.set($event)"
                       [placeholder]="lang() === 'bn' ? 'প্রশ্ন খুঁজুন…' : 'Search FAQs…'"
                       [attr.aria-label]="lang() === 'bn' ? 'প্রশ্ন খুঁজুন' : 'Search FAQs'">
                @if (query()) {
                    <button mat-icon-button class="help-search-clear" (click)="clearQuery()" [attr.aria-label]="lang() === 'bn' ? 'খুঁজা মুছুন' : 'Clear search'">
                        <mat-icon class="icon-size-4">close</mat-icon>
                    </button>
                }
            </div>

            <div class="help-body">
                @if (searchResults(); as results) {
                    @if (results.length === 0) {
                        <div class="empty-state">
                            <mat-icon class="text-gray-300 dark:text-gray-600 icon-size-12 mb-2">search_off</mat-icon>
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                {{ lang() === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No matches for' }}
                                "<span class="font-medium">{{ query() }}</span>"
                            </p>
                            <p class="text-xs text-gray-400 mt-1">
                                {{ lang() === 'bn' ? 'অন্য শব্দ দিয়ে চেষ্টা করুন' : 'Try a different keyword.' }}
                            </p>
                        </div>
                    } @else {
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            {{ lang() === 'bn'
                                ? results.length + 'টি বিষয়ে ফলাফল'
                                : results.length + ' topic' + (results.length === 1 ? '' : 's') + ' matched' }}
                        </p>
                        @for (r of results; track r.feature.id) {
                            <details class="feature-card" open>
                                <summary>
                                    <mat-icon class="icon-size-5" [svgIcon]="r.feature.icon"></mat-icon>
                                    <span class="font-medium" [innerHTML]="highlight(tr(r.feature.title))"></span>
                                    <span class="text-xs text-gray-500">{{ r.questions.length }}/{{ r.feature.questions.length }} Q</span>
                                </summary>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 mt-1" [innerHTML]="highlight(tr(r.feature.summary))"></p>
                                <mat-accordion class="!block" multi>
                                    @for (qa of r.questions; track $index) {
                                        <mat-expansion-panel class="!shadow-none !bg-transparent !border !border-gray-200 dark:!border-gray-700 !mb-1.5" [expanded]="true">
                                            <mat-expansion-panel-header class="!h-auto !py-2">
                                                <mat-panel-title class="!text-sm !font-medium" [innerHTML]="highlight(tr(qa.q))"></mat-panel-title>
                                            </mat-expansion-panel-header>
                                            <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line" [innerHTML]="highlight(tr(qa.a))"></p>
                                        </mat-expansion-panel>
                                    }
                                </mat-accordion>
                            </details>
                        }
                    }
                } @else {
                    @if (active(); as a) {
                        <section class="active-feature">
                            <div class="flex items-center gap-2 mb-1">
                                <mat-icon class="text-indigo-600 icon-size-5" [svgIcon]="a.icon"></mat-icon>
                                <h3 class="text-base font-semibold">{{ tr(a.title) }}</h3>
                                <span class="ml-auto text-[10px] uppercase tracking-wider text-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
                                    {{ lang() === 'bn' ? 'এই পেজ' : 'This page' }}
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ tr(a.summary) }}</p>
                            <mat-accordion class="!block" multi>
                                @for (qa of a.questions; track $index) {
                                    <mat-expansion-panel class="!shadow-none !bg-transparent !border !border-gray-200 dark:!border-gray-700 !mb-1.5">
                                        <mat-expansion-panel-header class="!h-auto !py-2">
                                            <mat-panel-title class="!text-sm !font-medium">{{ tr(qa.q) }}</mat-panel-title>
                                        </mat-expansion-panel-header>
                                        <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{{ tr(qa.a) }}</p>
                                    </mat-expansion-panel>
                                }
                            </mat-accordion>
                        </section>
                    }

                    <section class="all-features">
                        <h3 class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 mt-4">
                            {{ lang() === 'bn' ? 'সব বিষয়' : 'Browse all topics' }}
                        </h3>
                        @for (f of others(); track f.id) {
                            <details class="feature-card">
                                <summary>
                                    <mat-icon class="icon-size-5" [svgIcon]="f.icon"></mat-icon>
                                    <span class="font-medium">{{ tr(f.title) }}</span>
                                    <span class="text-xs text-gray-500">{{ f.questions.length }} Q</span>
                                </summary>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 mt-1">{{ tr(f.summary) }}</p>
                                <mat-accordion class="!block" multi>
                                    @for (qa of f.questions; track $index) {
                                        <mat-expansion-panel class="!shadow-none !bg-transparent !border !border-gray-200 dark:!border-gray-700 !mb-1.5">
                                            <mat-expansion-panel-header class="!h-auto !py-2">
                                                <mat-panel-title class="!text-sm !font-medium">{{ tr(qa.q) }}</mat-panel-title>
                                            </mat-expansion-panel-header>
                                            <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{{ tr(qa.a) }}</p>
                                        </mat-expansion-panel>
                                    }
                                </mat-accordion>
                            </details>
                        }
                    </section>

                    <p class="text-xs text-gray-400 mt-6 leading-relaxed">
                        {{ lang() === 'bn'
                            ? 'প্রশ্নের উত্তর পাননি? আপনার অ্যাডমিনের কাছে যোগাযোগ করুন বা সাপোর্ট চ্যানেলে লিখুন।'
                            : 'Did not find your answer? Ask your admin, or reach the support channel.' }}
                    </p>
                }
            </div>
        </aside>
    `,
    styles: [`
        :host { display: contents; }
        .help-backdrop {
            position: fixed; inset: 0; background: rgba(0,0,0,0.35);
            z-index: 60; backdrop-filter: blur(2px);
            animation: fade-in 150ms ease-out;
        }
        .help-panel {
            position: fixed; top: 0; right: 0; height: 100vh; width: 420px; max-width: 100vw;
            background: var(--fuse-bg-card, #fff); color: inherit;
            box-shadow: -8px 0 24px -4px rgba(0,0,0,0.18);
            transform: translateX(100%); transition: transform 220ms ease-out;
            z-index: 61; display: flex; flex-direction: column; overflow: hidden;
        }
        .help-panel.open { transform: translateX(0); }
        :host-context(.dark) .help-panel,
        .dark .help-panel { background: #1f2937; }
        .help-head {
            display: flex; align-items: center; justify-content: space-between;
            padding: 14px 16px; border-bottom: 1px solid rgba(0,0,0,0.08);
        }
        :host-context(.dark) .help-head,
        .dark .help-head { border-bottom-color: rgba(255,255,255,0.08); }
        .lang-pill {
            font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 9999px;
            border: 1px solid rgba(99,102,241,0.4); color: #4f46e5; background: transparent;
            cursor: pointer; line-height: 1; letter-spacing: 0.3px;
        }
        .lang-pill.active { background: #4f46e5; color: #fff; border-color: #4f46e5; }
        .help-body {
            flex: 1; overflow-y: auto; padding: 14px 16px;
        }
        .help-search {
            display: flex; align-items: center; gap: 6px;
            padding: 8px 12px; border-bottom: 1px solid rgba(0,0,0,0.08);
            background: rgba(99,102,241,0.04);
        }
        :host-context(.dark) .help-search,
        .dark .help-search {
            border-bottom-color: rgba(255,255,255,0.08);
            background: rgba(99,102,241,0.10);
        }
        .help-search-icon {
            color: #6b7280; flex: 0 0 auto;
            font-size: 18px; width: 18px; height: 18px; line-height: 18px;
        }
        .help-search-input {
            flex: 1 1 auto; min-width: 0;
            background: transparent; border: none; outline: none;
            font-size: 13px; color: inherit;
            padding: 6px 4px;
        }
        .help-search-input::placeholder { color: #9ca3af; }
        .help-search-clear { flex: 0 0 auto; }
        .empty-state {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            text-align: center; padding: 32px 16px;
        }
        :host ::ng-deep .help-mark {
            background: #fde68a; color: inherit;
            padding: 0 2px; border-radius: 2px;
        }
        :host-context(.dark) ::ng-deep .help-mark,
        .dark ::ng-deep .help-mark {
            background: rgba(252, 211, 77, 0.30);
        }
        .feature-card {
            border: 1px solid rgba(0,0,0,0.08); border-radius: 8px; padding: 8px 10px;
            margin-bottom: 8px; background: rgba(99,102,241,0.03);
        }
        :host-context(.dark) .feature-card,
        .dark .feature-card { border-color: rgba(255,255,255,0.08); background: rgba(99,102,241,0.06); }
        .feature-card summary {
            display: flex; align-items: center; gap: 8px; cursor: pointer; list-style: none; padding: 4px 0;
        }
        .feature-card summary::-webkit-details-marker { display: none; }
        .feature-card summary::before {
            content: '▸'; transition: transform 120ms ease; color: #6b7280; font-size: 12px;
        }
        .feature-card[open] summary::before { transform: rotate(90deg); }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @media (max-width: 600px) {
            .help-panel { width: 100vw; }
        }
    `],
})
export class HelpDrawerComponent {
    readonly help = inject(HelpService);

    /** Language signal piped through so the template doesn't reach into the service repeatedly. */
    readonly lang = computed(() => this.help.language());

    /** The feature matched to the current route. */
    readonly active = computed(() => this.help.activeFeature());

    /** Every feature except the active one — shown under "Browse all topics". */
    readonly others = computed(() => {
        const a = this.active();
        return this.help.features().filter(f => f.id !== a?.id);
    });

    /** Live search query — empty string means default browse mode (active + others). */
    readonly query = signal('');

    /**
     * Substring-ranked search over the FAQ. Null when the query is blank so the
     * template falls back to the default browse layout. Bilingual: matches in EN
     * and BN at the same time — no need to toggle language to search the other.
     */
    readonly searchResults = computed<SearchResult[] | null>(() => {
        const raw = this.query().trim().toLowerCase();
        if (!raw) return null;
        const tokens = raw.split(/\s+/).filter(Boolean);
        if (tokens.length === 0) return null;

        const activeId = this.active()?.id;
        const out: SearchResult[] = [];

        for (const f of this.help.features()) {
            const featureHay = (f.title.en + ' ' + f.title.bn + ' ' + f.summary.en + ' ' + f.summary.bn).toLowerCase();
            const featureHits = this.tokenHits(featureHay, tokens);

            const matchedQs: HelpQuestion[] = [];
            let qaHits = 0;
            for (const qa of f.questions) {
                const hay = (qa.q.en + ' ' + qa.q.bn + ' ' + qa.a.en + ' ' + qa.a.bn).toLowerCase();
                const hits = this.tokenHits(hay, tokens);
                if (hits > 0) {
                    matchedQs.push(qa);
                    qaHits += hits;
                }
            }

            // If the feature's title/summary itself matched, show all its Qs (operator
            // is looking at the feature broadly). Otherwise just the Qs that hit.
            const questions = featureHits > 0 ? f.questions : matchedQs;
            if (questions.length === 0) continue;

            const activeBonus = f.id === activeId ? 1000 : 0;
            out.push({ feature: f, questions, score: featureHits * 10 + qaHits + activeBonus });
        }

        return out.sort((a, b) => b.score - a.score);
    });

    headerTitle = computed(() =>
        this.lang() === 'bn' ? 'সাহায্য কেন্দ্র' : 'Help & FAQ',
    );

    tr(t: { en: string; bn: string }): string {
        return this.lang() === 'bn' ? t.bn : t.en;
    }

    /** Render-helper: escape HTML, then wrap matched tokens in <mark>. Bound via
     *  [innerHTML] — Angular's built-in sanitizer keeps <mark> through and strips
     *  anything else, so even tainted FAQ content can't inject script.
     */
    highlight(text: string): string {
        const escaped = this.escapeHtml(text);
        const raw = this.query().trim();
        if (!raw) return escaped;
        const tokens = raw.split(/\s+/).filter(Boolean);
        let html = escaped;
        for (const t of tokens) {
            const re = new RegExp(`(${this.escapeRegex(this.escapeHtml(t))})`, 'gi');
            html = html.replace(re, '<mark class="help-mark">$1</mark>');
        }
        return html;
    }

    setLang(l: Language): void { this.help.setLanguage(l); }

    clearQuery(): void { this.query.set(''); }

    private tokenHits(haystack: string, tokens: string[]): number {
        let n = 0;
        for (const t of tokens) if (haystack.includes(t)) n++;
        return n;
    }

    private escapeHtml(s: string): string {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    private escapeRegex(s: string): string {
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
