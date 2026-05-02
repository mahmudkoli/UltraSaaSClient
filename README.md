# UltraPOS — Frontend

Angular 17 SPA backing **UltraPOS**, a multi-vertical Point-of-Sale SaaS for electronics, pharmacy, supermarket, and generic retail.

> **Two products on one repo.** This repo's `develop-v2` branch ships UltraPOS. The `develop-v1` branch ships **UltraEdu** (educational institution management — frozen). Cross-branch fixes are cherry-picked, not merged. Backend lives at [UltraSaaS](https://github.com/mahmudkoli/UltraSaaS).

---

## Documentation

The full product / ops / customer documentation lives one directory up at `../docs/` (sibling of this repo, not in git). If you cloned this repo standalone you'll need the docs separately.

| Audience | Doc |
|---|---|
| Technical buyer / integration partner | [`PROJECT.md`](../docs/PROJECT.md) — one-page architecture overview |
| What's built | [`FEATURES.md`](../docs/FEATURES.md) — capability matrix |
| What's been shipped? | [`PROGRESS.md`](../docs/PROGRESS.md) — chronological dev journal |
| What's left to launch? | [`GOLIVE.md`](../docs/GOLIVE.md) — launch tracker, risks, decisions |
| Operations / on-call | [`RUNBOOK.md`](../docs/RUNBOOK.md) — 12 incident playbooks |
| Support staff | [`Support-Response-Templates.md`](../docs/Support-Response-Templates.md) · [`Manual-Onboarding-Playbook.md`](../docs/Manual-Onboarding-Playbook.md) |
| End users | [`customer-docs/`](../docs/customer-docs/) — getting started · POS cashier · returns |
| Sales | [`UltraPOS_Sales_Brochure.md`](../docs/UltraPOS_Sales_Brochure.md) |
| DB schema | [`ERD.md`](../docs/ERD.md) |

The repo root has a [top-level README](../README.md) that indexes all of the above.

---

## Stack

- **Angular 17** standalone components
- **Fuse** admin template + **Angular Material** + **TailwindCSS**
- **Transloco** i18n
- **ApexCharts** for visualizations
- Custom signal-based state services (per memory: signal-based reactivity is intentional — see existing `CurrentOutletService` / `PermissionsService` / `FeaturesService` / `TenantInfoService` patterns)

---

## Run

```bash
npm install
npm start                                   # dev server on localhost:4200
npm run build                               # production bundle in dist/
npm run lint
npx playwright test                         # E2E suite (currently 58/58 green)
npx playwright test --ui                    # E2E with UI for debugging
```

The dev server proxies API calls to the backend per `proxy.conf.js`. Run the [UltraSaaS](https://github.com/mahmudkoli/UltraSaaS) backend locally first, or point the proxy at a deployed instance.

## Demo tenants

Seeded automatically by the backend — one per BusinessType:

| Tenant | Vertical | Email |
|---|---|---|
| `electroplus` | Electronics | `electroplus.admin@root.com` |
| `mediplus` | Pharmacy | `mediplus.admin@root.com` |
| `freshmart` | Supermarket | `freshmart.admin@root.com` |
| `compumart` | Generic | `compumart.admin@root.com` |
| `root` | Platform admin | `admin@root.com` |

Default password (demo only): `123Pa$$word!`

In production, the seed-password force-rotation flow (Phase 2.21b) gates real admin users: they're routed to Change Password on first sign-in via the `must_change_password` JWT claim and a banner. Demo tenants stay permissive — gated on `IHostEnvironment.IsProduction()`.

---

## Repository structure

```
UltraSaaSClient/
├── src/app/
│   ├── core/                  # Auth, services, types per backend module
│   ├── modules/
│   │   ├── admin/             # Admin pages (users, tenant, outlet, catalog, inventory, ...)
│   │   ├── auth/              # Sign in / forgot password / reset password
│   │   └── ...
│   ├── layout/                # Fuse layout components (classy, modern, ...)
│   └── shared/                # Reusable components
├── tests/                     # Playwright E2E specs
├── proxy.conf.js              # Dev proxy → backend
└── angular.json
```

## Build

`ng build` for a production bundle. Artifacts land in `dist/`. Environment configs in `src/environments/` — `environment.ts` (dev), `environment.demo.ts`, `environment.prod.ts`.

---

## License

Proprietary. Built on the [Fuse Angular Admin Template](https://themeforest.net/item/fuse-angularjs-material-design-admin-template/12931855) — license owned per Themeforest terms.
