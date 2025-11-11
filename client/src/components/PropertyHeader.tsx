import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Home, Maximize } from "lucide-react";

interface PropertyHeaderProps {
  address: string;
  price: {
    primary: string;
    secondary?: string;
  };
  bedrooms: number;
  bathrooms: number;
  size?: {
    primary: string;
    secondary?: string;
  };
  propertyType: string;
  status?: {
    available: boolean;
    label: string;
  };
}

export default function PropertyHeader({
  address,
  price,
  bedrooms,
  bathrooms,
  size,
  propertyType,
  status,
}: PropertyHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-property-address">
            {address}
          </h1>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-semibold text-primary" data-testid="text-property-price">
              {price.primary}
            </span>
            {price.secondary && (
              <span className="text-sm text-muted-foreground">({price.secondary})</span>
            )}
          </div>
        </div>
        {status && (
          <Badge variant={status.available ? "default" : "secondary"} data-testid="badge-property-status">
            {status.label}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-6 flex-wrap text-sm">
        <div className="flex items-center gap-2" data-testid="stat-bedrooms">
          <Bed className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{bedrooms}</span>
          <span className="text-muted-foreground">bed{bedrooms !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-2" data-testid="stat-bathrooms">
          <Bath className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{bathrooms}</span>
          <span className="text-muted-foreground">bath{bathrooms !== 1 ? "s" : ""}</span>
        </div>
        {size && (
          <div className="flex items-center gap-2" data-testid="stat-size">
            <Maximize className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{size.primary}</span>
            {size.secondary && (
              <span className="text-muted-foreground">({size.secondary})</span>
            )}
          </div>
        )}
        <div className="flex items-center gap-2" data-testid="stat-type">
          <Home className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{propertyType}</span>
        </div>
      </div>
    </div>
  );
}
