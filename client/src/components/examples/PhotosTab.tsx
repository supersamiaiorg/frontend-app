import PhotosTab from "../PhotosTab";

export default function PhotosTabExample() {
  const mockPhotos = Array.from({ length: 8 }, (_, i) => ({
    url: `https://images.unsplash.com/photo-${1560448204 + i}-e02f11c3d0e2?w=400&h=400`,
    thumbnailUrl: `https://images.unsplash.com/photo-${1560448204 + i}-e02f11c3d0e2?w=135&h=100`,
    maxSizeUrl: `https://images.unsplash.com/photo-${1560448204 + i}-e02f11c3d0e2?w=1200`,
  }));

  return <PhotosTab photos={mockPhotos} />;
}
