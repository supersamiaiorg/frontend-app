// client/src/components/FloorplanAnalysisTab.tsx

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import Papa from "papaparse";

interface FloorplanAnalysisTabProps {
  floorplanData: {
    // primary preferred source – inline CSV text
    inline_csv?: string | null;

    // URL-based sources
    fp_json_csv_url?: string | null;
    csv_url?: string | null;
    total_area_csv_url?: string | null;

    // JSON / extra metadata
    fp_json_file_url?: string | null;
    json_url?: string | null;

    // annotated / side-by-side image
    image_labelme_side_by_side_url?: string | null;
    labelme_side_by_side_url?: string | null;
  } | null;
}

// generic row: column name -> value
type CsvRow = Record<string, string>;

function parseCSV(csv: string): { headers: string[]; rows: CsvRow[] } {
  if (!csv || !csv.trim()) {
    return { headers: [], rows: [] };
  }

  const result = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  });

  if (result.errors.length > 0) {
    console.error("[FloorplanAnalysisTab] CSV parsing errors:", result.errors);
  }

  const headersRaw = result.meta.fields ?? [];
  const headers = headersRaw
    .map((h) => h?.toString().trim())
    // keep only non-empty headers and ignore purely numeric ones (0,1,2...)
    .filter((h): h is string => !!h && !/^\d+$/.test(h));

  const rows: CsvRow[] = [];

  for (const raw of result.data as any[]) {
    if (!raw) continue;
    const row: CsvRow = {};
    for (const header of headers) {
      const v = raw[header];
      row[header] = v === null || v === undefined ? "" : v.toString().trim();
    }
    // skip totally empty rows
    if (Object.values(row).some((v) => v !== "")) {
      rows.push(row);
    }
  }

  return { headers, rows };
}

function formatArea(value: string | undefined): string {
  if (!value) return "0.00";
  const num = parseFloat(value);
  if (!Number.isFinite(num)) return "0.00";
  return num.toFixed(2);
}

