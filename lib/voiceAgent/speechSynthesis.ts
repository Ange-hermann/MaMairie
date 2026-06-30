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

    const fr = voices.filter(v => v.lang.startsWith('fr'))

    // Priorité : voix féminines françaises connues sur chaque plateforme
    this.voice =
      // iOS Safari — Amélie (féminine, fr-CA) ou Marie
      fr.find(v => v.name === 'Amélie') ||
      fr.find(v => v.name === 'Marie') ||
      // Android Chrome — Google français féminin
      fr.find(v => v.name === 'Google français') ||
      fr.find(v => /google/i.test(v.name) && v.lang === 'fr-FR') ||
      // Windows — Hortense
      fr.find(v => v.name.includes('Hortense')) ||
      // macOS — Amelie ou Julie
      fr.find(v => v.name.includes('Julie')) ||
      // Tout fr-FR féminin (éviter Thomas qui est masculin)
      fr.find(v => v.lang === 'fr-FR' && !/thomas|nicolas|pierre|jean|paul|mathieu/i.test(v.name)) ||
      fr.find(v => v.lang === 'fr-FR') ||
      fr[0] ||
      null
  }

  private clearTimers(): void {
    if (this.watchdogTimer) { clearTimeout(this.watchdogTimer); this.watchdogTimer = null }
    if (this.keepAliveTimer) { clearInterval(this.keepAliveTimer); this.keepAliveTimer = null }
  }

  private doSpeak(text: string, onEnd?: () => void): void {
    this.clearTimers()

    // Annuler seulement si déjà en train de parler (évite de casser le contexte audio iOS)
    if (this.synth.speaking || this.synth.pending) {
      this.synth.cancel()
    }

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
      // KeepAlive — fix Chrome/Android freeze après ~15s
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

    // iOS Safari : speak() doit être appelé SANS délai depuis un event handler
    this.synth.speak(utterance)
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
