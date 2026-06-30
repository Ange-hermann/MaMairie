// Wake word via Web Speech API — détecte "MaMairie", "Hey Mairie", "Mairie"
// Fonctionne sans clé, gratuit, dans Chrome et navigateurs compatibles

type DetectionCallback = () => void

const WAKE_WORDS = ['mamairie', 'hey mairie', 'mairie', 'hey mamèri', 'mamèri', 'hey marie', 'marié']

let recognition: any = null
let isRunning = false
let isPaused = false
let onDetectedCallback: DetectionCallback | null = null

function createRecognition(): any {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SpeechRecognition) return null

  const rec = new SpeechRecognition()
  rec.continuous = true
  rec.interimResults = true
  rec.lang = 'fr-FR'
  rec.maxAlternatives = 3

  rec.onresult = (event: any) => {
    if (isPaused) return
    for (let i = event.resultIndex; i < event.results.length; i++) {
      for (let j = 0; j < event.results[i].length; j++) {
        const text = event.results[i][j].transcript.toLowerCase().trim()
        const matched = WAKE_WORDS.some(w => text.includes(w))
        if (matched) {
          console.log('[WakeWord] Détecté :', text)
          onDetectedCallback?.()
          return
        }
      }
    }
  }

  rec.onerror = (e: any) => {
    if (e.error === 'no-speech' || e.error === 'aborted') return
    console.warn('[WakeWord] Erreur:', e.error)
    // Redémarrer automatiquement
    if (isRunning && !isPaused) {
      setTimeout(() => { try { rec.start() } catch {} }, 1000)
    }
  }

  rec.onend = () => {
    // Redémarrer en boucle si toujours actif
    if (isRunning && !isPaused) {
      setTimeout(() => { try { rec.start() } catch {} }, 300)
    }
  }

  return rec
}

export async function startWakeWordDetection(
  _accessKey: string,
  onDetected: DetectionCallback
): Promise<void> {
  if (isRunning) return
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SpeechRecognition) throw new Error('Web Speech API non supportée')

  onDetectedCallback = onDetected
  isRunning = true
  isPaused = false

  recognition = createRecognition()
  if (!recognition) throw new Error('Impossible de créer la reconnaissance vocale')

  try {
    recognition.start()
    console.log('[WakeWord] Écoute active — dites "MaMairie" pour démarrer')
  } catch (e) {
    isRunning = false
    throw e
  }
}

export async function stopWakeWordDetection(): Promise<void> {
  isRunning = false
  isPaused = false
  onDetectedCallback = null
  try { recognition?.stop() } catch {}
  recognition = null
}

export async function pauseWakeWordDetection(): Promise<void> {
  isPaused = true
  try { recognition?.stop() } catch {}
}

export async function resumeWakeWordDetection(): Promise<void> {
  if (!isRunning || !recognition) return
  isPaused = false
  recognition = createRecognition()
  try { recognition?.start() } catch {}
}

export function isWakeWordRunning(): boolean { return isRunning && !isPaused }
