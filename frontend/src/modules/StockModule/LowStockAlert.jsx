import React from 'react';

const LowStockAlert = ({ items }) => {
  if (!items.length) {
    return <p>No low stock items.</p>;
  }

  return (
    <div>
      <h3>Low Stock Alerts</h3>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} - {item.stock} / Min {item.minStock}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LowStockAlert;
