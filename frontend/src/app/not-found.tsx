import { SearchX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
	return (
		<section className="min-h-[calc(100vh-10rem)] bg-[#f9fafb] px-4 py-14 sm:px-6 lg:px-10">
			<div className="mx-auto w-full max-w-3xl">
				<Card className="rounded-2xl border-[#e5e7eb] bg-white text-center shadow-[0_2.714px_4.397px_rgba(192,192,192,0.03),0_6.863px_11.119px_rgba(192,192,192,0.04),0_13.999px_22.683px_rgba(192,192,192,0.05),0_28.836px_46.722px_rgba(192,192,192,0.06),0_79px_128px_rgba(192,192,192,0.09)]">
					<CardHeader className="items-center pb-2">
						<div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-[#673fed]/10 text-[#6633ff]">
							<SearchX className="size-6" />
						</div>
						<CardTitle className="text-2xl text-[#334155]">Page not found</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<p className="text-base text-[#64748b]">
							The page you are trying to open does not exist or may have been moved.
						</p>
						<div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
							<Button asChild className="h-11 rounded-xl bg-[#6633ff] px-7 hover:bg-[#5b2ef0]">
								<Link href="/dashboard">Go to Dashboard</Link>
							</Button>
							<Button asChild className="h-11 rounded-xl px-7" variant="outline">
								<Link href="/">Back to Home</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
