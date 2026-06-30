export class MaMairieTTS {
  private synth: SpeechSynthesis
  private voice: SpeechSynthesisVoice | null = null
  private isSpeaking = false
  private watchdogTimer: ReturnType<typeof setTimeout> | null = null
  private keepAliveTimer: ReturnType<typeof setInterval> | null = null
  private retryCount = 0
  private currentText = ''
  private currentOnEnd: (() => void) | undefined

  constructor() {
    this.synth = window.speechSynthesis
    this.loadVoices()
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices()
    }
    // Chrome charge les voix en async — forcer un 2e chargement
    setTimeout(() => this.loadVoices(), 500)
  }

  private loadVoices(): void {
    const voices = this.synth.getVoices()
    if (voices.length === 0) return
    this.voice =
      voices.find(v => v.name.toLowerCase().includes('google') && v.lang === 'fr-FR') ||
      voices.find(v => v.name.toLowerCase().includes('thomas')) ||
      voices.find(v => v.name.includes('Julie') && v.lang.startsWith('fr')) ||
      voices.find(v => v.lang === 'fr-FR') ||
      voices.find(v => v.lang.startsWith('fr')) ||
      voices[0] ||
      null
  }

  private clearTimers(): void {
    if (this.watchdogTimer) { clearTimeout(this.watchdogTimer); this.watchdogTimer = null }
    if (this.keepAliveTimer) { clearInterval(this.keepAliveTimer); this.keepAliveTimer = null }
  }

  private doSpeak(text: string, onEnd?: () => void): void {
    this.clearTimers()
    this.synth.cancel()

    // Chrome: cancel() est asynchrone — petit délai avant de parler
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text)
      if (this.voice) utterance.voice = this.voice
      utterance.lang = 'fr-FR'
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0

      let finished = false
      const done = () => {
        if (finished) return
        finished = true
        this.clearTimers()
        this.isSpeaking = false
        onEnd?.()
      }

      utterance.onstart = () => {
        this.isSpeaking = true
        // Watchdog 60s — si onend ne se déclenche jamais
        this.watchdogTimer = setTimeout(() => {
          this.synth.cancel()
          done()
        }, 60_000)
        // KeepAlive — fix Chrome freeze après ~15s
        this.keepAliveTimer = setInterval(() => {
          if (this.synth.speaking) { this.synth.pause(); this.synth.resume() }
        }, 10_000)
      }

      utterance.onend = done
      utterance.onerror = (e: any) => {
        if (e.error === 'interrupted' || e.error === 'canceled') return
        console.warn('[TTS] onerror:', e.error)
        done()
      }

      this.synth.speak(utterance)
    }, 80)
  }

  speak(text: string, onEnd?: () => void): void {
    const cleanText = text
      .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
      .replace(/[•→←★☆✓✗]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!cleanText) { onEnd?.(); return }

    this.currentText = cleanText
    this.currentOnEnd = onEnd
    this.retryCount = 0
    this.isSpeaking = false

    // Vérifier que les voix sont chargées
    if (!this.voice) this.loadVoices()

    this.doSpeak(cleanText, onEnd)
  }

  stop(): void {
    this.clearTimers()
    this.synth.cancel()
    this.isSpeaking = false
  }

  get speaking(): boolean {
    return this.isSpeaking
  }

  static isSupported(): boolean {
    return 'speechSynthesis' in window
  }
}
