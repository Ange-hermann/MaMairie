// Wake word désactivé — pas de clé Picovoice configurée
// Le widget utilise le bouton "Démarrer" à la place

type DetectionCallback = () => void

export async function startWakeWordDetection(
  _accessKey: string,
  _onDetected: DetectionCallback
): Promise<void> {
  throw new Error('Wake word non disponible')
}

export async function stopWakeWordDetection(): Promise<void> {}
export async function pauseWakeWordDetection(): Promise<void> {}
export async function resumeWakeWordDetection(): Promise<void> {}
export function isWakeWordRunning(): boolean { return false }
