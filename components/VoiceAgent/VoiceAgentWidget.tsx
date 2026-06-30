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

    // Permission micro
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop())
      setMicPermission('granted')
    } catch {
      setMicPermission('denied')
      setShowPermissionGuide(true)
      return
    }

    // Message de bienvenue (après geste utilisateur → TTS autorisé)
    setTimeout(() => orchestratorRef.current?.speakWelcome(), 300)
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
      {/* === BADGE FLOTTANT (toujours visible) === */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-20 right-4 z-50 flex items-center gap-2 bg-white border border-gray-200 shadow-lg rounded-full px-3 py-2 hover:shadow-xl transition-all group"
          title="Ouvrir MaMairie IA"
        >
          <span className="text-base">{getStateEmoji()}</span>
          <span className="text-xs font-semibold text-gray-700">MaMairie IA</span>
          <MessageCircle size={16} className="text-orange-500" />
        </button>
      )}

      {/* === PANNEAU PRINCIPAL === */}
      {isOpen && (
        <div className={`fixed bottom-20 right-4 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 ${isMinimized ? 'h-14' : 'h-auto'}`}>

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-orange-500 font-bold text-sm">
                IA
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">MaMairie IA</p>
                <p className="text-orange-100 text-xs">Assistant vocal d'état civil</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 text-white hover:bg-orange-400 rounded-lg transition-all"
                title={isMuted ? 'Activer le son' : 'Couper le son'}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-white hover:bg-orange-400 rounded-lg transition-all"
              >
                {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 text-white hover:bg-orange-400 rounded-lg transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* ── Corps (masqué si minimisé) ── */}
          {!isMinimized && (
            <div className="flex flex-col">

              {/* ── Indicateur état ── */}
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                <AgentStateDisplay state={agentState} />
                {wakeWordReady && (
                  <span className="text-xs text-gray-400">Dites "Porcupine"</span>
                )}
              </div>

              {/* ── Animation visuelle selon état ── */}
              <div className="flex flex-col items-center justify-center py-4 px-4 gap-3">

                {agentState === 'listening' && (
                  <div className="flex items-end gap-1 h-10">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-orange-500 rounded-full"
                        style={{
                          height: `${Math.random() * 32 + 8}px`,
                          animation: `sound-wave 0.6s ease-in-out ${i * 0.08}s infinite alternate`
                        }}
                      />
                    ))}
                  </div>
                )}

                {agentState === 'processing' && (
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-2.5 h-2.5 bg-orange-400 rounded-full"
                        style={{ animation: `bounce 0.8s ease-in-out ${i * 0.15}s infinite alternate` }}
                      />
                    ))}
                  </div>
                )}

                {agentState === 'speaking' && (
                  <div className="flex items-center gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-green-500 rounded-full"
                        style={{
                          height: `${12 + i * 4}px`,
                          animation: `sound-wave 0.5s ease-in-out ${i * 0.1}s infinite alternate`
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Transcription en temps réel */}
                {(transcript || isFinalTranscript) && (
                  <TranscriptionDisplay text={transcript} isFinal={isFinalTranscript} />
                )}

                {/* Erreur */}
                {errorMsg && (
                  <div className="w-full px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    {errorMsg}
                  </div>
                )}
              </div>

              {/* ── Bulles de conversation ── */}
              <div className="px-3 pb-2 max-h-52 overflow-y-auto">
                <ConversationBubbles messages={messages} />
              </div>

              {/* ── Contrôles ── */}
              <div className="p-3 border-t border-gray-100 flex gap-2">

                {/* Bouton conversation continue */}
                <button
                  onClick={toggleAutoListen}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    autoListen
                      ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                  title={autoListen ? 'Cliquer pour arrêter la conversation continue' : 'Cliquer pour démarrer — je vous écouterai en continu'}
                >
                  {autoListen ? <>
                    <Mic size={18} /> En écoute...
                  </> : <>
                    <Mic size={18} /> Démarrer
                  </>}
                </button>

                {/* Bouton parler unique (une seule question) */}
                {!autoListen && agentState !== 'listening' && (
                  <button
                    onClick={startListening}
                    disabled={agentState === 'processing' || agentState === 'speaking'}
                    className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 text-gray-600 rounded-xl transition-all"
                    title="Une seule question"
                  >
                    <Mic size={18} />
                  </button>
                )}

                {/* Arrêter si en écoute manuelle */}
                {agentState === 'listening' && !autoListen && (
                  <button
                    onClick={stopListening}
                    className="px-3 py-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all"
                  >
                    <MicOff size={18} />
                  </button>
                )}

                {/* Couper la parole */}
                {agentState === 'speaking' && (
                  <button
                    onClick={() => orchestratorRef.current?.stopSpeaking()}
                    className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all"
                    title="Couper"
                  >
                    <VolumeX size={18} />
                  </button>
                )}

                {/* Effacer historique */}
                {messages.length > 0 && (
                  <button
                    onClick={() => { setMessages([]); orchestratorRef.current?.clearHistory() }}
                    className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl text-xs transition-all"
                    title="Effacer la conversation"
                  >
                    ↺
                  </button>
                )}
              </div>

              {/* ── Guide permission micro ── */}
              {showPermissionGuide && (
                <div className="mx-3 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  <p className="font-bold mb-1">🔒 Autoriser le microphone</p>
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>Cliquez sur 🔒 dans la barre d'adresse</li>
                    <li>Sélectionnez <strong>Autoriser</strong> pour le micro</li>
                    <li>Rechargez la page</li>
                  </ol>
                  <button
                    onClick={() => { setShowPermissionGuide(false); handleOpen() }}
                    className="mt-2 w-full py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium"
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {/* ── Guide wake word si non disponible ── */}
              {!wakeWordReady && agentState !== 'idle' && (
                <p className="text-center text-xs text-gray-400 pb-2">
                  Appuyez sur <strong>Parler</strong> pour m'activer
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Styles animations CSS ── */}
      <style jsx global>{`
        @keyframes sound-wave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
        @keyframes bounce {
          from { transform: translateY(0); }
          to   { transform: translateY(-8px); }
        }
      `}</style>
    </>
  )
}
