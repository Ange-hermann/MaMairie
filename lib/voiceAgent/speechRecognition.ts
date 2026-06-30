export type STTCallbacks = {
  onResult: (text: string) => void
  onInterim: (text: string) => void
  onError: (error: string) => void
  onEnd: () => void
}

export class MaMairieSTT {
  private recognition: any = null
  private isListening = false
  private finalTranscript = ''
  private silenceTimer: ReturnType<typeof setTimeout> | null = null
  private resultFired = false

  constructor(private callbacks: STTCallbacks) {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognitionAPI) return

    this.recognition = new SpeechRecognitionAPI()
    this.recognition.lang = 'fr-FR'
    this.recognition.continuous = false
    this.recognition.interimResults = true
    this.recognition.maxAlternatives = 1

    this.recognition.onresult = (event: any) => {
      this.finalTranscript = ''
      let interimText = ''

      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          this.finalTranscript += event.results[i][0].transcript
        } else {
          interimText += event.results[i][0].transcript
        }
      }

      if (interimText) this.callbacks.onInterim(interimText.trim())

      // Si on a un résultat final → déclencher immédiatement
      if (this.finalTranscript.trim() && !this.resultFired) {
        this.resultFired = true
        this.callbacks.onResult(this.finalTranscript.trim())
        this.recognition?.stop()
      }
    }

    this.recognition.onspeechend = () => {
      if (!this.resultFired) {
        this.recognition?.stop()
      }
    }

    this.recognition.onend = () => {
      this.clearSilenceTimer()
      this.isListening = false
      if (!this.resultFired) {
        this.callbacks.onEnd()
      }
    }

    this.recognition.onerror = (event: any) => {
      this.clearSilenceTimer()
      this.isListening = false
      const ignoredErrors = ['no-speech', 'aborted', 'interrupted']
      if (!ignoredErrors.includes(event.error)) {
        this.callbacks.onError(event.error)
      } else {
        this.callbacks.onEnd()
      }
    }
  }

  private clearSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer)
      this.silenceTimer = null
    }
  }

  start(): void {
    if (!this.recognition || this.isListening) return
    this.finalTranscript = ''
    this.resultFired = false

    try {
      this.recognition.start()
      this.isListening = true

      // Timeout 10s — si rien n'est dit, on ferme proprement
      this.silenceTimer = setTimeout(() => {
        if (this.isListening && !this.resultFired) {
          this.recognition?.stop()
        }
      }, 10000)
    } catch (e) {
      console.error('[STT] Erreur start:', e)
      this.isListening = false
    }
  }

  stop(): void {
    this.clearSilenceTimer()
    if (!this.recognition || !this.isListening) return
    try {
      this.recognition.stop()
    } catch (e) {}
    this.isListening = false
  }

  get active(): boolean {
    return this.isListening
  }

  static isSupported(): boolean {
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    )
  }
}
