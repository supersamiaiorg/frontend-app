import LocationTab from "../LocationTab";

export default function LocationTabExample() {
  const mockLocation = {
    latitude: 51.56123,
    longitude: -0.10855,
    mapPreviewUrl: "https://media.rightmove.co.uk/map/_generate?width=768&height=347&zoomLevel=15&latitude=51.56123&longitude=-0.10855&signature=Bxs02lWptIN4FyKprocO8l4WIBA=",
  };

  const mockStations = [
    { station: "Arsenal Station", distance: 0.2, type: "2" },
    { station: "Finsbury Park Station", distance: 0.3, type: "1,2" },
    { station: "Drayton Park Station", distance: 0.6, type: "1" },
  ];

  return (
    <LocationTab
      location={mockLocation}
      stations={mockStations}
      postcode="N7 7JP"
    />
  );
}
