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
import { formatDistanceToNow } from "date-fns";
import { Home, Clock } from "lucide-react";

interface HistoryItem {
  super_id: string | null;
  property_url: string | null;
  received_at: string;
  address: string;
  price: string | null;
  thumbnail: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
}

export function AppSidebar() {
  const [location, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const currentSuperId = searchParams.get('id');

  const { data: history = [] } = useQuery<HistoryItem[]>({
    queryKey: ['/api/history'],
    refetchInterval: 10000,
  });

  const handleSelectHistory = (superId: string | null) => {
    if (superId) {
      navigate(`/?id=${superId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <Sidebar data-testid="sidebar-history">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Analyses
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
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
                <div className="px-3 py-6 text-sm text-muted-foreground text-center">
                  No analysis history yet
                </div>
              )}

              {history.map((item, index) => (
                <SidebarMenuItem key={item.super_id || index}>
                  <SidebarMenuButton
                    onClick={() => handleSelectHistory(item.super_id)}
                    isActive={currentSuperId === item.super_id}
                    data-testid={`button-history-${item.super_id}`}
                    className="h-auto py-2"
                  >
                    <div className="flex items-start gap-3 w-full">
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt=""
                          className="w-12 h-12 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate" data-testid={`text-address-${item.super_id}`}>
                          {item.address}
                        </div>
                        {item.price && (
                          <div className="text-xs text-primary font-semibold" data-testid={`text-price-${item.super_id}`}>
                            {item.price}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          {item.bedrooms !== null && (
                            <span>{item.bedrooms} bed</span>
                          )}
                          {item.bathrooms !== null && (
                            <span>{item.bathrooms} bath</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(item.received_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
