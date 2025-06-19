'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'

export default function VerifyResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const isFormFilled = newPassword.trim() !== '' && confirmPassword.trim() !== ''

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 -mt-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row w-full max-w-screen-xl min-h-[600px] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Form Section */}
        <div className="w-full sm:w-1/2 p-4 sm:p-6 lg:p-10 flex flex-col justify-center bg-faint-blue-feature dark:bg-card">
          <div className="lg:max-w-sm mx-auto w-full">
            <div className="mb-6">
              <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--color-blue-500)' }}>
                Reset Password
              </h2>
            </div>
            <div className="space-y-4 sm:space-y-5">
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  className="input-field text-sm sm:text-base w-full pr-10"
                  value={newPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  style={{ color: 'var(--color-gray-500)', '--hover-color': 'var(--color-blue-500)' } as React.CSSProperties}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  className="input-field text-sm sm:text-base w-full pr-10"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  style={{ color: 'var(--color-gray-500)', '--hover-color': 'var(--color-blue-500)' } as React.CSSProperties}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button
                disabled={!isFormFilled}
                className="auth-button w-full py-2 rounded-lg text-white font-medium text-sm sm:text-base"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
        {/* Illustration Section */}
        <div className="w-full sm:w-1/2 bg-pure-white-feature dark:bg-blue-light flex items-center justify-center p-4 sm:p-6 min-h-[200px] sm:min-h-full">
          <Image
            src="/otp.png"
            alt="Verify Reset Password Illustration"
            width={300}
            height={300}
            className="object-contain max-h-[50vh] sm:max-h-full sm:h-full sm:w-full"
            priority
          />
        </div>
      </motion.div>
    </div>
  )
}