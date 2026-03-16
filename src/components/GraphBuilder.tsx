"use client";

import { useState, useRef, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toPng } from "html-to-image";
import { TableData, ChartConfig, ChartExport } from "@/lib/types";

const COLORS = ["#059669", "#2563eb", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

interface GraphBuilderProps {
  tables: TableData[];
  charts: ChartExport[];
  onChartsChange: (charts: ChartExport[]) => void;
}

export default function GraphBuilder({
  tables,
  charts,
  onChartsChange,
}: GraphBuilderProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<ChartConfig>({
    type: "bar",
    title: "",
    xLabel: "",
    yLabel: "",
    xColumn: 0,
    yColumns: [],
    tableIndex: 0,
  });

  const selectedTable = tables[config.tableIndex];

  const toggleYColumn = (col: number) => {
    setConfig((prev) => ({
      ...prev,
      yColumns: prev.yColumns.includes(col)
        ? prev.yColumns.filter((c) => c !== col)
        : [...prev.yColumns, col],
    }));
  };

  const chartData = selectedTable
    ? selectedTable.rows.map((row) => {
        const entry: Record<string, string | number> = {
          x: String(row[config.xColumn] ?? ""),
        };
        config.yColumns.forEach((col) => {
          entry[selectedTable.headers[col]] = Number(row[col]) || 0;
        });
        return entry;
      })
    : [];

  const exportChart = useCallback(async () => {
    if (!chartRef.current) return;
    try {
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });
      const newChart: ChartExport = {
        id: `chart-${Date.now()}`,
        title: config.title || "Chart",
        imageBase64: dataUrl,
      };
      onChartsChange([...charts, newChart]);
    } catch {
      console.error("Failed to export chart");
    }
  }, [charts, config.title, onChartsChange]);

  const removeChart = (id: string) => {
    onChartsChange(charts.filter((c) => c.id !== id));
  };

  if (tables.length === 0) return null;

  const canPreview = selectedTable && config.xColumn >= 0 && config.yColumns.length > 0;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700">Graph Builder</h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Data Table
          </label>
          <select
            value={config.tableIndex}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                tableIndex: Number(e.target.value),
                xColumn: 0,
                yColumns: [],
              }))
            }
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            {tables.map((t, i) => (
              <option key={i} value={i}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Chart Type
          </label>
          <select
            value={config.type}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                type: e.target.value as "bar" | "line",
              }))
            }
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Title
          </label>
          <input
            value={config.title}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            placeholder="Chart title"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            X-Axis Column
          </label>
          {selectedTable && (
            <select
              value={config.xColumn}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  xColumn: Number(e.target.value),
                }))
              }
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            >
              {selectedTable.headers.map((h, i) => (
                <option key={i} value={i}>
                  {h}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            X-Axis Label
          </label>
          <input
            value={config.xLabel}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, xLabel: e.target.value }))
            }
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            placeholder="X axis label"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Y-Axis Label
          </label>
          <input
            value={config.yLabel}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, yLabel: e.target.value }))
            }
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            placeholder="Y axis label"
          />
        </div>
      </div>

      {selectedTable && (
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Y-Axis Columns (select one or more)
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedTable.headers.map((h, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleYColumn(i)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  config.yColumns.includes(i)
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {canPreview && (
        <>
          <div ref={chartRef} className="rounded bg-white p-4">
            {config.title && (
              <h4 className="mb-2 text-center text-sm font-semibold text-slate-800">
                {config.title}
              </h4>
            )}
            <ResponsiveContainer width="100%" height={300}>
              {config.type === "bar" ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    label={
                      config.xLabel
                        ? { value: config.xLabel, position: "insideBottom", offset: -5 }
                        : undefined
                    }
                  />
                  <YAxis
                    label={
                      config.yLabel
                        ? { value: config.yLabel, angle: -90, position: "insideLeft" }
                        : undefined
                    }
                  />
                  <Tooltip />
                  <Legend />
                  {config.yColumns.map((col, i) => (
                    <Bar
                      key={col}
                      dataKey={selectedTable.headers[col]}
                      fill={COLORS[i % COLORS.length]}
                    />
                  ))}
                </BarChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    label={
                      config.xLabel
                        ? { value: config.xLabel, position: "insideBottom", offset: -5 }
                        : undefined
                    }
                  />
                  <YAxis
                    label={
                      config.yLabel
                        ? { value: config.yLabel, angle: -90, position: "insideLeft" }
                        : undefined
                    }
                  />
                  <Tooltip />
                  <Legend />
                  {config.yColumns.map((col, i) => (
                    <Line
                      key={col}
                      type="monotone"
                      dataKey={selectedTable.headers[col]}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
          <button
            type="button"
            onClick={exportChart}
            className="self-end rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Add Chart to Report
          </button>
        </>
      )}

      {charts.length > 0 && (
        <div className="border-t border-slate-200 pt-3">
          <h4 className="mb-2 text-xs font-semibold text-slate-600">
            Exported Charts
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {charts.map((chart) => (
              <div
                key={chart.id}
                className="relative rounded border border-slate-200 p-2"
              >
                <button
                  type="button"
                  onClick={() => removeChart(chart.id)}
                  className="absolute right-1 top-1 rounded-full bg-white/80 px-1.5 text-xs text-red-500 hover:bg-red-50"
                >
                  &times;
                </button>
                <img
                  src={chart.imageBase64}
                  alt={chart.title}
                  className="w-full rounded"
                />
                <p className="mt-1 text-center text-xs text-slate-500">
                  {chart.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
