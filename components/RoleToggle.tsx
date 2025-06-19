'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

export function RoleToggle({ onRoleChange }: { onRoleChange: (role: string) => void }) {
  const [role, setRole] = useState('student')
  const { theme, systemTheme } = useTheme()
  const currentTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    // Ensure the component re-renders when theme changes
  }, [theme, systemTheme])

  const handleToggle = (selectedRole: string) => {
    setRole(selectedRole)
    onRoleChange(selectedRole)
  }

  return (
    <div className="flex justify-center mb-6">
      <div className="relative flex bg-profile rounded-full p-1 w-72">
        {/* Sliding Background */}
        <motion.div
          className="absolute top-1 bottom-1 rounded-full bg-[#2563eb]" /* Consistent blue */
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, left: role === 'student' ? '4px' : 'calc(50% + 4px)', width: 'calc(50% - 8px)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ zIndex: 10 }} /* Ensure it stays behind buttons */
        />
        {/* Student Button */}
        <button
          onClick={() => handleToggle('student')}
          className={`relative flex-1 px-6 py-2 rounded-full transition-colors duration-300 z-20 ${
            role === 'student' ? 'bg-[#2563eb] text-white' : 'text-primary'
          }`}
        >
          Student
        </button>
        {/* Admin Button */}
        <button
          onClick={() => handleToggle('admin')}
          className={`relative flex-1 px-6 py-2 rounded-full transition-colors duration-300 z-20 ${
            role === 'admin' ? 'bg-[#2563eb] text-white' : 'text-primary'
          }`}
        >
          Admin
        </button>
      </div>
    </div>
  )
}