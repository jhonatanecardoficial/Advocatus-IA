# Task 009 - Deadline Notifications MVP

## Scope Delivered

1. Deadline notification module for tasks due in D-7 and D-1 windows.
2. Manual execution endpoint for scheduler (`run`) and manual test endpoint (`test`).
3. Audit trail for success/failure/idempotency using `audit_logs`.
4. Safe email delivery path:
   - uses Resend when configured,
   - dry-run success mode when `RESEND_API_KEY` is not configured.

## Public Interfaces

- `POST /api/v1/notifications/deadlines/run`
  - Runs deadline sweep for current tenant.
  - Returns summary: `processed`, `sent`, `skipped`, `failed`.
- `POST /api/v1/notifications/deadlines/test`
  - Input: `task_id`
  - Sends one test notification for that task.

## Retry and Idempotency Rules

1. Idempotency key is derived from `task_id + action + current_day`.
2. If audit log already exists for the same key/day, send is skipped.
3. Failed sends are logged with `*_FAILED` action and error payload.
4. D-1 successful notification marks `task.notificationSent = true`.

## Observability

1. Every run/test action emits `audit_logs` with payload:
   - `to`, `days_remaining`, `dry_run`, `message_id`, `error`.
2. Summary counters returned by API can be used by cron/ops tooling.
