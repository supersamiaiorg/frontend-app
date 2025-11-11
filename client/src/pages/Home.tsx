import { useState } from "react";
import PropertyInput from "@/components/PropertyInput";
import StatusBadge from "@/components/StatusBadge";
import PropertyGallery from "@/components/PropertyGallery";
import PropertyHeader from "@/components/PropertyHeader";
import PropertyTabs, { TabsContent } from "@/components/PropertyTabs";
import OverviewTab from "@/components/OverviewTab";
import DetailsTab from "@/components/DetailsTab";
import LocationTab from "@/components/LocationTab";
import AnalyticsTab from "@/components/AnalyticsTab";
import PhotosTab from "@/components/PhotosTab";

export default function Home() {
  const [status, setStatus] = useState<"analyzing" | "complete" | "error" | "waiting" | null>(null);
  const [hasResults, setHasResults] = useState(false);

  const handleAnalyze = (url: string) => {
    console.log("Analyzing property:", url);
    setStatus("analyzing");
    setHasResults(false);
    
    setTimeout(() => {
      setStatus("complete");
      setHasResults(true);
    }, 2000);
  };

  const mockPropertyData = {
    photos: [
      {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=450",
        thumbnailUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=135&h=100",
        maxSizeUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
      },
      {
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=450",
        thumbnailUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=135&h=100",
        maxSizeUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
      },
      {
        url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=450",
        thumbnailUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=135&h=100",
        maxSizeUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200",
      },
      {
        url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=450",
        thumbnailUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=135&h=100",
        maxSizeUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
      },
    ],
    header: {
      address: "Isledon Road, N7 7LP",
      price: { primary: "£1,600 pcm", secondary: "£369 pw" },
      bedrooms: 1,
      bathrooms: 1,
      size: { primary: "370 sq ft", secondary: "34 sq m" },
      propertyType: "Flat",
      status: { available: false, label: "OFF THE MARKET" },
    },
    overview: {
      description: "A charming one-bedroom property set on the first floor of this period conversion, located moments from Finsbury Park station for easy access to and from central London.\n\nThis property features a spacious open plan living/kitchen area, modern kitchen, a modern three-piece bathroom, wooden floor throughout, ample storage, high ceilings and gas central heating. With large windows facing both west and east for plenty of natural light throughout the day.",
      keyFeatures: [
        "One Bedroom",
        "Open Plan",
        "Period Conversion",
        "Good Transport Links",
        "Comprising 370sqft/34.4sqm",
        "EPC Rating: C",
        "Offered Part Furnished",
        "Available Now",
      ],
      updateReason: "Reduced on 07/12/2024",
    },
    details: {
      property: [
        { label: "Property Type", value: "Flat" },
        { label: "Furnishing", value: "Part furnished" },
        { label: "Council Tax Band", value: "C" },
        { label: "Deposit", value: "£1,847" },
        { label: "Min Tenancy Length", value: "Ask agent" },
        { label: "Let Type", value: "Long term" },
      ],
      utilities: [
        { label: "Heating", value: "Gas central heating" },
        { label: "Parking", value: "On street" },
        { label: "Broadband", value: "Ask agent" },
        { label: "Water", value: "Ask agent" },
        { label: "Electricity", value: "Ask agent" },
      ],
    },
    location: {
      location: {
        latitude: 51.56123,
        longitude: -0.10855,
        mapPreviewUrl: "https://media.rightmove.co.uk/map/_generate?width=768&height=347&zoomLevel=15&latitude=51.56123&longitude=-0.10855&signature=Bxs02lWptIN4FyKprocO8l4WIBA=",
      },
      stations: [
        { station: "Arsenal Station", distance: 0.2, type: "2" },
        { station: "Finsbury Park Station", distance: 0.3, type: "1,2" },
        { station: "Drayton Park Station", distance: 0.6, type: "1" },
      ],
      postcode: "N7 7JP",
    },
    analytics: {
      bedrooms: 1,
      bathrooms: 1,
      price: 1600,
      size: 370,
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-4">
          <h1 className="text-xl font-bold">Property Analysis</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Analyze UK Properties</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Enter a Rightmove property URL to get comprehensive analysis including pricing, features, location data, and market insights.
            </p>
          </div>

          <div className="space-y-4">
            <PropertyInput onSubmit={handleAnalyze} isLoading={status === "analyzing"} />
            {status && (
              <div className="flex justify-center">
                <StatusBadge status={status} />
              </div>
            )}
          </div>

          {hasResults && (
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
          <p>Property Analysis Tool - Powered by n8n webhooks</p>
        </div>
      </footer>
    </div>
  );
}
