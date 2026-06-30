import { detectIntent } from './intentDetection'
import { MaMairieTTS } from './speechSynthesis'
import { ConversationFlowManager } from './conversationFlow'
import { agentFormStore } from './agentFormStore'

export type AgentState =
  | 'idle'
  | 'sleeping'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error'

export type ConversationMessage = {
  role: 'user' | 'model'
  parts: { text: string }[]
}

export type UserContext = {
  nom: string
  prenom: string
  commune: string
  demandes: any[]
  userId: string
  declarations?: any[]
  reservations?: any[]
  notifications?: any[]
}

type OrchestratorCallbacks = {
  onStateChange: (state: AgentState) => void
  onTranscript: (text: string, isFinal: boolean) => void
  onAgentReply: (text: string) => void
  onError: (msg: string) => void
  onAction?: (route: string) => void
}

export class VoiceOrchestrator {
  private tts: MaMairieTTS
  private conversationHistory: ConversationMessage[] = []
  private userContext: UserContext
  private callbacks: OrchestratorCallbacks
  private currentState: AgentState = 'idle'
  private flow = new ConversationFlowManager()

  constructor(userContext: UserContext, callbacks: OrchestratorCallbacks) {
    this.userContext = userContext
    this.callbacks = callbacks
    this.tts = new MaMairieTTS()
  }

  private setState(state: AgentState) {
    this.currentState = state
    this.callbacks.onStateChange(state)
  }

  get state(): AgentState {
    return this.currentState
  }

  private speak(reply: string, onEnd?: () => void) {
    this.callbacks.onAgentReply(reply)
    this.setState('speaking')

    // Timeout de sécurité : si le TTS ne se termine pas dans 20s → débloquer l'agent
    const fallbackTimer = setTimeout(() => {
      if (this.currentState === 'speaking') {
        console.warn('[Orchestrator] TTS timeout — forçage état sleeping')
        this.setState('sleeping')
        onEnd?.()
      }
    }, 20_000)

    this.tts.speak(reply, () => {
      clearTimeout(fallbackTimer)
      this.setState('sleeping')
      onEnd?.()
    })
  }

  private navigate(route: string, delayMs = 400) {
    if (this.callbacks.onAction) {
      setTimeout(() => this.callbacks.onAction!(route), delayMs)
    }
  }

  async handleTranscript(transcript: string): Promise<void> {
    if (!transcript.trim()) { this.setState('sleeping'); return }

    this.setState('processing')

    // ─── Annulation du flux ───────────────────────────────────────────
    if (this.flow.isInFlow && /annul|stop|arrête|quitter|non merci/i.test(transcript)) {
      this.speak(this.flow.cancelFlow())
      return
    }

    // ─── Flux en cours : traiter la réponse de l'utilisateur ─────────
    if (this.flow.isInFlow) {
      const { reply, completed, data } = this.flow.processAnswer(transcript)
      if (completed && data) {
        // Écrire toutes les données dans le store
        agentFormStore.setPrefill({ ...data, type_acte: data.type_acte as any })

        // Choisir la page selon le flux terminé
        const routeMap: Record<string, string> = {
          DEMANDE_ACTE: '/demande-extrait',
          DECLARATION_NAISSANCE: '/citoyen/declaration-naissance',
          RESERVATION_MARIAGE: '/citoyen/reservation-mariage',
        }
        const route = routeMap[this.flow.lastFlow || 'DEMANDE_ACTE'] || '/demande-extrait'

        const nom = data.nom || data.nom_enfant || data.nom_epoux || ''
        const prenom = data.prenom || data.prenom_enfant || data.prenom_epoux || ''
        this.speak(
          `Parfait ! J'ouvre le formulaire pour ${prenom} ${nom}. Il ne reste plus qu'à vérifier et soumettre.`,
          () => this.navigate(route, 300)
        )
      } else {
        this.speak(reply)
      }
      return
    }

    // ─── Détecter l'intention ─────────────────────────────────────────
    const intent = detectIntent(transcript)

    // Demande d'acte → démarrer collecte vocale guidée
    if (['DEMANDE_ACTE_NAISSANCE', 'DEMANDE_ACTE_MARIAGE', 'DEMANDE_ACTE_DECES'].includes(intent.type)) {
      const typeMap: Record<string, string> = {
        DEMANDE_ACTE_NAISSANCE: 'naissance',
        DEMANDE_ACTE_MARIAGE: 'mariage',
        DEMANDE_ACTE_DECES: 'deces'
      }
      const reply = this.flow.startFlow('DEMANDE_ACTE', typeMap[intent.type])
      this.speak(reply)
      return
    }

    // Statut demande → redirection directe + lecture réelle depuis API
    if (intent.type === 'STATUT_DEMANDE') {
      this.speak('Je vérifie vos demandes en cours.', () => this.navigate('/suivi', 300))
      return
    }

    // Déclaration naissance → flux guidé
    if (intent.type === 'DECLARATION_NAISSANCE') {
      const reply = this.flow.startFlow('DECLARATION_NAISSANCE')
      this.speak(reply)
      return
    }

    // Réservation mariage → flux guidé
    if (intent.type === 'RESERVATION_MARIAGE') {
      const reply = this.flow.startFlow('RESERVATION_MARIAGE')
      this.speak(reply)
      return
    }

    // Avis mention
    if (intent.type === 'AVIS_MENTION') {
      this.speak('Je vous redirige vers les avis de mention.', () => this.navigate('/citoyen/avis-mention', 300))
      return
    }

    // ─── Fallback Groq pour questions libres ──────────────────────────
    try {
      const response = await fetch('/api/voice-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcript,
          conversationHistory: this.conversationHistory,
          userContext: this.userContext,
          intent: intent.type
        })
      })

      const json = await response.json()
      const reply = json?.reply
      const action = json?.action

      this.conversationHistory.push(
        { role: 'user', parts: [{ text: transcript }] },
        { role: 'model', parts: [{ text: reply }] }
      )
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20)
      }

      this.speak(reply, action ? () => this.navigate(action, 300) : undefined)

    } catch (error: any) {
      console.error('Erreur orchestrateur:', error)
      this.callbacks.onError('Désolé, une erreur est survenue.')
      this.setState('error')
      setTimeout(() => this.setState('sleeping'), 3000)
    }
  }

  speakWelcome(): void {
    const msg = `Bonjour ${this.userContext.prenom} ! Je suis MaMairie, votre assistant d'état civil. Comment puis-je vous aider ?`
    this.speak(msg)
  }

  stopSpeaking(): void {
    this.tts.stop()
    this.setState('sleeping')
  }

  clearHistory(): void {
    this.conversationHistory = []
    this.flow.reset()
  }

  updateContext(context: Partial<UserContext>): void {
    this.userContext = { ...this.userContext, ...context }
  }
}
