import DetailsTab from "../DetailsTab";

export default function DetailsTabExample() {
  const mockDetails = {
    property: [
      { label: "Property Type", value: "Flat" },
      { label: "Furnishing", value: "Part furnished" },
      { label: "Council Tax Band", value: "C" },
      { label: "Deposit", value: "£1,847" },
    ],
    utilities: [
      { label: "Heating", value: "Gas central heating" },
      { label: "Parking", value: "On street" },
      { label: "Broadband", value: "Ask agent" },
    ],
  };

  return <DetailsTab details={mockDetails} />;
}
