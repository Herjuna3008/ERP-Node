import React, { useState } from 'react';

const ExpenseForm = ({ onSubmit }) => {
  const [form, setForm] = useState({ amount: 0, description: '' });

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
        <label>Amount</label>
        <input name="amount" type="number" value={form.amount} onChange={handleChange} />
      </div>
      <div>
        <label>Description</label>
        <input name="description" value={form.description} onChange={handleChange} />
      </div>
      <button type="submit">Save Expense</button>
    </form>
  );
};

export default ExpenseForm;
