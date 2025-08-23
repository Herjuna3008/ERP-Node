import React, { useState } from 'react';

const PurchaseForm = ({ onSubmit }) => {
  const [form, setForm] = useState({ product: '', quantity: 0, cost: 0 });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Product ID</label>
        <input name="product" value={form.product} onChange={handleChange} />
      </div>
      <div>
        <label>Quantity</label>
        <input name="quantity" type="number" value={form.quantity} onChange={handleChange} />
      </div>
      <div>
        <label>Cost</label>
        <input name="cost" type="number" value={form.cost} onChange={handleChange} />
      </div>
      <button type="submit">Save Purchase</button>
    </form>
  );
};

export default PurchaseForm;
