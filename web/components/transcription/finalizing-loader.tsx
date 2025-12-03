"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const messages = [
	"Teaching our AI to understand...",
	"Converting your 'likes' and 'you knows' into textual gold...",
	"Polishing the transcript until it shines...",
	"Giving our AI a quick coffee break before the final print...",
	"Checking for rogue sound waves...",
	"Ensuring perfect punctuation placement...",
	"Analyzing your vocal tones... you sounded happy!",
];

export function FinalizingLoader() {
	const randomNum = Math.floor(Math.random() * messages.length);
	const [message, setMessage] = useState(messages[randomNum]);

	useEffect(() => {
		const interval = setInterval(() => {
			setMessage(
				(prevMessage) =>
					messages[
						(messages.indexOf(prevMessage) + 1) % messages.length
					],
			);
		}, 2000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="flex flex-col items-center justify-center space-y-4">
			<Loader2 className="w-16 h-16 animate-spin text-primary" />
			<p className="text-lg text-muted-foreground animate-pulse">
				{message}
			</p>
		</div>
	);
}
