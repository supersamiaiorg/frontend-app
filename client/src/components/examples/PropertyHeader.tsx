import PropertyHeader from "../PropertyHeader";

export default function PropertyHeaderExample() {
  return (
    <PropertyHeader
      address="Isledon Road, N7 7LP"
      price={{ primary: "£1,600 pcm", secondary: "£369 pw" }}
      bedrooms={1}
      bathrooms={1}
      size={{ primary: "370 sq ft", secondary: "34 sq m" }}
      propertyType="Flat"
      status={{ available: false, label: "OFF THE MARKET" }}
    />
  );
}
