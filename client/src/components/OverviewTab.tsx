import { Badge } from "@/components/ui/badge";

interface OverviewTabProps {
  description: string;
  keyFeatures: string[];
  updateReason?: string;
}

export default function OverviewTab({ description, keyFeatures, updateReason }: OverviewTabProps) {
  const parseDescription = (html: string) => {
    return html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "");
  };

  return (
    <div className="space-y-6 py-6">
      {updateReason && (
        <div className="bg-accent/50 border border-accent-border rounded-md p-4">
          <p className="text-sm font-medium" data-testid="text-update-reason">{updateReason}</p>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3">Description</h3>
        <div className="text-foreground whitespace-pre-wrap leading-relaxed" data-testid="text-description">
          {parseDescription(description)}
        </div>
      </div>

      {keyFeatures && keyFeatures.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Key Features</h3>
          <div className="flex flex-wrap gap-2">
            {keyFeatures.map((feature, index) => (
              <Badge key={index} variant="secondary" data-testid={`badge-feature-${index}`}>
                {feature.trim()}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
