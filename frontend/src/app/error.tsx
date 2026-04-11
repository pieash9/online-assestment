"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ErrorPageProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function Error({ error, reset }: ErrorPageProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<section className="min-h-[calc(100vh-10rem)] bg-[#f9fafb] px-4 py-14 sm:px-6 lg:px-10">
			<div className="mx-auto w-full max-w-3xl">
				<Card className="rounded-2xl border-[#e5e7eb] bg-white shadow-[0_2.714px_4.397px_rgba(192,192,192,0.03),0_6.863px_11.119px_rgba(192,192,192,0.04),0_13.999px_22.683px_rgba(192,192,192,0.05),0_28.836px_46.722px_rgba(192,192,192,0.06),0_79px_128px_rgba(192,192,192,0.09)]">
					<CardHeader className="pb-2">
						<CardTitle className="text-2xl text-[#334155]">Something went wrong</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<Alert className="border-amber-300/70 bg-amber-50 text-amber-950">
							<AlertTriangle className="size-4" />
							<AlertTitle>Unexpected error</AlertTitle>
							<AlertDescription>
								We could not complete this request. You can try again now or return to your
								dashboard.
							</AlertDescription>
						</Alert>

						<div className="flex flex-col gap-3 sm:flex-row">
							<Button className="h-11 rounded-xl bg-[#6633ff] px-7 hover:bg-[#5b2ef0]" onClick={reset}>
								Try again
							</Button>
							<Button asChild className="h-11 rounded-xl px-7" variant="outline">
								<Link href="/dashboard">Go to Dashboard</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
