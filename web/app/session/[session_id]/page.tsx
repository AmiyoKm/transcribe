"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/layout/app-layout";
import { getApiClient } from "@/lib/api-client";
import type { Session, SingleSessionResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SessionPage() {
	const params = useParams();
	const router = useRouter();
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState("");
	const [showDeleteAlert, setShowDeleteAlert] = useState(false);

	const sessionId = params.session_id as string;

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/login");
		}
	}, [isAuthenticated, authLoading, router]);

	useEffect(() => {
		if (!isAuthenticated || !sessionId) return;

		const fetchSession = async () => {
			try {
				const client = getApiClient();
				const response = await client.get<SingleSessionResponse>(
					`/sessions/${sessionId}`,
				);
				setSession(response.data.data);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Failed to load session",
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSession();
	}, [sessionId, isAuthenticated]);



	const confirmDelete = async () => {
		setShowDeleteAlert(false);
		setIsDeleting(true);
		setError("");
		try {
			const client = getApiClient();
			await client.delete(`/sessions/${sessionId}`);
			router.push("/");
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to delete session",
			);
		} finally {
			setIsDeleting(false);
		}
	};

	if (authLoading || isLoading) {
		return (
			<AppLayout>
				<div className="flex items-center justify-center h-full">
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</AppLayout>
		);
	}

	if (error || !session) {
		return (
			<AppLayout>
				<div className="flex flex-col items-center justify-center h-full space-y-4">
					<p className="text-destructive">
						{error || "Session not found"}
					</p>
					<Button onClick={() => router.push("/")}>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Home
					</Button>
				</div>
			</AppLayout>
		);
	}

	const startDate = new Date(session.start_time);
	const endDate = new Date(session.end_time);
	const duration = session.duration_seconds;
	const minutes = Math.floor(duration / 60);
	const seconds = duration % 60;

	return (
		<AppLayout>
			<div className="p-6 max-w-4xl mx-auto space-y-6">
				<Button
					variant="ghost"
					onClick={() => router.push("/")}
					className="mb-4"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back to Home
				</Button>

				<div className="space-y-6 flex justify-between">
					<div className="space-y-2">
						<h1 className="text-3xl font-bold text-foreground">
							Session Details
						</h1>
						<p className="text-muted-foreground">
							{startDate.toLocaleDateString()} at{" "}
							{startDate.toLocaleTimeString()}
						</p>
					</div>

					<AlertDialog
						open={showDeleteAlert}
						onOpenChange={setShowDeleteAlert}
					>
						<AlertDialogTrigger asChild>
							<Button
								variant="destructive"
								disabled={isDeleting}
							>
								{isDeleting ? "Deleting..." : "Delete Session"}
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Are you absolutely sure?
								</AlertDialogTitle>
								<AlertDialogDescription>
									This action cannot be undone. This will
									permanently delete your session and remove
									your data from our servers.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={confirmDelete}>
									Continue
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Duration
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold text-foreground">
								{minutes}m {seconds}s
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Word Count
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold text-foreground">
								{session.word_count}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Language
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold text-foreground">
								{session.language || "English"}
							</p>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Transcript</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-foreground leading-relaxed whitespace-pre-wrap">
							{session.final_transcript}
						</p>
					</CardContent>
				</Card>

				<Button onClick={() => router.push("/")}>
					Start New Recording
				</Button>
			</div>
		</AppLayout>
	);
}
