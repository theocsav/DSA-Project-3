import React from 'react';

const DataCard = ({ title, value, subtitle, icon }) => {
  return (
    <div className="metrics-card">
      <h3>{title}</h3>
      <div className="metrics-value">{value}</div>
      {subtitle && <div className="metrics-subtitle">{subtitle}</div>}
    </div>
  );
};

export default DataCard;