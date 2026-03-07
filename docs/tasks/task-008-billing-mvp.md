# Task 008 - Billing MVP

## Scope Delivered

1. Billing API with invoice draft generation from billable `time_entries` + `expenses`.
2. Invoice endpoints for list, detail and predictable PDF draft export.
3. Matter detail UI now includes a "Faturação" tab for generating and listing drafts.
4. Dashboard billing view for cross-matter draft visibility.

## Public Interfaces

- `POST /api/v1/invoices/draft`
  - Input:
    - `matter_id` (required)
    - `vat_rate` (optional, default `23`)
    - `due_date` (optional)
    - `notes` (optional)
  - Output:
    - invoice object + `breakdown` (`fees_subtotal`, `expenses_subtotal`, `vat_amount`)
- `GET /api/v1/invoices`
  - Query filters: `matter_id`, `client_id`, `status`
- `GET /api/v1/invoices/:id`
- `GET /api/v1/invoices/:id/pdf`
  - Predictable response: `filename`, `mime_type`, `content_base64`, `preview`

## Calculation Rules

1. Fees subtotal = sum of `(hours * rate_per_hour)` for billable and not yet invoiced entries.
2. Expenses subtotal = sum of billable and not yet invoiced expenses.
3. VAT amount = round(subtotal * vat_rate / 100, 2).
4. Total = round(subtotal + VAT, 2).
5. All consumed entries/expenses are linked via `invoiceId` to ensure idempotent draft generation.

## MVP Limitations

1. PDF export is deterministic draft payload (base64 content), not qualified legal invoice output.
2. No AT integration in this phase.
3. Invoice status lifecycle remains draft-centric.
