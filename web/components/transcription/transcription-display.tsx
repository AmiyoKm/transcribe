"use client"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface TranscriptionDisplayProps {
  partialText: string
  finalText: string
  wordCount: number
  isRecording: boolean
}

export function TranscriptionDisplay({ partialText, finalText, wordCount, isRecording }: TranscriptionDisplayProps) {
  const [displayText, setDisplayText] = useState("")

  useEffect(() => {
    if (partialText) {
      setDisplayText(partialText)
    }
  }, [partialText])

  return (
    <Card className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
      <CardContent className="p-6 md:p-8">
        <div className="space-y-4 min-h-32">
          {finalText && (
            <div>
              <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Final Transcript
              </h3>
              <p className="text-base md:text-lg text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                {finalText}
              </p>
            </div>
          )}

          {isRecording && displayText && !finalText && (
            <div>
              <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Listening...
              </h3>
              <p className="text-base md:text-lg text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                {displayText}
                <span className="animate-pulse ml-1">▌</span>
              </p>
            </div>
          )}

          {!finalText && !isRecording && !displayText && (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400">Click the microphone button to start recording</p>
            </div>
          )}

          {wordCount > 0 && (
            <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Words: <span className="font-semibold text-gray-900 dark:text-white">{wordCount}</span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
