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
  if (!imageConditionData?.ica_overall_analysis?.stages?.condition_assessment) {
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

  const assessment = imageConditionData.ica_overall_analysis.stages.condition_assessment;
  
  const sections: { key: string; title: string; images: ConditionImage[] }[] = [];
  
  for (const [key, value] of Object.entries(assessment)) {
    if (Array.isArray(value) && value.length > 0) {
      sections.push({
        key,
        title: formatRoomType(key.replace('internal_', '').replace('external_', '')),
        images: value as ConditionImage[],
      });
    }
  }

  const totalImages = sections.reduce((sum, section) => sum + section.images.length, 0);
  const overallScore = totalImages > 0
    ? sections.reduce((sum, section) => {
        const sectionTotal = section.images.reduce((s, img) => s + img.condition_score, 0);
        return sum + sectionTotal;
      }, 0) / totalImages
    : 0;

  return (
    <div className="space-y-6" data-testid="tab-image-condition">
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-condition-title">Property Condition Assessment</CardTitle>
          <CardDescription data-testid="text-condition-description">
            AI-powered analysis of property condition from images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-md">
            <Star className="h-8 w-8 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">Overall Condition Score</div>
              <div className={`text-3xl font-bold ${getConditionColor(overallScore)}`} data-testid="text-overall-score">
                {overallScore.toFixed(1)}/100
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {sections.map((section) => {
        const Icon = getRoomIcon(section.key);
        const avgScore = section.images.reduce((sum, img) => sum + img.condition_score, 0) / section.images.length;
        
        return (
          <Card key={section.key} data-testid={`card-section-${section.key}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <CardTitle className="text-lg" data-testid={`text-section-title-${section.key}`}>
                    {section.title}
                  </CardTitle>
                  <CardDescription>
                    Average Score: <span className={`font-semibold ${getConditionColor(avgScore)}`}>
                      {avgScore.toFixed(1)}/100
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.images.map((image, index) => (
                  <div 
                    key={index} 
                    className="border rounded-md overflow-hidden hover-elevate"
                    data-testid={`card-image-${section.key}-${index}`}
                  >
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      <img
                        src={image.image_url}
                        alt={`${section.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                        data-testid={`img-condition-${section.key}-${index}`}
                      />
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge 
                          variant={getConditionBadgeVariant(image.condition_label)}
                          data-testid={`badge-condition-${section.key}-${index}`}
                        >
                          {image.condition_label}
                        </Badge>
                        <span 
                          className={`text-lg font-bold ${getConditionColor(image.condition_score)}`}
                          data-testid={`text-score-${section.key}-${index}`}
                        >
                          {image.condition_score}/100
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground" data-testid={`text-reasoning-${section.key}-${index}`}>
                        {image.reasoning}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
