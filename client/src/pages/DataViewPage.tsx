import useSWR from "swr";
import { useParams, Link } from "wouter";
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
import { Loader2, ExternalLink, Building2 } from "lucide-react";

const fetcher = (url: string) =>
    fetch(url).then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
    });

export default function DataViewPage({ superId }: { superId: string }) {
    const { data, error, isLoading } = useSWR<NormalizedResult>(
        `/api/data-view/${superId}`,
        fetcher,
    );

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center p-8 max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Property Not Found</h1>
                    <p className="text-slate-400 mb-6">
                        We couldn't find a property with ID: <code className="text-blue-400">{superId}</code>
                    </p>
                    <Link href="/">
                        <a className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            ← Back to Home
                        </a>
                    </Link>
                </div>
            </div>
        );
    }

    if (isLoading || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-white text-lg">Loading property data...</p>
                    <p className="text-slate-400 text-sm mt-2">ID: {superId}</p>
                </div>
            </div>
        );
    }

    const propertyData = transformResultToDisplayData(data);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Public Header */}
            <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg text-slate-900 dark:text-white">
                                    SuperSami
                                </h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Property Analysis Report
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                                {superId}
                            </span>
                            {data.key.property_url && (
                                <a
                                    href={data.key.property_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    View Original <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {propertyData ? (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Photo Gallery */}
                        <PropertyGallery photos={propertyData.photos} />

                        {/* Property Header */}
                        <PropertyHeader {...propertyData.header} />

                        {/* Status Banner */}
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-400">
                                Analysis Complete
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">
                                Generated: {new Date(data.key.received_at).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>

                        {/* Tabs */}
                        <PropertyTabs>
                            <TabsContent value="overview">
                                <OverviewTab {...propertyData.overview} />
                            </TabsContent>
                            <TabsContent value="details">
                                <DetailsTab details={propertyData.details} />
                            </TabsContent>
                            <TabsContent value="location">
                                <LocationTab {...propertyData.location} />
                            </TabsContent>
                            <TabsContent value="floorplan">
                                <FloorplanAnalysisTab floorplanData={propertyData.floorplan} />
                            </TabsContent>
                            <TabsContent value="image-condition">
                                <ImageConditionTab imageConditionData={propertyData.imageCondition} />
                            </TabsContent>
                            <TabsContent value="analytics">
                                <AnalyticsTab propertyData={propertyData.analytics} />
                            </TabsContent>
                            <TabsContent value="photos">
                                <PhotosTab photos={propertyData.photos} />
                            </TabsContent>
                        </PropertyTabs>
                    </div>
                ) : (
                    <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                        <div className="font-medium mb-2 text-slate-900 dark:text-white">
                            Details not available yet
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            We received this analysis, but couldn't build a snapshot to render the UI.
                        </p>
                        <pre className="max-h-80 overflow-auto text-xs bg-slate-100 dark:bg-slate-900 p-4 rounded-lg">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-8 mt-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                SuperSami
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Powered by AI-driven property analysis
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function transformResultToDisplayData(result: NormalizedResult) {
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
