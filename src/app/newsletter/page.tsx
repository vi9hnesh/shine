"use client";

import ShineLayout from "@/components/layout/shine-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";

const newsletters = [
  {
    id: 1,
    title: "Weekly Update #1",
    date: "Jan 3, 2025",
    summary: "Highlights from this week including product wins and culture moments."
  },
  {
    id: 2,
    title: "Weekly Update #2",
    date: "Jan 10, 2025",
    summary: "Team spotlights and upcoming company events."
  }
];

export default function NewsletterPage() {
  const router = useRouter();

  return (
    <ShineLayout>
      <div className="h-full bg-white font-syne overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="w-full p-4 sm:p-6">
            <div className="flex items-center gap-4 mb-6 border-b-2 border-black pb-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="border-2 border-black hover:bg-gray-100"
              >
                <Home className="w-4 h-4 mr-1" />
                Shine
              </Button>
              <div className="border-2 border-black px-3 py-1 bg-black text-white text-sm font-bold tracking-wider">
                WEEKLY NEWSLETTER
              </div>
            </div>

            <div className="space-y-4">
              {newsletters.map((issue) => (
                <Card key={issue.id} className="border-2 border-black">
                  <CardHeader>
                    <CardTitle>{issue.title}</CardTitle>
                    <CardDescription>{issue.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{issue.summary}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ShineLayout>
  );
}
