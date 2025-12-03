"use client"
import { Card, CardContent } from "@/components/ui/card"

interface TranscriptionDisplayProps {
  partialText: string
  isRecording: boolean
}

export function TranscriptionDisplay({ partialText, isRecording }: TranscriptionDisplayProps) {
  return (
    <Card className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
      <CardContent className="p-6 md:p-8">
        <div className="space-y-4 min-h-32">


          {isRecording && partialText && (
            <div>
              <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Listening...
              </h3>
              <p className="text-base md:text-lg text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                {partialText}
                <span className="animate-pulse ml-1">▌</span>
              </p>
            </div>
          )}

          {!isRecording && !partialText && (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400">Click the microphone button to start recording</p>
            </div>
          )}


        </div>
      </CardContent>
    </Card>
  )
}
