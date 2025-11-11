import PropertyTabs, { TabsContent } from "../PropertyTabs";

export default function PropertyTabsExample() {
  return (
    <PropertyTabs>
      <TabsContent value="overview">
        <p className="text-muted-foreground">Overview content goes here</p>
      </TabsContent>
      <TabsContent value="details">
        <p className="text-muted-foreground">Details content goes here</p>
      </TabsContent>
      <TabsContent value="location">
        <p className="text-muted-foreground">Location content goes here</p>
      </TabsContent>
      <TabsContent value="analytics">
        <p className="text-muted-foreground">Analytics content goes here</p>
      </TabsContent>
      <TabsContent value="photos">
        <p className="text-muted-foreground">Photos content goes here</p>
      </TabsContent>
    </PropertyTabs>
  );
}
