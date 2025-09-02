import React, { useEffect, useState, useCallback } from 'react';
import LowStockAlert from './LowStockAlert';
import StockAdjustmentForm from './StockAdjustmentForm';

const StockModule = () => {
  const [lowStocks, setLowStocks] = useState([]);

  const fetchLowStocks = useCallback(async () => {
    try {
      const res = await fetch('/api/stocks/low');
      const json = await res.json();
      if (json.success) {
        setLowStocks(json.result);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchLowStocks();
  }, [fetchLowStocks]);

  useEffect(() => {
    window.addEventListener('stockUpdate', fetchLowStocks);
    return () => window.removeEventListener('stockUpdate', fetchLowStocks);
  }, [fetchLowStocks]);

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
