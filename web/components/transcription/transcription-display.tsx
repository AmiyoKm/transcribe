"use client";
import { TextStream } from "@/components/ui/text-stream";
import { Card, CardContent } from "@/components/ui/card";

interface TranscriptionDisplayProps {
	partialText: string;
	isRecording: boolean;
}

export function TranscriptionDisplay({
	partialText,
	isRecording,
}: TranscriptionDisplayProps) {
	return (
		<Card className="w-full max-w-3xl border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
			<CardContent className="p-6 md:p-8">
				<div className="min-h-32 space-y-4">
					{isRecording && partialText ? (
						<div>
							<h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
								Listening...
							</h3>
							<TextStream
								text={partialText}
								streamSpeed={20}
								className="text-base md:text-lg leading-relaxed text-gray-900 whitespace-pre-wrap dark:text-white"
							/>
						</div>
					) : null}

					{!isRecording && !partialText && (
						<div className="py-16 text-center">
							<p className="text-gray-500 dark:text-gray-400">
								Click the microphone button to start recording
							</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
