import AuthGuard from "@/components/dashboard/AuthGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { AiStatusProvider } from "@/lib/ai-status-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AiStatusProvider>
        <DashboardShell>{children}</DashboardShell>
      </AiStatusProvider>
    </AuthGuard>
  );
}
