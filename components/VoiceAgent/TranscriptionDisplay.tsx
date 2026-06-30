'use client'

interface TranscriptionDisplayProps {
  text: string
  isFinal: boolean
}

export function TranscriptionDisplay({ text, isFinal }: TranscriptionDisplayProps) {
  if (!text) return null

  return (
    <div className="px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl text-sm">
      <p className={`text-gray-700 leading-snug ${isFinal ? 'font-medium' : 'opacity-70 italic'}`}>
        🎤 {isFinal ? text : `${text}...`}
      </p>
    </div>
  )
}
