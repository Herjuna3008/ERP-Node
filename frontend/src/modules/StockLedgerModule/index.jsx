import React, { useEffect, useState } from 'react';

const StockLedgerModule = () => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await fetch('/api/stock-ledger');
        const json = await res.json();
        if (json.success) {
          setEntries(json.result);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEntries();
  }, []);

  return (
    <div>
      <h2>Stock Ledger</h2>
      <ul>
        {entries.map((e) => (
          <li key={e.id}>
            Product {e.product} | Qty {e.quantity} | {e.type}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StockLedgerModule;
