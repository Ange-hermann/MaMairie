'use client'

import type { AgentState } from '@/lib/voiceAgent/orchestrator'

interface AgentStateDisplayProps {
  state: AgentState
}

const STATE_CONFIG: Record<AgentState, { label: string; color: string; animate: string }> = {
  idle:       { label: 'Initialisation...', color: 'bg-gray-400',   animate: '' },
  sleeping:   { label: 'En veille',         color: 'bg-green-500',  animate: 'animate-pulse' },
  listening:  { label: 'Je vous écoute',    color: 'bg-orange-500', animate: 'animate-ping' },
  processing: { label: 'Je réfléchis...',   color: 'bg-yellow-500', animate: 'animate-spin' },
  speaking:   { label: 'Je vous réponds',   color: 'bg-blue-500',   animate: 'animate-bounce' },
  error:      { label: 'Erreur',            color: 'bg-red-500',    animate: '' },
}

export function AgentStateDisplay({ state }: AgentStateDisplayProps) {
  const config = STATE_CONFIG[state] || STATE_CONFIG.idle

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-3 w-3">
        {state !== 'idle' && state !== 'error' && (
          <span className={`absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75 ${config.animate}`} />
        )}
        <span className={`relative inline-flex rounded-full h-3 w-3 ${config.color}`} />
      </div>
      <span className="text-xs font-medium text-gray-600">{config.label}</span>
    </div>
  )
}
