"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
	const [email, setEmail] = useState("amiyo@example.com");
	const [password, setPassword] = useState("password");
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, password }),
				},
			);
			if (!res.ok) throw new Error("Login failed");
			const data = await res.json();
			localStorage.setItem("authToken", data.data.access_token);
			router.push("/test-transcription");
		} catch (err: any) {
			setError(err.message);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
			<h1 className="text-2xl font-bold mb-4">Login</h1>
			<form
				onSubmit={handleSubmit}
				className="bg-white p-6 rounded shadow-md w-80"
			>
				{error && <p className="text-red-500 mb-2">{error}</p>}
				<div className="mb-4">
					<label className="block mb-1 text-black">Email</label>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="w-full border px-2 py-1 rounded text-black"
					/>
				</div>
				<div className="mb-4">
					<label className="block mb-1 text-black">Password</label>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						className="w-full border px-2 py-1 rounded text-black"
					/>
				</div>
				<button
					type="submit"
					className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
				>
					Login
				</button>
			</form>
		</div>
	);
}
