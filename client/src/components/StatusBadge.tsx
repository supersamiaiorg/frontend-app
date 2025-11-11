import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface StatusBadgeProps {
  status: "analyzing" | "complete" | "error" | "waiting";
  message?: string;
}

export default function StatusBadge({ status, message }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "analyzing":
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          label: message || "Analyzing property...",
          variant: "default" as const,
        };
      case "complete":
        return {
          icon: <CheckCircle2 className="h-3 w-3" />,
          label: message || "Analysis complete",
          variant: "default" as const,
        };
      case "error":
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: message || "Analysis failed",
          variant: "destructive" as const,
        };
      case "waiting":
        return {
          icon: <Clock className="h-3 w-3" />,
          label: message || "Waiting for analysis...",
          variant: "secondary" as const,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} className="gap-1.5" data-testid={`status-${status}`}>
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  );
}
