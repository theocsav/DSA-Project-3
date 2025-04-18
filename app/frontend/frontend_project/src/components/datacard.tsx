import React from 'react';

interface DataCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

const DataCard: React.FC<DataCardProps> = ({ title, value, subtitle, icon }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <div className="mt-1">
            <span className="text-2xl font-semibold">{value}</span>
            {subtitle && <span className="text-gray-500 ml-2 text-sm">{subtitle}</span>}
          </div>
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </div>
  );
};

export default DataCard;
