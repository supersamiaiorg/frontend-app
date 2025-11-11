import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AnalyticsTabProps {
  propertyData: {
    bedrooms: number;
    bathrooms: number;
    price: number;
    size: number;
  };
}

export default function AnalyticsTab({ propertyData }: AnalyticsTabProps) {
  const comparisonData = [
    { name: "This Property", value: propertyData.price },
    { name: "Area Average", value: propertyData.price * 1.15 },
    { name: "Similar Properties", value: propertyData.price * 0.95 },
  ];

  const metricsData = [
    { metric: "Bedrooms", value: propertyData.bedrooms },
    { metric: "Bathrooms", value: propertyData.bathrooms },
    { metric: "Size (sq ft)", value: propertyData.size },
  ];

  return (
    <div className="space-y-8 py-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Price Comparison</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Property Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {metricsData.map((item, index) => (
            <div
              key={index}
              className="bg-card border border-card-border rounded-md p-6 text-center"
              data-testid={`metric-${index}`}
            >
              <p className="text-sm text-muted-foreground mb-2">{item.metric}</p>
              <p className="text-3xl font-bold text-primary">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
