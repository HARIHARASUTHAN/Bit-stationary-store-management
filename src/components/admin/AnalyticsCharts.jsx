import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export function OrderVolumeChart({ data = [] }) {
  const sampleData = data.length > 0 ? data : [
    { day: 'Mon', orders: 24, revenue: 3200 },
    { day: 'Tue', orders: 42, revenue: 5800 },
    { day: 'Wed', orders: 38, revenue: 4900 },
    { day: 'Thu', orders: 55, revenue: 8100 },
    { day: 'Fri', orders: 62, revenue: 9400 },
    { day: 'Sat', orders: 30, revenue: 4100 },
    { day: 'Sun', orders: 8, revenue: 950 },
  ];

  return (
    <div className="bg-[#fffaf0] p-6 rounded-[24px] border border-[#e5e5e5]">
      <div className="mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#ff4d8b]">
          Weekly Volume
        </span>
        <h3 className="text-xl font-medium tracking-[-0.8px] text-[#0a0a0a] mt-0.5">
          Pre-Order Volume Trends
        </h3>
        <p className="text-xs text-[#6a6a6a]">Total reservations placed per day across campus</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sampleData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis dataKey="day" stroke="#6a6a6a" fontSize={11} />
            <YAxis stroke="#6a6a6a" fontSize={11} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0a0a0a', borderRadius: 12, color: '#fff', border: 'none', fontSize: 12 }}
              itemStyle={{ color: '#ffb084' }}
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#ff4d8b"
              strokeWidth={3}
              dot={{ r: 4, fill: '#ff4d8b' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function TopItemsChart({ data = [] }) {
  const sampleData = data.length > 0 ? data : [
    { name: 'Spiral Notebook', count: 185 },
    { name: 'Reynolds Pen', count: 162 },
    { name: 'Geometry Box', count: 78 },
    { name: 'Lab Record Book', count: 64 },
    { name: 'Scientific Calc', count: 28 },
  ];

  return (
    <div className="bg-[#fffaf0] p-6 rounded-[24px] border border-[#e5e5e5]">
      <div className="mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#1a3a3a]">
          Item Demand
        </span>
        <h3 className="text-xl font-medium tracking-[-0.8px] text-[#0a0a0a] mt-0.5">
          Most-Ordered Stationery
        </h3>
        <p className="text-xs text-[#6a6a6a]">Top 5 supplies reserved by students & faculty</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sampleData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
            <XAxis type="number" stroke="#6a6a6a" fontSize={11} />
            <YAxis dataKey="name" type="category" stroke="#6a6a6a" fontSize={11} width={110} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0a0a0a', borderRadius: 12, color: '#fff', border: 'none', fontSize: 12 }}
            />
            <Bar dataKey="count" fill="#1a3a3a" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DepartmentComparisonChart({ data = [] }) {
  const sampleData = data.length > 0 ? data : [
    { name: 'Computer Science', orders: 120, fill: '#ff4d8b' },
    { name: 'Electronics & Comm', orders: 95, fill: '#1a3a3a' },
    { name: 'Mechanical Engg', orders: 75, fill: '#b8a4ed' },
    { name: 'Civil Engg', orders: 45, fill: '#ffb084' },
    { name: 'Biotechnology', orders: 35, fill: '#e8b94a' },
  ];

  return (
    <div className="bg-[#fffaf0] p-6 rounded-[24px] border border-[#e5e5e5]">
      <div className="mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#b8a4ed]">
          Department Indents
        </span>
        <h3 className="text-xl font-medium tracking-[-0.8px] text-[#0a0a0a] mt-0.5">
          Department Orders Share
        </h3>
        <p className="text-xs text-[#6a6a6a]">Allocation across academic engineering programs</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sampleData}
              dataKey="orders"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {sampleData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function StockTurnoverChart({ data = [] }) {
  const sampleData = data.length > 0 ? data : [
    { category: 'Notebooks', inStock: 230, reserved: 95 },
    { category: 'Writing', inStock: 1140, reserved: 420 },
    { category: 'Geometry', inStock: 255, reserved: 80 },
    { category: 'Lab Books', inStock: 53, reserved: 35 },
    { category: 'Office Supplies', inStock: 125, reserved: 45 },
  ];

  return (
    <div className="bg-[#fffaf0] p-6 rounded-[24px] border border-[#e5e5e5]">
      <div className="mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#e8b94a]">
          Warehouse Health
        </span>
        <h3 className="text-xl font-medium tracking-[-0.8px] text-[#0a0a0a] mt-0.5">
          Available Stock vs In-Queue
        </h3>
        <p className="text-xs text-[#6a6a6a]">Warehouse on-shelf reserves vs pre-order allocations</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sampleData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis dataKey="category" stroke="#6a6a6a" fontSize={11} />
            <YAxis stroke="#6a6a6a" fontSize={11} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="inStock" name="Available Shelf Stock" fill="#1a3a3a" radius={[6, 6, 0, 0]} />
            <Bar dataKey="reserved" name="Reserved in Queue" fill="#ffb084" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
