import React, { useState } from 'react';

const PayrollForm = ({ onSubmit }) => {
  const [form, setForm] = useState({ employee: '', amount: 0, description: '' });

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
        <label>Employee ID</label>
        <input name="employee" value={form.employee} onChange={handleChange} />
      </div>
      <div>
        <label>Amount</label>
        <input name="amount" type="number" value={form.amount} onChange={handleChange} />
      </div>
      <div>
        <label>Description</label>
        <input name="description" value={form.description} onChange={handleChange} />
      </div>
      <button type="submit">Save Payroll</button>
    </form>
  );
};

export default PayrollForm;
