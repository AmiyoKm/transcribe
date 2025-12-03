"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AxiosResponse } from "axios";

export default function LoginPage() {
	const router = useRouter();
	const { login } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			await login(email, password);
			router.push("/");
		} catch (err: unknown) {
			
			const response = (err as any)?.response;
			
			if (response && response.status === 404) {
				setError("User not found, Please create an account");
			} else if (response && response.status === 401) {
				setError("Invalid credentials");
			} else {
				setError(err instanceof Error ? err.message : "Login failed");
			}
		} finally {
			setIsLoading(false);
		}
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
							{error}
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
							disabled={isLoading}
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
							disabled={isLoading}
						/>
					</div>

					<Button
						type="submit"
						className="w-full"
						disabled={isLoading}
					>
						{isLoading ? "Logging in..." : "Login"}
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
