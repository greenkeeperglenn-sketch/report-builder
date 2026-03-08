"use client";

import { TableData } from "@/lib/types";

interface TablePreviewProps {
  tables: TableData[];
}

export default function TablePreview({ tables }: TablePreviewProps) {
  if (tables.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {tables.map((table, idx) => (
        <div key={idx} className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-2">
            <h4 className="text-sm font-semibold text-slate-700">
              Table {idx + 1}: {table.name}
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {table.headers.map((header, hi) => (
                    <th
                      key={hi}
                      className="whitespace-nowrap px-4 py-2 font-medium text-slate-600"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, ri) => (
                  <tr
                    key={ri}
                    className="border-b border-slate-100 last:border-0"
                  >
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="whitespace-nowrap px-4 py-1.5 text-slate-700"
                      >
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
