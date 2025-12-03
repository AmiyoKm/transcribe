"use client";

import type { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

export function AppLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex flex-col h-screen">
			<Navbar />
			<div className="flex flex-1 overflow-hidden">
				<Sidebar />
				<main className="flex-1 overflow-y-auto">{children}</main>
			</div>
		</div>
	);
}
