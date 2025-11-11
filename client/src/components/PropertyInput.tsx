import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PropertyInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

export default function PropertyInput({ onSubmit, isLoading }: PropertyInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="url"
            placeholder="Enter Rightmove property URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-10 h-12"
            disabled={isLoading}
            data-testid="input-property-url"
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || !url.trim()}
          className="h-12 px-6"
          data-testid="button-analyze"
        >
          {isLoading ? "Analyzing..." : "Analyze"}
        </Button>
      </div>
    </form>
  );
}