export default function FloorplanAnalysisTab({
  floorplanData,
}: FloorplanAnalysisTabProps) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  if (!floorplanData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Floorplan Analysis</CardTitle>
          <CardDescription>
            Room-by-room breakdown with dimensions and areas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No floorplan data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const inlineCsv = floorplanData.inline_csv ?? null;
  const csvUrl =
    floorplanData.fp_json_csv_url ||
    floorplanData.csv_url ||
    floorplanData.total_area_csv_url ||
    null;

  const sideBySideUrl =
    floorplanData.image_labelme_side_by_side_url ??
    floorplanData.labelme_side_by_side_url ??
    null;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setDebugInfo(null);

        let csvText: string | null = null;

        // 1) Prefer inline CSV if present
        if (inlineCsv && inlineCsv.trim()) {
          csvText = inlineCsv.trim();
          setDebugInfo(
            `Using inline_csv text. Length: ${csvText.length} chars. First 200:\n` +
              csvText.slice(0, 200),
          );
        } else if (csvUrl) {
          // 2) Fallback to fetching via proxy from URL
          const proxiedUrl = `/api/floorplan-csv?url=${encodeURIComponent(
            csvUrl,
          )}`;
          console.log(
            "[FloorplanAnalysisTab] Fetching CSV from proxy:",
            proxiedUrl,
          );

          const resp = await fetch(proxiedUrl);
          if (!resp.ok) {
            throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
          }
          csvText = await resp.text();
          setDebugInfo(
            `Fetched CSV from proxy. Length: ${csvText.length} chars. First 200:\n` +
              csvText.slice(0, 200),
          );
        } else {
          setHeaders([]);
          setRows([]);
          setDebugInfo("No inline_csv or CSV URL provided.");
          return;
        }

        if (cancelled || !csvText) return;

        const parsed = parseCSV(csvText);
        setHeaders(parsed.headers);
        setRows(parsed.rows);
      } catch (err: any) {
        console.error("[FloorplanAnalysisTab] Error loading CSV:", err);
        if (!cancelled) {
          setError("Unable to load floorplan data.");
          setHeaders([]);
          setRows([]);
          setDebugInfo(
            (err && err.message) || "Unknown error while loading CSV.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [inlineCsv, csvUrl]);

  // group rows by Floor_Name (if present)
  const rowsByFloor: Record<string, CsvRow[]> = {};
  const floorOrder: string[] = [];

  for (const row of rows) {
    const floorName = row["Floor_Name"] || "Unknown";
    if (!rowsByFloor[floorName]) {
      rowsByFloor[floorName] = [];
      floorOrder.push(floorName);
    }
    rowsByFloor[floorName].push(row);
  }

  // totals if those columns exist
  const metricAreaCol = "Calculated Sq Area Metric";
  const imperialAreaCol = "calculated_area_imperial";

  const totalAreaMetric = rows.reduce((sum, r) => {
    const v = parseFloat(r[metricAreaCol] ?? "");
    return sum + (Number.isFinite(v) ? v : 0);
  }, 0);

  const totalAreaImperial = rows.reduce((sum, r) => {
    const v = parseFloat(r[imperialAreaCol] ?? "");
    return sum + (Number.isFinite(v) ? v : 0);
  }, 0);

  // Build list of downloadable CSV/JSON links (excluding inline_csv and image URL)
  type FileLink = { label: string; url: string };
  const fileLinks: FileLink[] = [];

  const maybeAdd = (url: string | null | undefined, label: string) => {
    if (!url) return;
    fileLinks.push({ label, url });
  };

  maybeAdd(floorplanData.fp_json_csv_url, "Floorplan CSV (fp_json_csv_url)");
  maybeAdd(floorplanData.csv_url, "Floorplan CSV (csv_url)");
  maybeAdd(
    floorplanData.total_area_csv_url,
    "Total Area CSV (total_area_csv_url)",
  );
  maybeAdd(floorplanData.fp_json_file_url, "Floorplan JSON (fp_json_file_url)");
  maybeAdd(floorplanData.json_url, "Floorplan JSON (json_url)");

  // dedupe by URL
  const seen = new Set<string>();
  const uniqueFileLinks = fileLinks.filter((link) => {
    if (seen.has(link.url)) return false;
    seen.add(link.url);
    return true;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Floorplan Analysis</CardTitle>
          <CardDescription>
            Room-by-room breakdown with all available fields from the analysed
            floorplan CSV. Grouped by floor using the <code>Floor_Name</code>{" "}
            column (e.g. <code>ground_floor</code>, <code>first_floor</code>,{" "}
            <code>second_floor</code>).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {inlineCsv && (
            <p className="text-xs text-muted-foreground">
              Source: using <code>inline_csv</code> from the analysis payload.
            </p>
          )}

          {loading && (
            <p className="text-sm text-muted-foreground">
              Loading floorplan data…
            </p>
          )}

          {!loading && rows.length === 0 && !error && (
            <p className="text-sm text-muted-foreground">
              No floorplan data available.
            </p>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {rows.length > 0 && (
            <>
              {/* Summary */}
              <div className="flex flex-wrap items-center justify-between gap-4 border rounded-md p-3 bg-muted/40">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Total Calculated Area
                  </p>
                  <p className="text-sm font-medium">
                    {formatArea(totalAreaMetric.toString())} m²
                    <span className="mx-1 text-muted-foreground">/</span>
                    {formatArea(totalAreaImperial.toString())} sq ft
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Rows
                  </p>
                  <p className="text-sm font-medium">{rows.length}</p>
                </div>
              </div>

              {/* Tables grouped by floor, with ALL named columns */}
              <div className="space-y-6">
                {floorOrder.map((floor) => (
                  <div key={floor} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold capitalize">
                        {floor.replace(/_/g, " ")}
                      </h3>
                      <Badge variant="outline" className="text-[10px] px-1.5">
                        {rowsByFloor[floor].length} segment
                        {rowsByFloor[floor].length === 1 ? "" : "s"}
                      </Badge>
                    </div>

                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {headers.map((header) => (
                              <TableHead key={header}>{header}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rowsByFloor[floor].map((row, rowIndex) => (
                            <TableRow key={`${floor}-${rowIndex}`}>
                              {headers.map((header) => {
                                const value = row[header] ?? "";

                                // highlight is_segment as a badge
                                if (
                                  header === "is_segment" &&
                                  value &&
                                  value.toLowerCase() !== "object"
                                ) {
                                  return (
                                    <TableCell key={header}>
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] px-1.5"
                                      >
                                        {value}
                                      </Badge>
                                    </TableCell>
                                  );
                                }

                                return (
                                  <TableCell key={header}>{value}</TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Annotated / side-by-side floorplan image */}
          {sideBySideUrl && (
            <div className="space-y-2 pt-4">
              <h3 className="text-sm font-semibold">Annotated Floorplan</h3>
              <p className="text-xs text-muted-foreground">
                Floorplan with detected segments and labels shown side by side.
              </p>
              <div className="border rounded-md overflow-hidden bg-muted">
                <img
                  src={sideBySideUrl}
                  alt="Annotated floorplan"
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          {/* Downloads section at the bottom (CSV/JSON links) */}
          {uniqueFileLinks.length > 0 && (
            <div className="space-y-2 pt-4 border-t mt-4">
              <h3 className="text-sm font-semibold">Downloads</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                {uniqueFileLinks.map((link) => (
                  <li key={`${link.label}-${link.url}`} className="break-all">
                    {link.label}:{" "}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline inline-flex items-center gap-1"
                    >
                      {link.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Debug info */}
          {debugInfo && (
            <details className="mt-4 text-xs text-muted-foreground whitespace-pre-wrap break-all">
              <summary className="cursor-pointer mb-1">
                Debug: Floorplan CSV
              </summary>
              {debugInfo}
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
