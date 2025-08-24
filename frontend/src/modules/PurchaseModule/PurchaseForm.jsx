import React, { useState } from 'react';

const emptyItem = { product: '', quantity: 0, cost: 0 };

const PurchaseForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    supplier: '',
    date: '',
    note: '',
    items: [emptyItem],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setForm((f) => {
      const items = f.items.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      );
      return { ...f, items };
    });
  };

  const addItem = () => {
    setForm((f) => ({ ...f, items: [...f.items, { ...emptyItem }] }));
  };

  const removeItem = (index) => {
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Supplier ID</label>
        <input name="supplier" value={form.supplier} onChange={handleChange} />
      </div>
      <div>
        <label>Date</label>
        <input type="date" name="date" value={form.date} onChange={handleChange} />
      </div>
      <div>
        <label>Notes</label>
        <textarea name="note" value={form.note} onChange={handleChange} />
      </div>
      <div>
        <h4>Items</h4>
        {form.items.map((item, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <input
              placeholder="Product ID"
              value={item.product}
              onChange={(e) => handleItemChange(index, 'product', e.target.value)}
            />
            <input
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
            />
            <input
              type="number"
              placeholder="Cost"
              value={item.cost}
              onChange={(e) => handleItemChange(index, 'cost', e.target.value)}
            />
            <button type="button" onClick={() => removeItem(index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addItem}>
          Add Item
        </button>
      </div>
      <button type="submit">Save Purchase</button>
    </form>
  );
};

export default PurchaseForm;
