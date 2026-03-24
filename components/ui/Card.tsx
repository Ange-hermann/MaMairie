import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn('bg-white rounded-lg shadow-md p-6', className)}>
      {children}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  color?: 'orange' | 'green' | 'blue' | 'gray'
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'orange' }) => {
  const colors = {
    orange: 'bg-primary-500',
    green: 'bg-secondary-500',
    blue: 'bg-blue-500',
    gray: 'bg-gray-600',
  }
  
  return (
    <div className={cn('rounded-lg shadow-lg p-6 text-white', colors[color])}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium opacity-90">{title}</h3>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        {icon && <div className="text-4xl opacity-80">{icon}</div>}
      </div>
    </div>
  )
}
