import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Photo {
  url: string;
  thumbnailUrl: string;
  maxSizeUrl: string;
}

interface PropertyGalleryProps {
  photos: Photo[];
}

export default function PropertyGallery({ photos }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full aspect-[16/9] bg-muted flex items-center justify-center rounded-md">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full space-y-4">
      <div className="relative aspect-[16/9] bg-muted rounded-md overflow-hidden group">
        <img
          src={photos[currentIndex].url}
          alt={`Property image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          data-testid={`img-property-${currentIndex}`}
        />
        
        {photos.length > 1 && (
          <>
            <Button
              size="icon"
              variant="secondary"
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToPrevious}
              data-testid="button-previous-image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToNext}
              data-testid="button-next-image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-md text-sm">
              {currentIndex + 1} / {photos.length}
            </div>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all hover-elevate ${
                index === currentIndex ? "border-primary" : "border-transparent"
              }`}
              data-testid={`button-thumbnail-${index}`}
            >
              <img
                src={photo.thumbnailUrl}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
