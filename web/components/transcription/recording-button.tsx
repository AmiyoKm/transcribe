"use client"
import { Button } from "@/components/ui/button"
import { Mic, Square } from "lucide-react"
import { cn } from "@/lib/utils"

interface RecordingButtonProps {
  isRecording: boolean
  onClick: () => void
  disabled?: boolean
}

export function RecordingButton({ isRecording, onClick, disabled }: RecordingButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size="lg"
      className={cn(
        "rounded-full w-20 h-20 flex items-center justify-center",
        isRecording ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90",
      )}
    >
      {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
    </Button>
  )
}
