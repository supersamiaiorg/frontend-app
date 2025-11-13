import useSWR from "swr";
import { Link, useLocation } from "wouter";
import type { NormalizedResult } from "@shared/schema";

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

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to load");
    return r.json();
  });

export default function PropertyDetail({ superId }: { superId: string }) {
  const [, navigate] = useLocation();
  const { data, error } = useSWR<NormalizedResult>(
    `/api/results?super_id=${superId}`,
    fetcher,
  );

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500 font-medium mb-3">
          Failed to load property.
        </div>
        <Link href="/">
          <a className="underline">← Back to New Analysis</a>
        </Link>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8">Loading…</div>;
  }

  const mock = transformResultToMockData(data);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase opacity-60">
          Status: {data.analysis_status ?? "unknown"}
        </div>
        <Link href="/">
          <a className="text-sm underline">← New analysis</a>
        </Link>
      </div>

      {mock ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          <PropertyGallery photos={mock.photos} />
          <PropertyHeader {...mock.header} />
          <PropertyTabs>
            <TabsContent value="overview">
              <OverviewTab {...mock.overview} />
            </TabsContent>
            <TabsContent value="details">
              <DetailsTab details={mock.details} />
            </TabsContent>
            <TabsContent value="location">
              <LocationTab {...mock.location} />
            </TabsContent>
            <TabsContent value="floorplan">
              <FloorplanAnalysisTab floorplanData={mock.floorplan} />
            </TabsContent>
            <TabsContent value="image-condition">
              <ImageConditionTab imageConditionData={mock.imageCondition} />
            </TabsContent>
            <TabsContent value="analytics">
              <AnalyticsTab propertyData={mock.analytics} />
            </TabsContent>
            <TabsContent value="photos">
              <PhotosTab photos={mock.photos} />
            </TabsContent>
          </PropertyTabs>
        </div>
      ) : (
        <div className="p-4 border rounded">
          <div className="font-medium mb-2">Details not available yet</div>
          <p className="text-sm opacity-70">
            We saved this analysis, but couldn’t build a snapshot to render the
            UI.
          </p>
          <pre className="mt-3 max-h-80 overflow-auto text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function transformResultToMockData(result: NormalizedResult) {
  const snapshot = result.data_captured?.snapshot;
  if (!snapshot) return null;

  return {
    photos:
      snapshot.media?.photos?.map((p) => ({
        url: p.url,
        thumbnailUrl: p.thumb ?? p.url,
        maxSizeUrl: p.url,
      })) ?? [],
    header: {
      address: snapshot.address ?? "Unknown Address",
      price: {
        primary: snapshot.price?.primary ?? "N/A",
        secondary: snapshot.price?.secondary ?? "",
      },
      bedrooms: snapshot.bedrooms ?? 0,
      bathrooms: snapshot.bathrooms ?? 0,
      size: {
        primary: snapshot.size?.primary ?? "N/A",
        secondary: snapshot.size?.secondary ?? "",
      },
      propertyType: snapshot.transactionType ?? "Property",
      status: {
        available: !snapshot.statusLabel,
        label: snapshot.statusLabel ?? "AVAILABLE",
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
      utilities: snapshot.agent
        ? [
            { label: "Agent", value: snapshot.agent.displayName ?? "N/A" },
            { label: "Phone", value: snapshot.agent.telephone ?? "N/A" },
          ]
        : [],
    },
    location: {
      location: {
        latitude: snapshot.location?.latitude ?? 0,
        longitude: snapshot.location?.longitude ?? 0,
        mapPreviewUrl: snapshot.media?.mapPreviewUrl ?? undefined,
      },
      stations:
        snapshot.stations?.map((s) => ({
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
      labelme_side_by_side_url:
        result.floorplan?.labelme_side_by_side_url ?? null,
    },
    imageCondition: result.image_condition,
    analytics: {
      bedrooms: snapshot.bedrooms ?? 0,
      bathrooms: snapshot.bathrooms ?? 0,
      price: snapshot.price?.primary
        ? parseFloat(snapshot.price.primary.replace(/[^0-9.]/g, ""))
        : 0,
      size: snapshot.size?.primary
        ? parseFloat(snapshot.size.primary.replace(/[^0-9.]/g, ""))
        : 0,
    },
  };
}
