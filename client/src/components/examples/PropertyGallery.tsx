import PropertyGallery from "../PropertyGallery";

export default function PropertyGalleryExample() {
  const mockPhotos = [
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
  ];

  return <PropertyGallery photos={mockPhotos} />;
}
