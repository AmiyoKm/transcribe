export interface PartialUpdate {
  type: "partial"
  partial: string
}

export interface FinalPayload {
  type: "final"
  session_id: string
  transcription: string
  length: number
  words: number
  duration_seconds: number
  language: string
  model_used: string
  error?: string
}

export type WebSocketMessage = PartialUpdate | FinalPayload

export class TranscriptionWebSocket {
  private ws: WebSocket | null = null
  private url: string
  private token: string
  private onPartial: ((text: string) => void) | null = null
  private onFinal: ((payload: FinalPayload) => void) | null = null
  private onError: ((error: string) => void) | null = null

  constructor(token: string) {
    this.token = token
    const protocol = window.location.protocol === "https:" ? "wss" : "ws"
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const wsUrl = apiUrl.replace("http", "ws")
    this.url = `${wsUrl}/ws/transcribe?token=${token}`
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log("[v0] WebSocket connected")
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data: WebSocketMessage = JSON.parse(event.data)
            console.log("[v0] WebSocket message received:", data)

            if (data.type === "final") {
              this.onFinal?.(data as FinalPayload)
            } else if (data.type === "partial") {
              this.onPartial?.((data as PartialUpdate).partial)
            }
          } catch (error) {
            console.error("[v0] Failed to parse message:", error)
          }
        }

        this.ws.onerror = (error) => {
          console.error("[v0] WebSocket error:", error)
          this.onError?.("Connection error")
          reject(error)
        }

        this.ws.onclose = () => {
          console.log("[v0] WebSocket disconnected")
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  sendAudio(audioData: Blob): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(audioData)
    }
  }

  setOnPartial(callback: (text: string) => void): void {
    this.onPartial = callback
  }

  setOnFinal(callback: (payload: FinalPayload) => void): void {
    this.onFinal = callback
  }

  setOnError(callback: (error: string) => void): void {
    this.onError = callback
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
