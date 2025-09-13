"use client";

import { useState } from "react";
import ShineLayout from "@/components/layout/shine-layout";
import PageTransition from "@/components/layout/page-transition";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  },
];

export default function NewsletterPage() {
  const router = useRouter();
  const [email, setEmail] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("newsletter-email") || "";
    }
    return "";
  });
  const [subscribed, setSubscribed] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("newsletter-email");
    }
    return false;
  });

  const handleSubscribe = () => {
    if (email.trim().length === 0) return;
    localStorage.setItem("newsletter-email", email.trim());
    setSubscribed(true);
  };

  return (
    <ShineLayout>
      <PageTransition>
        <div className="h-full bg-white font-syne overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="w-full p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 border-b-2 border-black pb-4">
              <div className="flex items-center gap-2">
                <div className="flex border-2 border-black" style={{ borderRadius: '0px' }}>
                  <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="border-r-2 border-black rounded-none px-3"
                  >
                    <Home className="w-4 h-4 mr-1" />
                    Shine
                  </Button>
                </div>
                <div className="border-2 border-black px-3 py-1 bg-black text-white text-sm font-bold tracking-wider">
                  WEEKLY NEWSLETTER
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle>Subscribe</CardTitle>
                  <CardDescription>Get the latest updates straight to your inbox.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {subscribed ? (
                    <p className="text-sm text-gray-700">Subscribed as {email}</p>
                  ) : (
                    <>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="border-2 border-black"
                      />
                      <Button onClick={handleSubscribe} className="border-2 border-black">
                        Subscribe
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

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
      </PageTransition>
    </ShineLayout>
  );
}
