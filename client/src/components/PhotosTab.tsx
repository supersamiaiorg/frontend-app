interface Photo {
  url: string;
  thumbnailUrl: string;
  maxSizeUrl: string;
}

interface PhotosTabProps {
  photos: Photo[];
}

export default function PhotosTab({ photos }: PhotosTabProps) {
  if (!photos || photos.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No photos available
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <button
            key={index}
            className="aspect-square overflow-hidden rounded-md hover-elevate border border-border"
            onClick={() => console.log("View photo:", index)}
            data-testid={`photo-${index}`}
          >
            <img
              src={photo.url}
              alt={`Property photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
