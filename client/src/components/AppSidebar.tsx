import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Home, Clock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type AnalysisStatus =
  | "waiting"
  | "started"
  | "complete"
  | "error"
  | "timeout"
  | string;

interface HistoryItem {
  super_id: string | null;
  property_url: string | null;
  received_at: string | null;
  analysis_status?: AnalysisStatus;
  address?: string | null;
  price?: string | null;
  thumbnail?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
}

function statusConfig(status?: AnalysisStatus) {
  switch (status) {
    case "started":
      return {
        icon: Loader2,
        label: "In progress",
        className: "text-blue-500 border-blue-500",
        spin: true,
      };
    case "complete":
      return {
        icon: CheckCircle2,
        label: "Complete",
        className: "text-emerald-500 border-emerald-500",
        spin: false,
      };
    case "error":
    case "timeout":
      return {
        icon: AlertCircle,
        label: status === "timeout" ? "Timed out" : "Error",
        className: "text-red-500 border-red-500",
        spin: false,
      };
    default:
      return {
        icon: Clock,
        label: "Queued",
        className: "text-muted-foreground border-muted-foreground/40",
        spin: false,
      };
  }
}

export function AppSidebar() {
  const [location, navigate] = useLocation();

  // active super_id is taken from /property/:id
  let currentSuperId: string | null = null;
  if (location.startsWith("/property/")) {
    currentSuperId =
      location.replace("/property/", "").split(/[?#]/)[0] || null;
  }

  const { data: history = [] } = useQuery<HistoryItem[]>({
    queryKey: ["/api/history"],
    refetchInterval: 10000,
  });

  const handleSelectHistory = (superId: string | null) => {
    if (superId) {
      navigate(`/property/${superId}`);
    } else {
      navigate("/");
    }
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Recent Analyses</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* New Analysis button */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleSelectHistory(null)}
                  isActive={!currentSuperId}
                  data-testid="button-new-analysis"
                >
                  <Home className="h-4 w-4" />
                  <span>New Analysis</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {history.length === 0 && (
                <SidebarMenuItem>
                  <div className="px-2 py-3 text-xs text-muted-foreground">
                    No analyses yet. Start by entering a Rightmove URL.
                  </div>
                </SidebarMenuItem>
              )}

              {history.map((item) => {
                const isActive =
                  item.super_id && item.super_id === currentSuperId;
                const status = statusConfig(item.analysis_status);
                const Icon = status.icon;

                const subtitleParts: string[] = [];
                if (item.price) subtitleParts.push(item.price);
                if (item.bedrooms != null)
                  subtitleParts.push(`${item.bedrooms} bed`);
                if (item.bathrooms != null)
                  subtitleParts.push(`${item.bathrooms} bath`);
                const subtitle = subtitleParts.join(" · ");

                const timeAgo = item.received_at
                  ? formatDistanceToNow(new Date(item.received_at), {
                      addSuffix: true,
                    })
                  : null;

                return (
                  <SidebarMenuItem
                    key={item.super_id ?? item.property_url ?? Math.random()}
                  >
                    <SidebarMenuButton
                      onClick={() => handleSelectHistory(item.super_id)}
                      isActive={isActive}
                      className="items-start py-3"
                    >
                      <div className="flex items-start gap-3 w-full">
                        {/* Thumbnail */}
                        <div className="h-10 w-14 rounded-md bg-muted overflow-hidden flex-shrink-0">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt="Thumbnail"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">
                              No image
                            </div>
                          )}
                        </div>

                        {/* Text content */}
                        <div className="flex flex-col flex-1 min-w-0 gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">
                                {item.address ??
                                  item.property_url ??
                                  "Unknown property"}
                              </p>
                              {subtitle && (
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {subtitle}
                                </p>
                              )}
                            </div>

                            <Badge
                              variant="outline"
                              className={`flex items-center gap-1 px-1.5 py-0 text-[10px] font-normal ${status.className}`}
                            >
                              <Icon
                                className={`h-3 w-3 ${status.spin ? "animate-spin" : ""}`}
                              />
                              {status.label}
                            </Badge>
                          </div>

                          {timeAgo && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{timeAgo}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
