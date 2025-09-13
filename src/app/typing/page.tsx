import TypingApp from "@/shine/typing/TypingApp";
import ShineLayout from "@/components/layout/shine-layout";
import PageTransition from "@/components/layout/page-transition";

export default function TypingPage() {
  return (
    <ShineLayout
    >
      <PageTransition>
        <TypingApp />
      </PageTransition>
    </ShineLayout>
  );
}