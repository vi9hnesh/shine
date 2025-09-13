import PomodoroApp from "@/shine/pomodoro/PomodoroApp";
import ShineLayout from "@/components/layout/shine-layout";
import PageTransition from "@/components/layout/page-transition";

export default function PomodoroPage() {
  return (
    <ShineLayout>
      <PageTransition>
        <PomodoroApp />
      </PageTransition>
    </ShineLayout>
  );
}