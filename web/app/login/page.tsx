"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AuthApi from "@/lib/auth-api";

export default function LoginPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [email, setEmail] = useState("omimondol18@gmail.com");
	const [password, setPassword] = useState("password123");

	const { mutate, isPending, error } = useMutation({
		mutationKey: ["login"],
		mutationFn: AuthApi.login,
		onSuccess: (data) => {
			localStorage.setItem("access_token", data.data.access_token);
			queryClient.invalidateQueries({ queryKey: ["user"] });
			router.push("/");
		},
		onError: (error) => {
			console.error(error);
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !password) return;
		mutate({ email, password });
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-4">
			<div className="w-full max-w-sm space-y-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-foreground">
						Transcriber
					</h1>
					<p className="text-muted-foreground mt-2">
						Real-time voice to text transcription
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
							{error.response?.data.detail}
						</div>
					)}

					<div className="space-y-2">
						<label
							htmlFor="email"
							className="text-sm font-medium text-foreground"
						>
							Email
						</label>
						<Input
							id="email"
							type="email"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={isPending}
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="password"
							className="text-sm font-medium text-foreground"
						>
							Password
						</label>
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							disabled={isPending}
						/>
					</div>

					<Button
						type="submit"
						className="w-full"
						disabled={isPending}
					>
						{isPending ? "Logging in..." : "Login"}
					</Button>
				</form>

				<div className="text-center">
					<p className="text-sm text-muted-foreground">
						Don't have an account?{" "}
						<Link
							href="/signup"
							className="text-primary hover:underline"
						>
							Sign up
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
