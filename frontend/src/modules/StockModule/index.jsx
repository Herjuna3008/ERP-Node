import React, { useEffect, useState } from 'react';
import LowStockAlert from './LowStockAlert';
import StockAdjustmentForm from './StockAdjustmentForm';

const StockModule = () => {
  const [lowStocks, setLowStocks] = useState([]);

  useEffect(() => {
    const fetchLowStocks = async () => {
      try {
        const res = await fetch('/api/stocks/low');
        const json = await res.json();
        if (json.success) {
          setLowStocks(json.result);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchLowStocks();
  }, []);

  const handleAdjust = async (data) => {
    try {
      await fetch('/api/stocks/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: data.product,
          quantity: Number(data.quantity),
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <LowStockAlert items={lowStocks} />
      <StockAdjustmentForm onSubmit={handleAdjust} />
    </div>
  );
};

export default StockModule;
