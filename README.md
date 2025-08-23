# ERP-Node

## Development Setup

### MySQL and Environment Variables
1. Install MySQL and create a database, for example `erp`.
2. Create `backend/.env` and provide connection details:

   ```ini
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=erp
   PORT=8888
   JWT_SECRET=your-secret
   ```

Common variables:

| variable | description | default |
| --- | --- | --- |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | Database user | `root` |
| `DB_PASSWORD` | Database password |  |
| `DB_NAME` | Database name | `erp` |
| `PORT` | Port for backend server | `8888` |
| `JWT_SECRET` | Secret for signing tokens | – |

### Migrations and Seeds
From the `backend` directory:

```bash
# create admin user and default settings
npm run setup

# optional: reset database
npm run reset

# seed lookup data
node src/seeds/seed.js
node src/seeds/masterDataSeed.ts   # requires ts-node
```

### Running in Development
Install dependencies in all packages and start both servers:

```bash
npm install            # installs root helper scripts
(cd backend && npm install)
(cd frontend && npm install)
npm run dev            # starts backend on PORT and Vite dev server
```

## Cron Reminder
The backend includes a cron job (`backend/src/cron/reminder.js`) that checks for invoices with `paymentStatus` **UNPAID** or **PARTIAL** and a due date that has passed. A summary email is sent using `nodemailer`.

Set the following environment variables in `backend/.env` to control the schedule and mail transport:

| variable | description | default |
| --- | --- | --- |
| `REMINDER_CRON` | Cron expression for when the job runs | `0 9 * * *` (every day at 09:00) |
| `SMTP_HOST` | SMTP server host |  |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_SECURE` | Use TLS/SSL (`true`/`false`) | `false` |
| `SMTP_USER` | SMTP username |  |
| `SMTP_PASS` | SMTP password |  |
| `REMINDER_EMAIL_FROM` | From address used in reminder email |  |
| `REMINDER_EMAIL_TO` | Recipient address for reminder email |  |

The job is loaded when the backend server starts. Update `REMINDER_CRON` to match your deployment schedule. On cPanel you can create a Cron Job that runs the backend start script to keep the reminder task active.

## PDF/Excel Export
Reports can be exported by calling the API with a `format` query string. For example:

```
GET /api/reports/summary?format=pdf   # generate a PDF
GET /api/reports/summary?format=excel # generate an Excel workbook
```

Internally `html-pdf` is used for PDF output and `exceljs` for Excel files. Ensure these dependencies are installed on the server.

## Deployment on Shared Hosting/cPanel
1. **Frontend**
   - `cd frontend && npm run build`
   - Upload the contents of `frontend/dist` to your `public_html` folder.

2. **Backend**
   - Upload the `backend` folder.
   - Run `npm install`.
   - Create `.env` with the variables shown above.
   - Start the app with `node src/server.js` or use a process manager such as `pm2` through the cPanel Terminal.

3. **Cron Reminder**
   - Configure environment variables and keep the backend process running, or use cPanel's Cron Jobs to execute `node backend/src/cron/reminder.js` on your preferred schedule.

4. **Database**
   - Ensure MySQL credentials in `.env` point to the hosting account's database.

After deployment, the application will serve the API and generated PDFs/Excels, and the cron reminder will send scheduled emails.

