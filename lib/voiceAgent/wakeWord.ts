import { PorcupineWorker } from '@picovoice/porcupine-web'
import { WebVoiceProcessor } from '@picovoice/web-voice-processor'

type DetectionCallback = () => void

let porcupineInstance: PorcupineWorker | null = null
let isRunning = false

export async function startWakeWordDetection(
  accessKey: string,
  onDetected: DetectionCallback
): Promise<void> {
  if (isRunning) return

  try {
    porcupineInstance = await PorcupineWorker.create(
      accessKey,
      // Wake word "Porcupine" gratuit — remplacer par custom "Hey MaMairie" quand disponible
      [{ builtin: 'Porcupine', sensitivity: 0.7 }],
      (keywordIndex: number) => {
        if (keywordIndex === 0) {
          onDetected()
        }
      }
    )

    await WebVoiceProcessor.subscribe(porcupineInstance)
    isRunning = true
    console.log('✅ Wake word detection démarrée')
  } catch (error) {
    console.error('❌ Erreur wake word:', error)
    throw error
  }
}

export async function stopWakeWordDetection(): Promise<void> {
  if (!isRunning || !porcupineInstance) return
  try {
    await WebVoiceProcessor.unsubscribe(porcupineInstance)
    porcupineInstance.terminate()
    porcupineInstance = null
    isRunning = false
    console.log('🛑 Wake word detection arrêtée')
  } catch (error) {
    console.error('Erreur arrêt wake word:', error)
  }
}

export async function pauseWakeWordDetection(): Promise<void> {
  if (!porcupineInstance || !isRunning) return
  try {
    await WebVoiceProcessor.unsubscribe(porcupineInstance)
    isRunning = false
  } catch (error) {
    console.error('Erreur pause wake word:', error)
  }
}

export async function resumeWakeWordDetection(): Promise<void> {
  if (!porcupineInstance || isRunning) return
  try {
    await WebVoiceProcessor.subscribe(porcupineInstance)
    isRunning = true
  } catch (error) {
    console.error('Erreur reprise wake word:', error)
  }
}

export function isWakeWordRunning(): boolean {
  return isRunning
}
