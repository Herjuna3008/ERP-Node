const stockLedgerService = require('@/services/stockLedgerService');

const list = async (req, res) => {
  const { product, sourceType, entryType } = req.query;
  const result = await stockLedgerService.listEntries({ product, sourceType, entryType });
  return res.status(200).json({ success: true, result, message: 'Stock ledger entries loaded' });
};

const read = async (req, res) => {
  const entry = await stockLedgerService.getEntry(req.params.id);
  if (!entry) {
    return res.status(404).json({ success: false, result: null, message: 'Stock ledger entry not found' });
  }
  return res.status(200).json({ success: true, result: entry, message: 'Stock ledger entry loaded' });
};

const create = async (req, res) => {
  const payload = { ...req.body };
  if (!payload.sourceType) {
    payload.sourceType = stockLedgerService.SOURCE_TYPES.ADJUSTMENT;
  }
  if (!payload.sourceId) {
    payload.sourceId = Date.now();
  }
  const entry = await stockLedgerService.recordEntry(payload);
  return res.status(200).json({ success: true, result: entry, message: 'Stock ledger entry created' });
};

const update = async (req, res) => {
  const existing = await stockLedgerService.getEntry(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, result: null, message: 'Stock ledger entry not found' });
  }
  await stockLedgerService.removeEntry(existing.id);
  const recreated = await stockLedgerService.recordEntry({
    ...req.body,
    sourceType: existing.sourceType,
    sourceId: existing.sourceId,
    sourceItemId: existing.sourceItemId,
  });
  return res.status(200).json({ success: true, result: recreated, message: 'Stock ledger entry updated' });
};

const remove = async (req, res) => {
  const entry = await stockLedgerService.removeEntry(req.params.id);
  if (!entry) {
    return res.status(404).json({ success: false, result: null, message: 'Stock ledger entry not found' });
  }
  return res.status(200).json({ success: true, result: entry, message: 'Stock ledger entry removed' });
};

module.exports = {
  list,
  listAll: list,
  filter: list,
  search: list,
  create,
  read,
  update,
  delete: remove,
  summary: list,
};
