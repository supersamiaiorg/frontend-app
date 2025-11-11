import { MapPin, Train } from "lucide-react";

interface Station {
  station: string;
  distance: number;
  type: string;
}

interface LocationTabProps {
  location: {
    latitude: number;
    longitude: number;
    mapPreviewUrl?: string;
  };
  stations?: Station[];
  postcode?: string;
}

export default function LocationTab({ location, stations, postcode }: LocationTabProps) {
  return (
    <div className="space-y-6 py-6">
      {postcode && (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium" data-testid="text-postcode">{postcode}</span>
        </div>
      )}

      <div className="aspect-video bg-muted rounded-md overflow-hidden">
        {location.mapPreviewUrl ? (
          <img
            src={location.mapPreviewUrl}
            alt="Property location map"
            className="w-full h-full object-cover"
            data-testid="img-map"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-muted-foreground">Map preview unavailable</p>
          </div>
        )}
      </div>

      {stations && stations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Train className="h-5 w-5" />
            Nearby Transport
          </h3>
          <div className="space-y-3">
            {stations.map((station, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-card border border-card-border rounded-md"
                data-testid={`station-${index}`}
              >
                <div>
                  <p className="font-medium">{station.station}</p>
                  <p className="text-sm text-muted-foreground">
                    Lines: {station.type.split(",").join(", ")}
                  </p>
                </div>
                <div className="text-sm font-medium">{station.distance} mi</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
