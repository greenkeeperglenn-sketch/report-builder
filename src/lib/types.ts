export interface Section {
  id: string;
  title: string;
  content: string;
}

export interface TableData {
  name: string;
  headers: string[];
  rows: (string | number)[][];
}

export interface ChartConfig {
  type: "bar" | "line";
  title: string;
  xLabel: string;
  yLabel: string;
  xColumn: number;
  yColumns: number[];
  tableIndex: number;
}

export interface ChartExport {
  id: string;
  title: string;
  imageBase64: string;
}

export interface ImageUpload {
  id: string;
  name: string;
  caption: string;
  dataUrl: string;
}

export type DocumentType = "protocol" | "report";
