import * as XLSX from "xlsx";
import { TableData } from "./types";

export function parseExcelBuffer(buffer: ArrayBuffer): TableData[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const tables: TableData[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
      header: 1,
      defval: "",
    });

    if (jsonData.length < 2) continue;

    const headers = jsonData[0].map(String);
    const rows = jsonData.slice(1).filter((row) =>
      row.some((cell) => cell !== "")
    );

    tables.push({ name: sheetName, headers, rows });
  }

  return tables;
}
