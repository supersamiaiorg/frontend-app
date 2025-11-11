interface DetailsTabProps {
  details: {
    [category: string]: Array<{ label: string; value: string }>;
  };
}

export default function DetailsTab({ details }: DetailsTabProps) {
  return (
    <div className="space-y-8 py-6">
      {Object.entries(details).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-4 capitalize">{category}</h3>
          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full">
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-border last:border-b-0"
                    data-testid={`row-detail-${index}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-muted-foreground bg-muted/50 w-1/3">
                      {item.label}
                    </td>
                    <td className="px-4 py-3 text-sm">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
