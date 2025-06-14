// components/DashboardCard.tsx
import React from 'react'

interface DashboardCardProps {
  title: string
  children: React.ReactNode
  className?: string
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`rounded-lg border border-card bg-card p-6 shadow-sm ${className}`}>
      <h3 className="text-lg font-medium text-primary">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  )
}

export default DashboardCard