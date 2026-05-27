# invoice-next-rdf

Web frontend for the file-based invoice management system. It provides a form-driven UI for creating, editing, and rendering invoices and offers — backed by the [`invoice-next-server`](https://git.gra.one/business/invoice-server) GraphQL API. No database; all data lives as YAML files on the server.

---

## Concept

- **No database, no backend state.** The frontend talks to a GraphQL server that reads and writes plain YAML files. The "database" is the filesystem.
- **Form-driven editing via JSON Forms.** Invoice structure is defined by a JSON Schema; the UI is rendered automatically by `@jsonforms` with Material UI renderers. Schema changes propagate to the form with no manual UI work.
- **GraphQL + code generation.** All API calls are typed. GraphQL queries/mutations are co-located with components; TypeScript types and React Query hooks are generated from them via `graphql-codegen`.
- **Internationalised (i18n).** UI strings are managed with `next-intl` (German and English included).
- **Optional authentication.** Keycloak OIDC integration via `react-oidc-context`. Can be disabled entirely for local or Electron use.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI components | MUI Joy + MUI Material v7 |
| Form engine | JSON Forms (`@jsonforms/react`) |
| Data grid | Inovua ReactDataGrid |
| GraphQL client | React Query + generated typed hooks |
| Type generation | `graphql-codegen` |
| i18n | `next-intl` |
| Authentication | `react-oidc-context` / Keycloak OIDC |
| Date handling | Day.js / Moment |
| Full-text search | FlexSearch (client-side index) |

---

## Directory Layout

```
app/
  [locale]/           # Locale-scoped Next.js routes
    invoice/          # Single-invoice view
    invoiceCreate/    # New invoice form
    invoices/         # Invoice list

components/
  auth/               # OIDC context, login gate, profile dropdown
  datagrid/           # Declarative data-grid wrapper
  invoice/            # Invoice form, list, navigation tree, GraphQL queries
    invoice.json            # JSON Schema defining the Invoice data model
    invoiceUISchema.ts      # JSON Forms UI layout overrides
    invoiceRefSchemas.ts    # Referenced sub-schemas
    *.graphql               # Co-located GraphQL operations
  layout/             # App shell (navigation, sidebar)
  pages/              # Page-level components (InvoicePage, InvoicesPage, …)
  search/             # Client-side full-text invoice search
  theme/              # MUI theme
  util/               # Shared helpers (calculate-invoice, normalize-invoice-taxes, …)
  generated/          # Auto-generated GraphQL types and React Query hooks
    graphql.tsx
    fetcher.ts

messages/
  de.json             # German UI strings
  en.json             # English UI strings
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A running `invoice-next-server` instance (see [its README](https://git.gra.one/business/invoice-server))

### Install & run

```bash
yarn install
yarn dev        # http://localhost:3000
```

### Environment

Create `.env.local`:

```env
# GraphQL endpoint
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql

# Static file base URL (rendered PDFs)
NEXT_PUBLIC_STATIC_URL=http://localhost:3001/static

# Authentication (set to false to disable)
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_AUTH_AUTHORITY=http://localhost:8080/realms/invoice-management
NEXT_PUBLIC_AUTH_CLIENT_ID=invoice-frontend
NEXT_PUBLIC_AUTH_REDIRECT_PATH=/
```

Set `NEXT_PUBLIC_AUTH_ENABLED=false` for local development without Keycloak.

---

## GraphQL Code Generation

Typed React Query hooks are generated from the `.graphql` files alongside each component:

```bash
yarn codegen
```

This reads `codegen.yml`, introspects the server schema, and writes output to `components/generated/graphql.tsx`. Re-run whenever you add or change GraphQL operations or the server schema changes.

---

## Invoice Form

The invoice editing form is driven entirely by the JSON Schema at `components/invoice/invoice.json`. It covers:

- Seller and buyer details (name, address, bank, tax ID)
- Line items (`tradeItems`) with per-item VAT configuration
- Discounts (percentage-based)
- Sconto (early-payment discount terms)
- Offer-specific fields (`offerRef`, `validUntil`)

The UI layout is defined in `components/invoice/invoiceUISchema.ts` using JSON Forms' UI schema format, with custom renderers for trade-item tables and optional-object controls.

Amounts are **never calculated in the frontend** — the server performs all calculations on save/render and returns a `CalculatedInvoice` with pre-formatted strings for display and ZUGFeRD export.

---

## Authentication

Authentication is handled by `react-oidc-context` wrapping the app in an OIDC provider. When enabled:

- Unauthenticated users are redirected to Keycloak login.
- The access token is forwarded in the `Authorization` header of every GraphQL request.
- A profile dropdown in the navigation allows logout.

See the server's [`docker/README.md`](https://git.gra.one/business/invoice-server) for Keycloak setup.

---

## Build

```bash
yarn build
yarn start
```

---

## License

GPLv3
