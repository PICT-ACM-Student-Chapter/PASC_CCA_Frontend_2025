'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function ResetPassword() {
  const [email, setEmail] = useState('')

  const isFormFilled = email.trim() !== ''

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
              <input
                type="email"
                placeholder="Email"
                className="input-field text-sm sm:text-base w-full"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
              <button
                disabled={!isFormFilled}
                className="auth-button w-full py-2 rounded-lg text-white font-medium text-sm sm:text-base"
              >
                Send OTP
              </button>
            </div>
          </div>
        </div>
        {/* Illustration Section */}
        <div className="w-full sm:w-1/2 bg-pure-white-feature dark:bg-blue-light flex items-center justify-center p-4 sm:p-6 min-h-[200px] sm:min-h-full">
          <Image
            src="/otp.png"
            alt="Reset Password Illustration"
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