import ShineLayout from "@/components/layout/shine-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

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
  return (
    <ShineLayout>
      <header className="border-b-2 border-black p-4 bg-white">
        <h1 className="text-xl font-bold">Weekly Newsletter</h1>
      </header>
      <div className="p-6 space-y-4">
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
    </ShineLayout>
  );
}
