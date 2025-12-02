"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";

export function Navbar() {
	const { user, logout, isAuthenticated } = useAuth();

	return (
		<nav className="border-b border-border bg-background">
			<div className="flex items-center justify-between h-16 px-6">
				<Link
					href="/"
					className="text-xl font-semibold text-foreground"
				>
					Transcriber
				</Link>

				<div className="flex items-center">
					<ModeToggle />
					{isAuthenticated && user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="text-foreground"
								>
									{user.email}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									onClick={logout}
									className="cursor-pointer text-destructive"
								>
									Logout
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : null}
				</div>
			</div>
		</nav>
	);
}
