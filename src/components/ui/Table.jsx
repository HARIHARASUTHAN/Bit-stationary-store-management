import React from 'react';

export default function Table({
  columns = [],
  data = [],
  keyField = 'id',
  emptyMessage = 'No data available',
  className = '',
}) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-200/80 bg-white ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50/80">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 ${col.align === 'right' ? 'text-right' : ''} ${col.headerClassName || ''}`}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr key={row[keyField] || rIdx} className="hover:bg-gray-50/70 transition-colors">
                {columns.map((col, cIdx) => (
                  <td
                    key={col.key || cIdx}
                    className={`px-4 py-3 text-gray-700 ${col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}
                  >
                    {col.render ? col.render(row[col.key], row, rIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
