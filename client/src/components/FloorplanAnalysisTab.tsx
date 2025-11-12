import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import Papa from "papaparse";

interface FloorplanAnalysisTabProps {
  floorplanData: {
    inline_csv: string | null;
    csv_url: string | null;
    total_area_csv_url: string | null;
    json_url: string | null;
    labelme_side_by_side_url: string | null;
  };
}

interface FloorplanRow {
  floor_name: string;
  room_name: string;
  is_segment: string;
  room_id: string;
  no_of_door: string;
  no_of_window: string;
  dimensions_imperial: string;
  dimensions_metric: string;
  calculated_area_metric: string;
  calculated_area_imperial: string;
}

function parseCSV(csv: string): FloorplanRow[] {
  if (!csv || !csv.trim()) return [];
  
  const result = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  });
  
  if (result.errors.length > 0) {
    console.error("CSV parsing errors:", result.errors);
  }
  
  const rows: FloorplanRow[] = [];
  
  for (const row of result.data as any[]) {
    const roomName = row['Room_Name']?.trim();
    const isSegment = row['is_segment']?.trim();
    
    if (roomName) {
      rows.push({
        floor_name: row['Floor_Name']?.trim() || '',
        room_name: roomName,
        is_segment: isSegment || '',
        room_id: row['Room_id']?.trim() || '',
        no_of_door: row['No_of_door']?.trim() || '0',
        no_of_window: row['No_of_window']?.trim() || '0',
        dimensions_imperial: row['dimensions_imperial']?.trim() || 'Unknown',
        dimensions_metric: row['dimensions_metric']?.trim() || 'Unknown',
        calculated_area_metric: row['Calculated Sq Area Metric']?.trim() || '0',
        calculated_area_imperial: row['calculated_area_imperial']?.trim() || '0',
      });
    }
  }
  
  return rows;
}

export default function FloorplanAnalysisTab({ floorplanData }: FloorplanAnalysisTabProps) {
  const csv = floorplanData.inline_csv || '';
  const rooms = parseCSV(csv);
  
  const totalAreaMetric = rooms.reduce((sum, room) => {
    const area = parseFloat(room.calculated_area_metric);
    return sum + (isNaN(area) ? 0 : area);
  }, 0);
  
  const totalAreaImperial = rooms.reduce((sum, room) => {
    const area = parseFloat(room.calculated_area_imperial);
    return sum + (isNaN(area) ? 0 : area);
  }, 0);

  return (
    <div className="space-y-6" data-testid="tab-floorplan-analysis">
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-floorplan-title">Floorplan Analysis</CardTitle>
          <CardDescription data-testid="text-floorplan-description">
            Room-by-room breakdown with dimensions and areas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {rooms.length === 0 ? (
            <p className="text-muted-foreground text-center py-8" data-testid="text-no-floorplan-data">
              No floorplan data available
            </p>
          ) : (
            <>
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="text-sm text-muted-foreground">Total Area (Metric)</div>
                  <div className="text-2xl font-bold" data-testid="text-total-area-metric">
                    {totalAreaMetric.toFixed(2)} m²
                  </div>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="text-sm text-muted-foreground">Total Area (Imperial)</div>
                  <div className="text-2xl font-bold" data-testid="text-total-area-imperial">
                    {totalAreaImperial.toFixed(2)} sq ft
                  </div>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="text-sm text-muted-foreground">Total Rooms</div>
                  <div className="text-2xl font-bold" data-testid="text-total-rooms">
                    {rooms.length}
                  </div>
                </div>
              </div>

              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Room Name</TableHead>
                        <TableHead>Floor</TableHead>
                        <TableHead className="text-center">Doors</TableHead>
                        <TableHead className="text-center">Windows</TableHead>
                        <TableHead>Dimensions (Metric)</TableHead>
                        <TableHead>Dimensions (Imperial)</TableHead>
                        <TableHead className="text-right">Area (m²)</TableHead>
                        <TableHead className="text-right">Area (sq ft)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rooms.map((room, index) => (
                        <TableRow key={index} data-testid={`row-room-${index}`}>
                          <TableCell className="font-medium" data-testid={`text-room-name-${index}`}>
                            {room.room_name}
                          </TableCell>
                          <TableCell data-testid={`text-floor-${index}`}>
                            <Badge variant="outline">
                              {room.floor_name || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center" data-testid={`text-doors-${index}`}>
                            {room.no_of_door}
                          </TableCell>
                          <TableCell className="text-center" data-testid={`text-windows-${index}`}>
                            {room.no_of_window}
                          </TableCell>
                          <TableCell data-testid={`text-dim-metric-${index}`}>
                            {room.dimensions_metric}
                          </TableCell>
                          <TableCell data-testid={`text-dim-imperial-${index}`}>
                            {room.dimensions_imperial}
                          </TableCell>
                          <TableCell className="text-right font-medium" data-testid={`text-area-metric-${index}`}>
                            {parseFloat(room.calculated_area_metric).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-medium" data-testid={`text-area-imperial-${index}`}>
                            {parseFloat(room.calculated_area_imperial).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}

          {floorplanData.labelme_side_by_side_url && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Annotated Floorplan</h3>
              <div className="border rounded-md overflow-hidden bg-muted/30">
                <img 
                  src={floorplanData.labelme_side_by_side_url} 
                  alt="Annotated floorplan" 
                  className="w-full h-auto"
                  data-testid="img-annotated-floorplan"
                />
              </div>
            </div>
          )}

          {(floorplanData.csv_url || floorplanData.json_url || floorplanData.total_area_csv_url) && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Additional Resources</h3>
              <div className="flex flex-wrap gap-2">
                {floorplanData.csv_url && (
                  <a
                    href={floorplanData.csv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    data-testid="link-csv-download"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Download CSV Data
                  </a>
                )}
                {floorplanData.json_url && (
                  <a
                    href={floorplanData.json_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    data-testid="link-json-download"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Download JSON Data
                  </a>
                )}
                {floorplanData.total_area_csv_url && (
                  <a
                    href={floorplanData.total_area_csv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    data-testid="link-total-area-download"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Download Total Area CSV
                  </a>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
