import JournalApp from "@/shine/journal/JournalApp";
import ShineLayout from "@/components/layout/shine-layout";
import PageTransition from "@/components/layout/page-transition";

export default function JournalPage() {
  return (
    <ShineLayout>
      <PageTransition>
        <JournalApp />
      </PageTransition>
    </ShineLayout>
  );
}