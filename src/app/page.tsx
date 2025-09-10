import { EnhancedDashboard } from "@/components/EnhancedDashboard";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/SessionProvider";

export default function Home() {
	return (
		<SessionProvider>
			<>
				<EnhancedDashboard />
				<Toaster />
			</>
		</SessionProvider>
	);
}
