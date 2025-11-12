import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import PropertyInput from "@/components/PropertyInput";
import StatusBadge from "@/components/StatusBadge";
import PropertyGallery from "@/components/PropertyGallery";
import PropertyHeader from "@/components/PropertyHeader";
import PropertyTabs, { TabsContent } from "@/components/PropertyTabs";
import OverviewTab from "@/components/OverviewTab";
import DetailsTab from "@/components/DetailsTab";
import LocationTab from "@/components/LocationTab";
import FloorplanAnalysisTab from "@/components/FloorplanAnalysisTab";
import ImageConditionTab from "@/components/ImageConditionTab";
import AnalyticsTab from "@/components/AnalyticsTab";
import PhotosTab from "@/components/PhotosTab";
import type { NormalizedResult } from "@shared/schema";

type AnalysisStatus = "waiting" | "analyzing" | "complete" | "error" | "timeout";

export default function Home() {
  const [location, navigate] = useLocation();
  const [status, setStatus] = useState<AnalysisStatus | null>(null);
  const [propertyUrl, setPropertyUrl] = useState<string>("");
  const [superId, setSuperId] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const triggerMutation = useMutation({
    mutationFn: async (url: string) => {
      return apiRequest("POST", "/api/trigger", { property_url: url });
    },
    onSuccess: () => {
      setStatus("analyzing");
      connectToSSE();
    },
    onError: (error) => {
      console.error("Trigger error:", error);
      setStatus("error");
    }
  });

  const { data: result } = useQuery<NormalizedResult>({
    queryKey: ["/api/results", superId, propertyUrl],
    enabled: !!superId || (!!propertyUrl && status === "complete"),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (superId) params.set("super_id", superId);
      else if (propertyUrl) params.set("property_url", propertyUrl);
      
      const response = await fetch(`/api/results?${params}`);
      if (!response.ok) throw new Error("Failed to fetch results");
      return response.json();
    }
  });

  const connectToSSE = () => {
    if (!propertyUrl) return;

    const params = new URLSearchParams({ property_url: propertyUrl });
    const eventSource = new EventSource(`/api/stream?${params}`);
    eventSourceRef.current = eventSource;

    const timeoutId = setTimeout(() => {
      setStatus("timeout");
      eventSource.close();
    }, 12 * 60 * 1000);

    eventSource.onmessage = (event) => {
      if (event.data.startsWith(":")) return;
      
      try {
        const data = JSON.parse(event.data);
        if (data.ready && data.super_id) {
          setSuperId(data.super_id);
          setStatus("complete");
          queryClient.invalidateQueries({ queryKey: ['/api/history'] });
          clearTimeout(timeoutId);
          eventSource.close();
        } else if (data.timeout) {
          setStatus("timeout");
          clearTimeout(timeoutId);
        }
      } catch (error) {
        console.error("SSE parse error:", error);
      }
    };

    eventSource.onerror = () => {
      console.error("SSE connection error");
      clearTimeout(timeoutId);
      eventSource.close();
    };
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1]);
    const urlSuperId = searchParams.get('id');
    
    if (urlSuperId && urlSuperId !== superId) {
      setSuperId(urlSuperId);
      setPropertyUrl("");
      setStatus("complete");
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    } else if (!urlSuperId && superId && status === "complete" && !propertyUrl) {
      setSuperId(null);
      setStatus(null);
    }
  }, [location]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleAnalyze = (url: string) => {
    navigate('/');
    setPropertyUrl(url);
    setSuperId(null);
    setStatus("waiting");
    triggerMutation.mutate(url);
  };

  const mockPropertyData = result ? transformResultToMockData(result) : null;
  const isActiveAnalysis = status === "waiting" || status === "analyzing";

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold" data-testid="text-hero-title">Analyze UK Properties</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto" data-testid="text-hero-description">
              Enter a Rightmove property URL to get comprehensive analysis including pricing, features, location data, and market insights.
            </p>
          </div>

          <div className="space-y-4">
            <PropertyInput onSubmit={handleAnalyze} />
            {isActiveAnalysis && (
              <div className="flex justify-center">
                <StatusBadge status={status!} />
              </div>
            )}
          </div>

          {mockPropertyData && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <PropertyGallery photos={mockPropertyData.photos} />
              
              <PropertyHeader {...mockPropertyData.header} />

              <PropertyTabs>
                <TabsContent value="overview">
                  <OverviewTab {...mockPropertyData.overview} />
                </TabsContent>
                <TabsContent value="details">
                  <DetailsTab details={mockPropertyData.details} />
                </TabsContent>
                <TabsContent value="location">
                  <LocationTab {...mockPropertyData.location} />
                </TabsContent>
                <TabsContent value="floorplan">
                  <FloorplanAnalysisTab floorplanData={mockPropertyData.floorplan} />
                </TabsContent>
                <TabsContent value="image-condition">
                  <ImageConditionTab imageConditionData={mockPropertyData.imageCondition} />
                </TabsContent>
                <TabsContent value="analytics">
                  <AnalyticsTab propertyData={mockPropertyData.analytics} />
                </TabsContent>
                <TabsContent value="photos">
                  <PhotosTab photos={mockPropertyData.photos} />
                </TabsContent>
              </PropertyTabs>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p data-testid="text-footer">Property Analysis Tool - Powered by n8n webhooks</p>
        </div>
      </footer>
    </div>
  );
}

