"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";
import AuthApi from "@/lib/auth-api";

export function Navbar() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { data: userData, isSuccess: isAuthenticated } = useQuery({
		queryKey: ["user"],
		queryFn: AuthApi.me,
		retry: false,
	});

	const logout = () => {
		localStorage.removeItem("access_token");
		queryClient.invalidateQueries({ queryKey: ["user"] });
		router.push("/login");
	};

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
					<AnimatedThemeToggler />
					{isAuthenticated && userData?.data ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="text-foreground"
								>
									{userData.data.email}
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
