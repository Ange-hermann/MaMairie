export class MaMairieTTS {
  private synth: SpeechSynthesis
  private voice: SpeechSynthesisVoice | null = null
  private isSpeaking = false
  private watchdogTimer: ReturnType<typeof setTimeout> | null = null
  private keepAliveTimer: ReturnType<typeof setInterval> | null = null
  private voicesReady = false

  constructor() {
    this.synth = window.speechSynthesis
    // Charger les voix immédiatement si disponibles
    this.loadVoices()
    // Chrome charge les voix en async via cet événement
    if ('onvoiceschanged' in this.synth) {
      this.synth.onvoiceschanged = () => {
        this.loadVoices()
        this.voicesReady = true
      }
    }
    // Tentatives supplémentaires pour navigateurs lents
    setTimeout(() => this.loadVoices(), 200)
    setTimeout(() => this.loadVoices(), 800)
  }

  private loadVoices(): void {
    const voices = this.synth.getVoices()
    if (voices.length === 0) return
    this.voicesReady = true

    const fr = voices.filter(v => v.lang.startsWith('fr'))
    this.voice =
      fr.find(v => v.name === 'Amélie') ||
      fr.find(v => v.name === 'Marie') ||
      fr.find(v => v.name === 'Google français') ||
      fr.find(v => /google/i.test(v.name) && v.lang === 'fr-FR') ||
      fr.find(v => v.name.includes('Hortense')) ||
      fr.find(v => v.name.includes('Julie')) ||
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
    if (this.synth.speaking || this.synth.pending) this.synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    if (this.voice) utterance.voice = this.voice
    utterance.lang = 'fr-FR'
    utterance.rate = 1.0   // Vitesse naturelle
    utterance.pitch = 1.05 // Légèrement plus aigu = plus féminin
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
      // Watchdog : si onend ne se déclenche jamais (bug Chrome)
      this.watchdogTimer = setTimeout(() => {
        console.warn('[TTS] watchdog déclenché')
        this.synth.cancel()
        done()
      }, 30_000)
      // KeepAlive Chrome : resume() seul suffit, pas besoin de pause()
      this.keepAliveTimer = setInterval(() => {
        if (this.synth.speaking && !this.synth.paused) {
          this.synth.resume()
        }
      }, 5_000)
    }

    utterance.onend = done
    utterance.onerror = (e: any) => {
      if (e.error === 'interrupted' || e.error === 'canceled') { done(); return }
      console.warn('[TTS] onerror:', e.error)
      done()
    }

    this.synth.speak(utterance)
  }

  speak(text: string, onEnd?: () => void): void {
    const cleanText = text
      .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
      .replace(/[•→←★☆✓✗]/g, '')
      .replace(/\*+/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!cleanText) { onEnd?.(); return }

    if (this.voicesReady) {
      this.doSpeak(cleanText, onEnd)
      return
    }

    // Voix pas encore chargées — attendre max 2s
    let resolved = false
    const resolve = () => {
      if (resolved) return
      resolved = true
      this.loadVoices()
      this.doSpeak(cleanText, onEnd)
    }

    const timeout = setTimeout(resolve, 2000)
    const poll = setInterval(() => {
      if (this.synth.getVoices().length > 0) {
        clearInterval(poll)
        clearTimeout(timeout)
        resolve()
      }
    }, 100)
  }

  stop(): void {
    this.clearTimers()
    this.synth.cancel()
    this.isSpeaking = false
  }

  get speaking(): boolean { return this.isSpeaking }

  static isSupported(): boolean { return 'speechSynthesis' in window }
}
