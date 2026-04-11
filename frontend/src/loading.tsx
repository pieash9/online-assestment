import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<section className="min-h-[calc(100vh-10rem)] bg-[#f9fafb] px-4 py-14 sm:px-6 lg:px-10">
			<div className="mx-auto w-full max-w-7xl">
				<Card className="rounded-2xl border-[#e5e7eb] bg-white shadow-[0_2.714px_4.397px_rgba(192,192,192,0.03),0_6.863px_11.119px_rgba(192,192,192,0.04),0_13.999px_22.683px_rgba(192,192,192,0.05),0_28.836px_46.722px_rgba(192,192,192,0.06),0_79px_128px_rgba(192,192,192,0.09)]">
					<CardHeader className="flex flex-row items-center gap-3 pb-2">
						<Loader2 className="size-5 animate-spin text-[#6633ff]" />
						<CardTitle className="text-[#334155]">Loading content</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<Skeleton className="h-6 w-2/5 rounded-md" />
						<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
							{Array.from({ length: 4 }).map((_, index) => (
								<div
									key={index}
									className="space-y-3 rounded-xl border border-[#e5e7eb] p-5"
								>
									<Skeleton className="h-5 w-4/5 rounded-md" />
									<Skeleton className="h-4 w-2/3 rounded-md" />
									<Skeleton className="h-10 w-32 rounded-xl" />
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