function transformResultToMockData(result: NormalizedResult) {
  const snapshot = result.data_captured?.snapshot;
  
  if (!snapshot) {
    return null;
  }

  return {
    photos: snapshot.media?.photos?.map(p => ({
      url: p.url,
      thumbnailUrl: p.thumb ?? p.url,
      maxSizeUrl: p.url,
    })) ?? [],
    header: {
      address: snapshot.address ?? "Unknown Address",
      price: { 
        primary: snapshot.price?.primary ?? "N/A", 
        secondary: snapshot.price?.secondary ?? ""
      },
      bedrooms: snapshot.bedrooms ?? 0,
      bathrooms: snapshot.bathrooms ?? 0,
      size: { 
        primary: snapshot.size?.primary ?? "N/A", 
        secondary: snapshot.size?.secondary ?? ""
      },
      propertyType: snapshot.transactionType ?? "Property",
      status: { 
        available: !snapshot.statusLabel, 
        label: snapshot.statusLabel ?? "AVAILABLE" 
      },
    },
    overview: {
      description: snapshot.html?.fullDescription ?? "No description available",
      keyFeatures: snapshot.keyFeatures ?? [],
      updateReason: undefined,
    },
    details: {
      property: [
        { label: "Property Type", value: snapshot.transactionType ?? "N/A" },
        { label: "Channel", value: snapshot.channel ?? "N/A" },
        { label: "Bedrooms", value: String(snapshot.bedrooms ?? "N/A") },
        { label: "Bathrooms", value: String(snapshot.bathrooms ?? "N/A") },
      ],
      utilities: snapshot.agent ? [
        { label: "Agent", value: snapshot.agent.displayName ?? "N/A" },
        { label: "Phone", value: snapshot.agent.telephone ?? "N/A" },
      ] : [],
    },
    location: {
      location: {
        latitude: snapshot.location?.latitude ?? 0,
        longitude: snapshot.location?.longitude ?? 0,
        mapPreviewUrl: snapshot.media?.mapPreviewUrl ?? undefined,
      },
      stations: snapshot.stations?.map(s => ({
        station: s.name,
        distance: s.distance,
        type: "1",
      })) ?? [],
      postcode: snapshot.postcode ?? "N/A",
    },
    floorplan: {
      inline_csv: result.floorplan?.inline_csv ?? null,
      csv_url: result.floorplan?.csv_url ?? null,
      total_area_csv_url: result.floorplan?.total_area_csv_url ?? null,
      json_url: result.floorplan?.json_url ?? null,
      labelme_side_by_side_url: result.floorplan?.labelme_side_by_side_url ?? null,
    },
    imageCondition: result.image_condition,
    analytics: {
      bedrooms: snapshot.bedrooms ?? 0,
      bathrooms: snapshot.bathrooms ?? 0,
      price: snapshot.price?.primary ? parseFloat(snapshot.price.primary.replace(/[^0-9.]/g, '')) : 0,
      size: snapshot.size?.primary ? parseFloat(snapshot.size.primary.replace(/[^0-9.]/g, '')) : 0,
    },
  };
}
