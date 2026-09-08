import React, { useState } from 'react';
import SearchBar from '@/components/ui/SearchBar';
import Select from '@/components/ui/Select';
import { formatDateTime } from '@/utils/formatDate';
import Badge from '@/components/ui/Badge';

export default function AuditLogTable({ logs = [] }) {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.targetId.toLowerCase().includes(search.toLowerCase());
    const matchesAction = filterAction ? log.action === filterAction : true;
    return matchesSearch && matchesAction;
  });

  const actions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by action, actor, or target ID..."
          className="w-full sm:w-80"
        />
        <div className="w-full sm:w-56">
          <Select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            options={actions.map((a) => ({ value: a, label: a }))}
            placeholder="All Action Types"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-600 uppercase">Timestamp</th>
              <th className="px-4 py-3 font-semibold text-gray-600 uppercase">Action</th>
              <th className="px-4 py-3 font-semibold text-gray-600 uppercase">Actor</th>
              <th className="px-4 py-3 font-semibold text-gray-600 uppercase">Target ID</th>
              <th className="px-4 py-3 font-semibold text-gray-600 uppercase">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No audit trail records found.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono bg-blue-50 text-[#1e3a5f] px-2 py-0.5 rounded font-semibold text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-900 block">{log.actor}</span>
                    <span className="text-gray-400 text-[11px]">{log.actorEmail}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-600">{log.targetId}</td>
                  <td className="px-4 py-3 text-gray-700">{log.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
