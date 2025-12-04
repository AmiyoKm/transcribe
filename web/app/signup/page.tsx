"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AuthApi from "@/lib/auth-api";

export default function SignupPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");

	const { mutate, isPending } = useMutation({
		mutationKey: ["signup"],
		mutationFn: AuthApi.register,
		onSuccess: (data) => {
			localStorage.setItem("access_token", data.data.access_token);
			queryClient.invalidateQueries({ queryKey: ["user"] });
			router.push("/");
		},
		onError: (err) => {
			console.error(err);
			setError(err.response?.data.detail || "An error occurred");
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		mutate({
			email,
			password,
		});
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-4">
			<div className="w-full max-w-sm space-y-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-foreground">
						Transcriber
					</h1>
					<p className="text-muted-foreground mt-2">
						Create your account to get started
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

					<div className="space-y-2">
						<label
							htmlFor="confirm-password"
							className="text-sm font-medium text-foreground"
						>
							Confirm Password
						</label>
						<Input
							id="confirm-password"
							type="password"
							placeholder="••••••••"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
							disabled={isPending}
						/>
					</div>

					<Button
						type="submit"
						className="w-full"
						disabled={isPending}
					>
						{isPending ? "Creating account..." : "Sign Up"}
					</Button>
				</form>

				<div className="text-center">
					<p className="text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link
							href="/login"
							className="text-primary hover:underline"
						>
							Login
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
