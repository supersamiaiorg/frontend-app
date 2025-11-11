import OverviewTab from "../OverviewTab";

export default function OverviewTabExample() {
  return (
    <OverviewTab
      description="A charming one-bedroom property set on the first floor of this period conversion, located moments from Finsbury Park station for easy access to and from central London. <br /><br />This property features a spacious open plan living/kitchen area, modern kitchen, a modern three-piece bathroom, wooden floor throughout, ample storage, high ceilings and gas central heating."
      keyFeatures={[
        "One Bedroom",
        "Open Plan",
        "Period Conversion",
        "Good Transport Links",
        "EPC Rating: C",
        "Available Now",
      ]}
      updateReason="Reduced on 07/12/2024"
    />
  );
}
