"use client";

import { useState, useEffect, useRef } from "react";

interface TextStreamProps {
	text: string;
	className?: string;
	streamSpeed?: number;
}

export const TextStream = ({
	text,
	className,
	streamSpeed = 100,
}: TextStreamProps) => {
	const [displayedText, setDisplayedText] = useState("");
	const prevTextRef = useRef("");

	useEffect(() => {
		if (text === "") {
			setDisplayedText("");
			prevTextRef.current = "";
			return;
		}

		if (text.length > prevTextRef.current.length) {
			const newText = text.substring(prevTextRef.current.length);
			let charIndex = 0;

			const intervalId = setInterval(() => {
				if (charIndex < newText.length) {
					setDisplayedText(
						(prev) => prev + newText.charAt(charIndex),
					);
					charIndex++;
				} else {
					clearInterval(intervalId);
					prevTextRef.current = text;
				}
			}, streamSpeed);

			return () => clearInterval(intervalId);
		} else if (text !== prevTextRef.current) {
			setDisplayedText(text);
			prevTextRef.current = text;
		}
	}, [text, streamSpeed]);

	return (
		<p className={className}>
			{displayedText}
			<span className="animate-pulse ml-1">▌</span>
		</p>
	);
};
