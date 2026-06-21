// Server-authoritative document numbering (HANDOVER bug I).
//
// The counter lives in `settings.settingValue` (settingKey = `last_<doc>_number`) and holds the
// LAST issued number. The next number is computed under a pessimistic row lock so two concurrent
// creates can never be handed the same number, replacing the old non-atomic read-modify-write in
// `increaseBySettingKey` and the frontend-supplied (stale, collision-prone) value.
//
//   nextNumber = max(counter, MAX(live number)) + 1
//
// The `MAX(live number)` term self-heals if the counter ever drifts behind real data — e.g. legacy
// rows, or converted invoices that historically reused the quote number and bypassed the counter.
// Only LIVE (non-removed) rows are considered: a soft-deleted document's number is not in use
// anywhere else in the app, so the self-heal must not let stray/junk deleted rows poison the live
// sequence. "Never reuse a number" for the normal flow is already guaranteed by the counter, which
// is monotonic and bumped on every create.
//
// Must be called inside a transaction; pass the transaction's `manager` so the counter bump and
// the document insert commit together (a rollback leaves no gap, a commit holds the lock until the
// number is safely persisted).
async function assignNextNumber({ manager, settingKey, tableName, numberColumn = 'number' }) {
  if (!manager) {
    throw new Error('assignNextNumber requires a transactional manager');
  }
  if (!settingKey || !tableName) {
    throw new Error('assignNextNumber requires settingKey and tableName');
  }

  const settingRepo = manager.getRepository('Setting');
  const setting = await settingRepo.findOne({
    where: { settingKey },
    lock: { mode: 'pessimistic_write' },
  });

  const counter = Number(setting?.settingValue) || 0;

  const rows = await manager.query(
    `SELECT MAX(\`${numberColumn}\`) AS maxNumber FROM \`${tableName}\` WHERE \`removed\` = 0`
  );
  const maxExisting = Number(rows?.[0]?.maxNumber) || 0;

  const nextNumber = Math.max(counter, maxExisting) + 1;

  if (setting) {
    setting.settingValue = nextNumber;
    await settingRepo.save(setting);
  }

  return nextNumber;
}

module.exports = { assignNextNumber };
