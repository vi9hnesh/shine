import LoungeApp from "@/shine/lounge/LoungeApp";
import ShineLayout from "@/components/layout/shine-layout";
import PageTransition from "@/components/layout/page-transition";

export default function LoungePage() {
  return (
    <ShineLayout>
      <PageTransition>
        <LoungeApp />
      </PageTransition>
    </ShineLayout>
  );
}
