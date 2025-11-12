import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Home, UtensilsCrossed, Bed, Bath, Building2, MapPin } from "lucide-react";

interface ImageConditionTabProps {
  imageConditionData: any;
}

interface ConditionImage {
  image_number: number;
  condition_label: string;
  condition_score: number;
  reasoning: string;
  image_url: string;
  image_id: number;
  room_type: string;
}

function getConditionBadgeVariant(label: string): "default" | "secondary" | "destructive" | "outline" {
  switch (label.toLowerCase()) {
    case "excellent":
      return "default";
    case "above average":
      return "secondary";
    case "below average":
      return "outline";
    case "poor":
      return "destructive";
    default:
      return "outline";
  }
}

function getConditionColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 65) return "text-blue-600 dark:text-blue-400";
  if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function getRoomIcon(roomType: string) {
  const type = roomType.toLowerCase();
  if (type.includes('living')) return Home;
  if (type.includes('kitchen')) return UtensilsCrossed;
  if (type.includes('bedroom')) return Bed;
  if (type.includes('bathroom')) return Bath;
  if (type.includes('facade')) return Building2;
  if (type.includes('neighborhood')) return MapPin;
  return Home;
}

function formatRoomType(roomType: string): string {
  return roomType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ImageConditionTab({ imageConditionData }: ImageConditionTabProps) {
  if (!imageConditionData?.ica_overall_analysis?.stages) {
    return (
      <div className="space-y-6" data-testid="tab-image-condition">
        <Card>
          <CardContent className="py-12">
            <p className="text-muted-foreground text-center" data-testid="text-no-condition-data">
              No image condition data available
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stages = imageConditionData.ica_overall_analysis.stages;
  const overallCondition = stages.overall_condition;
  const detailedAnalysis = stages.detailed_analysis || {};
  
  const sections: { key: string; title: string; count: number; avgScore: number }[] = [];
  
  for (const [key, value] of Object.entries(detailedAnalysis)) {
    if (Array.isArray(value) && value.length > 0) {
      const avgScore = value.reduce((sum: number, img: any) => sum + (img.condition_score || 0), 0) / value.length;
      sections.push({
        key,
        title: formatRoomType(key.replace('internal_', '').replace('external_', '')),
        count: value.length,
        avgScore,
      });
    }
  }

  const overallScore = overallCondition?.average_score || 0;
  const overallLabel = overallCondition?.overall_condition_label || 'Unknown';
  const totalAssessments = overallCondition?.total_assessments || 0;
  const confidence = overallCondition?.confidence || 'Unknown';
  const labelDistribution = overallCondition?.label_distribution || {};

  return (
    <div className="space-y-6" data-testid="tab-image-condition">
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-condition-title">Property Condition Assessment</CardTitle>
          <CardDescription data-testid="text-condition-description">
            AI-powered analysis of property condition from images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-md">
            <Star className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Overall Condition</div>
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-bold ${getConditionColor(overallScore)}`} data-testid="text-overall-score">
                  {overallScore.toFixed(1)}/100
                </span>
                <Badge variant={getConditionBadgeVariant(overallLabel)} data-testid="badge-overall-label">
                  {overallLabel}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Confidence</div>
              <div className="text-lg font-semibold" data-testid="text-confidence">{confidence}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-md">
              <div className="text-sm text-muted-foreground">Total Assessments</div>
              <div className="text-2xl font-bold" data-testid="text-total-assessments">{totalAssessments}</div>
            </div>
            {Object.entries(labelDistribution).map(([label, percentage]) => (
              <div key={label} className="p-4 border rounded-md">
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className="text-2xl font-bold" data-testid={`text-distribution-${label.toLowerCase().replace(' ', '-')}`}>
                  {((percentage as number) * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>

          {sections.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Room Breakdown</h3>
              <div className="grid gap-3">
                {sections.map((section) => {
                  const Icon = getRoomIcon(section.key);
                  return (
                    <div key={section.key} className="flex items-center gap-3 p-3 border rounded-md hover-elevate" data-testid={`card-room-${section.key}`}>
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium" data-testid={`text-room-title-${section.key}`}>{section.title}</div>
                        <div className="text-sm text-muted-foreground">{section.count} image{section.count > 1 ? 's' : ''} analyzed</div>
                      </div>
                      <div className={`text-xl font-bold ${getConditionColor(section.avgScore)}`} data-testid={`text-room-score-${section.key}`}>
                        {section.avgScore.toFixed(0)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
