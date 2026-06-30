'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { VoiceOrchestrator, AgentState, UserContext } from '@/lib/voiceAgent/orchestrator'
import { MaMairieSTT } from '@/lib/voiceAgent/speechRecognition'
import { startWakeWordDetection, stopWakeWordDetection, pauseWakeWordDetection, resumeWakeWordDetection } from '@/lib/voiceAgent/wakeWord'
import { AgentStateDisplay } from './AgentStateDisplay'
import { TranscriptionDisplay } from './TranscriptionDisplay'
import { ConversationBubbles, BubbleMessage } from './ConversationBubbles'
import { Mic, MicOff, Volume2, VolumeX, X, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'

const PORCUPINE_KEY = process.env.NEXT_PUBLIC_PORCUPINE_ACCESS_KEY || ''

export function VoiceAgentWidget() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  // États UI
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [agentState, setAgentState] = useState<AgentState>('idle')
  const [transcript, setTranscript] = useState('')
  const [isFinalTranscript, setIsFinalTranscript] = useState(false)
  const [lastReply, setLastReply] = useState('')
  const [messages, setMessages] = useState<BubbleMessage[]>([])
  const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown')
  const [wakeWordReady, setWakeWordReady] = useState(false)
  const [autoListen, setAutoListen] = useState(false)
  const autoListenRef = useRef(false)
  const [isMuted, setIsMuted] = useState(false)
  const [userContext, setUserContext] = useState<UserContext | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [showPermissionGuide, setShowPermissionGuide] = useState(false)

  // Refs pour éviter les re-renders
  const orchestratorRef = useRef<VoiceOrchestrator | null>(null)
  const sttRef = useRef<MaMairieSTT | null>(null)
  const isListeningRef = useRef(false)
  const startListeningRef = useRef<() => void>(() => {})

  // ─── Charger le contexte citoyen ────────────────────────────────
  useEffect(() => {
    loadUserContext()
  }, [])

  const loadUserContext = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('users')
        .select('nom, prenom, mairie_id, role')
        .eq('id', user.id)
        .single()

      const { data: mairie } = profile?.mairie_id
        ? await supabase.from('mairies').select('ville').eq('id', profile.mairie_id).single()
        : { data: null }

      // Demandes d'extraits
      const { data: demandes } = await supabase
        .from('requests')
        .select('type_acte, statut, code_suivi, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Déclarations de naissance
      const { data: declarations } = await supabase
        .from('declarations_naissance')
        .select('statut, code_suivi, created_at')
        .eq('declarant_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      // Réservations mariage
      const { data: reservations } = await supabase
        .from('reservations_mariage')
        .select('statut, date_mariage_souhaitee, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      // Notifications non lues
      const { data: notifications } = await supabase
        .from('notifications')
        .select('titre, message, lue, created_at')
        .eq('user_id', user.id)
        .eq('lue', false)
        .order('created_at', { ascending: false })
        .limit(5)

      const ctx: UserContext = {
        nom: profile?.nom || '',
        prenom: profile?.prenom || '',
        commune: mairie?.ville || '',
        demandes: demandes || [],
        userId: user.id,
        declarations: declarations || [],
        reservations: reservations || [],
        notifications: notifications || [],
      }
      setUserContext(ctx)
    } catch (error) {
      console.error('Erreur chargement contexte:', error)
    }
  }

  // ─── Demander permission micro ───────────────────────────────────
  const requestMicPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop())
      setMicPermission('granted')
      return true
    } catch {
      setMicPermission('denied')
      setShowPermissionGuide(true)
      return false
    }
  }

  // ─── Wake word détecté ───────────────────────────────────────────
  const handleWakeWordDetected = useCallback(async () => {
    if (isListeningRef.current) return
    await pauseWakeWordDetection()
    startListening()
  }, [])

  // ─── Démarrer l'écoute STT ───────────────────────────────────────
  const startListening = useCallback(() => {
    if (!orchestratorRef.current || isListeningRef.current) return
    if (!MaMairieSTT.isSupported()) {
      setErrorMsg('Reconnaissance vocale non supportée (utilisez Chrome)')
      return
    }
    const currentState = orchestratorRef.current?.state
    if (currentState === 'speaking' || currentState === 'processing') return

    // Nouvelle instance à chaque start (Chrome interdit de réutiliser la même)
    sttRef.current = new MaMairieSTT({
      onResult: async (text) => {
        isListeningRef.current = false
        setTranscript('')
        setIsFinalTranscript(false)
        addMessage('user', text)
        await orchestratorRef.current?.handleTranscript(text)
        // Re-écoute auto gérée par onStateChange (speaking→sleeping)
      },
      onInterim: (text) => {
        setTranscript(text)
        setIsFinalTranscript(false)
      },
      onError: (error) => {
        console.error('[STT] Erreur:', error)
        isListeningRef.current = false
        setAgentState('sleeping')
        setTranscript('')
        // En mode auto, réessayer après une erreur
        if (autoListenRef.current) {
          setTimeout(() => { if (autoListenRef.current) startListeningRef.current() }, 1000)
        }
      },
      onEnd: () => {
        isListeningRef.current = false
        setAgentState('sleeping')
        setTranscript('')
      }
    })

    setAgentState('listening')
    setTranscript('')
    isListeningRef.current = true
    sttRef.current.start()
  }, [])

  // Garder startListeningRef à jour
  useEffect(() => {
    startListeningRef.current = startListening
  }, [startListening])

  // ─── Activer/désactiver le mode conversation continue ───────────
  const toggleAutoListen = useCallback(() => {
    const next = !autoListenRef.current
    autoListenRef.current = next
    setAutoListen(next)
    if (next && !isListeningRef.current && agentState === 'sleeping') {
      startListening()
    } else if (!next) {
      sttRef.current?.stop()
      isListeningRef.current = false
      setAgentState('sleeping')
    }
  }, [agentState, startListening])

  // ─── Arrêter l'écoute ────────────────────────────────────────────
  const stopListening = useCallback(() => {
    autoListenRef.current = false
    setAutoListen(false)
    sttRef.current?.stop()
    isListeningRef.current = false
    setAgentState('sleeping')
    setTranscript('')
  }, [])

  // ─── Ajouter bulle de conversation ──────────────────────────────
  const addMessage = (role: 'user' | 'agent', text: string) => {
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), role, text, timestamp: new Date() }
    ])
  }

  // ─── Créer l'orchestrateur (unique, avec re-écoute auto) ─────────
  const createOrchestrator = useCallback((ctx: UserContext) => {
    orchestratorRef.current = new VoiceOrchestrator(ctx, {
      onStateChange: (state) => {
        setAgentState(prev => {
          // Re-écoute auto : seulement quand l'agent finit de parler
          if (prev === 'speaking' && state === 'sleeping' && autoListenRef.current && !isListeningRef.current) {
            setTimeout(() => {
              if (autoListenRef.current && !isListeningRef.current) startListeningRef.current()
            }, 700)
          }
          return state
        })
        if (state === 'sleeping') {
          setTranscript('')
          setIsFinalTranscript(false)
        }
      },
      onTranscript: (text, isFinal) => { setTranscript(text); setIsFinalTranscript(isFinal) },
      onAgentReply: (text) => { setLastReply(text); addMessage('agent', text) },
      onError: (msg) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 4000) },
      onAction: (route) => { router.push(route) }
    })
  }, [])

  // ─── Ouvrir le widget ────────────────────────────────────────────
  const handleOpen = async () => {
    setIsOpen(true)
    setIsMinimized(false)
    if (agentState !== 'idle') return

    const ctx = userContext || { nom: '', prenom: 'Citoyen', commune: '', demandes: [], userId: '' }
    createOrchestrator(ctx)
    setAgentState('sleeping')

    // iOS/Android : speak() doit être appelé DANS le handler du clic, sans await avant
    // On lance le TTS immédiatement, puis on demande le micro en parallèle
    orchestratorRef.current?.speakWelcome()

    // Permission micro (après le speak pour ne pas perdre le contexte du clic)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop())
      setMicPermission('granted')
    } catch {
      setMicPermission('denied')
      setShowPermissionGuide(true)
    }
  }

  // ─── Fermer le widget ────────────────────────────────────────────
  const handleClose = async () => {
    sttRef.current?.stop()
    orchestratorRef.current?.stopSpeaking()
    if (PORCUPINE_KEY && wakeWordReady) await stopWakeWordDetection()
    setIsOpen(false)
    setAgentState('idle')
    setMessages([])
    setTranscript('')
    isListeningRef.current = false
  }

  // ─── Nettoyage au démontage ──────────────────────────────────────
  useEffect(() => {
    return () => {
      sttRef.current?.stop()
      orchestratorRef.current?.stopSpeaking()
      if (PORCUPINE_KEY && wakeWordReady) stopWakeWordDetection()
    }
  }, [])

  // ─── Icône état dans le badge ────────────────────────────────────
  const getStateEmoji = () => {
    switch (agentState) {
      case 'sleeping':   return '🟢'
      case 'listening':  return '🎤'
      case 'processing': return '🤔'
      case 'speaking':   return '🔊'
      case 'error':      return '❌'
      default:           return '💬'
    }
  }

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <>
      {/* ── Styles animations ── */}
      <style jsx global>{`
        @keyframes sound-wave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
        @keyframes ia-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes ia-pulse-ring {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>

      {/* === BADGE FLOTTANT === */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-20 right-4 z-50 flex items-center gap-2 bg-orange-500 shadow-lg rounded-full px-4 py-3 hover:bg-orange-600 active:scale-95 transition-all"
        >
          <span className="text-xl">🎙️</span>
          <span className="text-sm font-bold text-white">MaMairie IA</span>
        </button>
      )}

      {/* === PANNEAU PRINCIPAL ===
          Desktop : 320px en bas à droite
          Mobile  : plein écran  */}
      {isOpen && (
        <div className={`
          fixed z-50 bg-white shadow-2xl flex flex-col overflow-hidden
          /* mobile : plein écran */
          inset-0
          /* desktop : petit panneau */
          sm:inset-auto sm:bottom-20 sm:right-4 sm:w-80 sm:max-h-[600px] sm:rounded-2xl sm:border sm:border-gray-100
          ${isMinimized ? 'sm:h-14' : ''}
        `}>

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-orange-500 font-bold text-sm shadow">
                IA
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">MaMairie IA</p>
                <p className="text-orange-100 text-xs">Assistant d'état civil</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-white hover:bg-orange-400 rounded-lg">
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 text-white hover:bg-orange-400 rounded-lg sm:flex hidden">
                {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              <button onClick={handleClose} className="p-2 text-white hover:bg-orange-400 rounded-lg">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ── Corps ── */}
          {!isMinimized && (
            <div className="flex flex-col flex-1 min-h-0">

              {/* ── Zone centrale : animation + bulles ── */}
              <div className="flex-1 overflow-y-auto flex flex-col">

                {/* Animation état */}
                <div className="flex flex-col items-center justify-center py-6 px-4 gap-4 flex-shrink-0">

                  {/* Cercle état principal */}
                  <div className="relative flex items-center justify-center">
                    {/* Anneau pulsant si actif */}
                    {(agentState === 'listening' || agentState === 'speaking') && (
                      <div className="absolute w-24 h-24 rounded-full bg-orange-400 opacity-30"
                        style={{ animation: 'ia-pulse-ring 1.2s ease-out infinite' }} />
                    )}
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg transition-all ${
                      agentState === 'listening'  ? 'bg-orange-100 border-4 border-orange-400' :
                      agentState === 'speaking'   ? 'bg-green-100 border-4 border-green-400' :
                      agentState === 'processing' ? 'bg-blue-100 border-4 border-blue-400' :
                      'bg-gray-100 border-4 border-gray-300'
                    }`}>
                      {agentState === 'listening'  ? '🎤' :
                       agentState === 'speaking'   ? '🔊' :
                       agentState === 'processing' ? '🤔' : '💬'}
                    </div>
                  </div>

                  {/* Label état */}
                  <p className={`text-base font-semibold ${
                    agentState === 'listening'  ? 'text-orange-600' :
                    agentState === 'speaking'   ? 'text-green-600' :
                    agentState === 'processing' ? 'text-blue-600' :
                    'text-gray-500'
                  }`}>
                    {agentState === 'listening'  ? 'Je vous écoute...' :
                     agentState === 'speaking'   ? 'Je parle...' :
                     agentState === 'processing' ? 'Je réfléchis...' :
                     agentState === 'sleeping'   ? 'Prêt' : 'MaMairie IA'}
                  </p>

                  {/* Transcription temps réel */}
                  {transcript && (
                    <div className="w-full px-4 py-2 bg-orange-50 rounded-xl text-sm text-orange-800 text-center italic">
                      "{transcript}"
                    </div>
                  )}

                  {/* Erreur */}
                  {errorMsg && (
                    <div className="w-full px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 text-center">
                      {errorMsg}
                    </div>
                  )}

                  {/* Guide permission */}
                  {showPermissionGuide && (
                    <div className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                      <p className="font-bold mb-1">🔒 Autoriser le microphone</p>
                      <p className="text-xs mb-2">Appuyez sur 🔒 dans la barre d'adresse → <strong>Autoriser</strong> le micro</p>
                      <button
                        onClick={() => { setShowPermissionGuide(false); handleOpen() }}
                        className="w-full py-2 bg-orange-500 text-white rounded-lg text-sm font-medium"
                      >
                        Réessayer
                      </button>
                    </div>
                  )}
                </div>

                {/* Bulles conversation */}
                {messages.length > 0 && (
                  <div className="px-3 pb-4">
                    <ConversationBubbles messages={messages} />
                  </div>
                )}
              </div>

              {/* ── Contrôles bas ── */}
              <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-white">

                {/* Bouton micro principal — GRAND sur mobile */}
                <button
                  onClick={agentState === 'listening' ? stopListening : startListening}
                  disabled={agentState === 'processing' || agentState === 'speaking'}
                  className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md ${
                    agentState === 'listening'
                      ? 'bg-red-500 text-white'
                      : agentState === 'processing' || agentState === 'speaking'
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  {agentState === 'listening'
                    ? <><MicOff size={24} /> Arrêter</>
                    : agentState === 'processing'
                    ? <><span className="text-xl">⏳</span> Traitement...</>
                    : agentState === 'speaking'
                    ? <><span className="text-xl">🔊</span> En train de parler</>
                    : <><Mic size={24} /> Parler</>
                  }
                </button>

                {/* Ligne boutons secondaires */}
                <div className="flex gap-2 mt-3">
                  {/* Mode auto-écoute */}
                  <button
                    onClick={toggleAutoListen}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                      autoListen ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {autoListen ? <><Mic size={15} /> Auto ON</> : <><Mic size={15} /> Auto OFF</>}
                  </button>

                  {/* Couper parole */}
                  {agentState === 'speaking' && (
                    <button
                      onClick={() => orchestratorRef.current?.stopSpeaking()}
                      className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl border border-gray-200"
                    >
                      <VolumeX size={16} />
                    </button>
                  )}

                  {/* Effacer */}
                  {messages.length > 0 && (
                    <button
                      onClick={() => { setMessages([]); orchestratorRef.current?.clearHistory() }}
                      className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl border border-gray-200 text-sm"
                    >
                      ↺
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
