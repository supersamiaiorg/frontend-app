import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PropertyTabsProps {
  children: React.ReactNode;
  defaultTab?: string;
}

export default function PropertyTabs({ children, defaultTab = "overview" }: PropertyTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
        <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
        <TabsTrigger value="details" data-testid="tab-details">Details</TabsTrigger>
        <TabsTrigger value="location" data-testid="tab-location">Location</TabsTrigger>
        <TabsTrigger value="floorplan" data-testid="tab-floorplan">Floorplan Analysis</TabsTrigger>
        <TabsTrigger value="image-condition" data-testid="tab-image-condition">Image Condition</TabsTrigger>
        <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        <TabsTrigger value="photos" data-testid="tab-photos">Photos</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}

export { TabsContent };
