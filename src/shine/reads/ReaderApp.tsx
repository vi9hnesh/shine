"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReaderApp() {
  const router = useRouter();

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
              CURATED READS
            </div>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-black bg-white" style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}>
              <CardHeader className="text-center">
                <div className="p-4 border-2 border-black bg-white inline-block mx-auto mb-4">
                  <FileText className="w-12 h-12 text-black" />
                </div>
                <CardTitle className="text-3xl font-bold text-black font-playfair">
                  KNOWLEDGE & INSIGHTS
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg text-gray-700 mb-8">
                  Warrn blog posts and industry insights for growth.
                </p>
                <div className="border-t-2 border-black pt-8">
                  <p className="text-gray-600">
                    Feature coming soon. Curated articles from the Warrn blog and industry thought leaders.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 