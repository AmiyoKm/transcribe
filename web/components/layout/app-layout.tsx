"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import AuthApi from "@/lib/auth-api";

export function AppLayout({ children }: { children: ReactNode }) {
	const router = useRouter();

	const {
		data: userData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["user"],
		queryFn: AuthApi.me,
		retry: 1,
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		if (!isLoading && isError) {
			router.replace("/login");
		}
	}, [isLoading, isError, router]);

	if (isLoading || isError) {
		return (
			<div className="flex h-screen w-full items-center justify-center bg-background">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	if (!userData) {
		return null;
	}

	return (
		<div className="flex h-screen bg-background text-foreground">
			<Sidebar />
			<div className="flex flex-col flex-1 overflow-hidden">
				<Navbar />
				<main className="flex-1 overflow-y-auto">{children}</main>
			</div>
		</div>
	);
}
