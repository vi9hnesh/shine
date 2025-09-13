import ReaderApp from "@/shine/reads/ReaderApp";
import ShineLayout from "@/components/layout/shine-layout";
import PageTransition from "@/components/layout/page-transition";

export default function ReadsPage() {
  return (
    <ShineLayout>
      <PageTransition>
        <ReaderApp />
      </PageTransition>
    </ShineLayout>
  );
}