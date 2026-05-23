'use client'

import { ChevronRight } from 'lucide-react'
import type { GeoBreadcrumbProps } from '@/types/geo'
import { generateGeoBreadcrumb, getGeoLevelIcon } from '@/lib/geoHelpers'

export function GeoBreadcrumb({ selection, className = '' }: GeoBreadcrumbProps) {
  const breadcrumb = generateGeoBreadcrumb(selection)

  if (breadcrumb.length === 0) {
    return null
  }

  return (
    <div className={`flex items-center flex-wrap gap-2 text-sm ${className}`}>
      {breadcrumb.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight size={14} className="text-gray-400" />}
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-gray-700">
            <span>{getGeoLevelIcon(item.level)}</span>
            <span className="font-medium">{item.label}</span>
          </span>
        </div>
      ))}
    </div>
  )
}
