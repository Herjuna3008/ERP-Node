# ERP-Node

## Invoice reminder schedule

The backend now includes a cron job (`backend/src/cron/reminder.js`) that
checks for invoices with a `paymentStatus` of **UNPAID** or **PARTIAL** and a
due date that has passed.  A summary email is sent using `nodemailer`.

### Configuration

Set the following environment variables in `backend/.env` (or your preferred
config) to control the schedule and mail transport:

| variable | description | default |
| --- | --- | --- |
| `REMINDER_CRON` | Cron expression for when the job runs | `0 9 * * *` (every day at 09:00) |
| `SMTP_HOST` | SMTP server host | | 
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_SECURE` | Use TLS/SSL (`true`/`false`) | `false` |
| `SMTP_USER` | SMTP username | |
| `SMTP_PASS` | SMTP password | |
| `REMINDER_EMAIL_FROM` | From address used in reminder email | |
| `REMINDER_EMAIL_TO` | Recipient address for reminder email | |

The job is loaded when the backend server starts. Update `REMINDER_CRON` to
match your deployment's schedule (e.g. `0 8 * * 1-5` for weekdays at 08:00).
