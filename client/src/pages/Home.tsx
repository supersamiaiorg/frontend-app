import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import PropertyInput from "@/components/PropertyInput";
import StatusBadge from "@/components/StatusBadge";

type AnalysisStatus = "waiting" | "started" | "complete" | "error" | "timeout";

interface HistoryItem {
  super_id: string;
  property_url: string;
  received_at: string;
  analysis_status: "waiting" | "started" | "complete" | "error";
  address?: string;
  price?: string | null;
  thumbnail?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
}

export default function Home() {
  // Status shown under the input only for error/timeout
  const [status, setStatus] = useState<AnalysisStatus | null>(null);
  const [activeAnalysisUrl, setActiveAnalysisUrl] = useState<string | null>(
    null,
  );
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  const pollingTimeoutRef = useRef<number | null>(null);
  const [usePolling, setUsePolling] = useState(false);

  const triggerMutation = useMutation({
    mutationFn: async (url: string) => {
      return apiRequest("POST", "/api/trigger", { property_url: url });
    },
    onSuccess: () => {
      // Refresh history panel
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
    },
    onError: (error) => {
      console.error("Trigger error:", error);
      setStatus("error");
      setActiveAnalysisUrl(null);
    },
  });

  const connectToSSE = (url: string) => {
    if (!url) return;

    // Close any existing stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const params = new URLSearchParams({ property_url: url });
    const es = new EventSource(`/api/stream?${params}`);
    eventSourceRef.current = es;

    // Hard timeout safeguard
    const timeoutId = window.setTimeout(
      () => {
        console.warn("[SSE] Timed out waiting for analysis to finish");
        setStatus("timeout");
        setActiveAnalysisUrl(null);
        es.close();
        eventSourceRef.current = null;
      },
      12 * 60 * 1000,
    );

    es.onmessage = (event) => {
      if (typeof event.data === "string" && event.data.startsWith(":")) return;

      try {
        const data = JSON.parse(event.data);

        if (data.status === "started") {
          setStatus("started");
          queryClient.invalidateQueries({ queryKey: ["/api/history"] });
        } else if (data.ready) {
          setStatus("complete");
          setActiveAnalysisUrl(null);
          queryClient.invalidateQueries({ queryKey: ["/api/history"] });
          window.clearTimeout(timeoutId);
          es.close();
          eventSourceRef.current = null;
        } else if (data.timeout) {
          setStatus("timeout");
          setActiveAnalysisUrl(null);
          window.clearTimeout(timeoutId);
          es.close();
          eventSourceRef.current = null;
        }
      } catch (err) {
        console.error("[SSE] Parse error:", err);
      }
    };

    es.onerror = () => {
      console.error("[SSE] connection error - switching to polling");
      es.close();
      eventSourceRef.current = null;
      window.clearTimeout(timeoutId);
      
      setUsePolling(true);
      startPolling(url);
    };
  };

  const startPolling = (url: string) => {
    console.log("[Polling] Starting polling for:", url);
    
    if (pollingIntervalRef.current) {
      window.clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    if (pollingTimeoutRef.current) {
      window.clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    const pollForUpdates = async () => {
      try {
        const response = await apiRequest("GET", "/api/history");
        const history = await response.json() as HistoryItem[];
        
        const matchingItems = history
          .filter(item => item.property_url === url)
          .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());
        
        const matchingItem = matchingItems[0];

        if (matchingItem) {
          console.log("[Polling] Found matching item:", matchingItem);
          
          if (matchingItem.analysis_status === "started") {
            setStatus("started");
            queryClient.invalidateQueries({ queryKey: ["/api/history"] });
          } else if (matchingItem.analysis_status === "complete") {
            setStatus("complete");
            setActiveAnalysisUrl(null);
            queryClient.invalidateQueries({ queryKey: ["/api/history"] });
            
            if (pollingIntervalRef.current) {
              window.clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            if (pollingTimeoutRef.current) {
              window.clearTimeout(pollingTimeoutRef.current);
              pollingTimeoutRef.current = null;
            }
          } else if (matchingItem.analysis_status === "error") {
            setStatus("error");
            setActiveAnalysisUrl(null);
            
            if (pollingIntervalRef.current) {
              window.clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            if (pollingTimeoutRef.current) {
              window.clearTimeout(pollingTimeoutRef.current);
              pollingTimeoutRef.current = null;
            }
          }
        }
      } catch (error) {
        console.error("[Polling] Error fetching history:", error);
      }
    };

    pollForUpdates();
    pollingIntervalRef.current = window.setInterval(pollForUpdates, 3000);

    pollingTimeoutRef.current = window.setTimeout(() => {
      console.warn("[Polling] Timed out waiting for analysis");
      
      if (pollingIntervalRef.current) {
        window.clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      setStatus("timeout");
      setActiveAnalysisUrl(null);
    }, 12 * 60 * 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (pollingIntervalRef.current) {
        window.clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (pollingTimeoutRef.current) {
        window.clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
    };
  }, []);

  const handleAnalyze = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setActiveAnalysisUrl(trimmed);
    setStatus("waiting");
    setUsePolling(false);
    
    if (pollingIntervalRef.current) {
      window.clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      window.clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    
    connectToSSE(trimmed);
    triggerMutation.mutate(trimmed);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold" data-testid="text-hero-title">
              Analyze UK Properties
            </h2>
            <p
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
              data-testid="text-hero-description"
            >
              Enter a Rightmove property URL to get comprehensive analysis
              including pricing, features, location data, and market insights.
            </p>
          </div>

          <div className="space-y-4">
            <PropertyInput onSubmit={handleAnalyze} />
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p data-testid="text-footer">
            Property Analysis Tool - Powered by n8n webhooks
          </p>
        </div>
      </footer>
    </div>
  );
}
