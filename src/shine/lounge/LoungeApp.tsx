"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { matImages } from "./mat-images";

export default function LoungeApp() {
  const router = useRouter();
  const [images, setImages] = useState(matImages);

  const shuffleImages = () => {
    setImages((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  return (
    <div className="h-full bg-white font-syne overflow-hidden">
      <div className="h-full overflow-y-auto">
        <div className="w-full p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 border-b-2 border-black pb-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="border-2 border-black hover:bg-gray-100"
            >
              <Home className="w-4 h-4 mr-1" />
              Shine
            </Button>
            <div className="border-2 border-black px-3 py-1 bg-black text-white text-sm font-bold tracking-wider">
              SILENT LOUNGE
            </div>
            <Button
              variant="ghost"
              onClick={shuffleImages}
              className="border-2 border-black hover:bg-gray-100 ml-auto"
            >
              Shuffle
            </Button>
          </div>

          {/* Gallery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img) => (
              <Card
                key={img.src}
                className="border-2 border-black bg-white"
                style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-base font-bold text-black">
                    {img.alt}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 border-t border-black">
                  <img src={img.src} alt={img.alt} className="w-full h-48 object-cover mb-4" />
                  <p className="text-sm text-gray-700">{img.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
