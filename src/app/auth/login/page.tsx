'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { RoleToggle } from '../../../../components/RoleToggle'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [role, setRole] = useState<string>('student')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const handleRoleChange = (selectedRole: string): void => {
    setRole(selectedRole)
  }

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword)
  }

  const isFormFilled: boolean = email.trim() !== '' && password.trim() !== ''

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row w-full max-w-screen-xl min-h-[600px] rounded-2xl container-shadow overflow-hidden"
      >
        {/* Form Section */}
        <div className="w-full sm:w-1/2 p-4 sm:p-6 lg:p-10 flex flex-col justify-center bg-faint-blue-feature dark:bg-card">
          <div className="lg:max-w-sm mx-auto w-full">
            <div className="mb-6">
              <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--color-blue-500)' }}>
                Login
              </h2>
              <p className="text-sm sm:text-base text-secondary mt-2">
                Sign in to access your account
              </p>
            </div>
            <RoleToggle onRoleChange={handleRoleChange} />
            <div className="space-y-4 sm:space-y-5">
              <input
                type="email"
                placeholder="Email"
                className="input-field text-sm sm:text-base w-full"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="input-field pr-10 text-sm sm:text-base w-full"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: 'var(--color-gray-500)', '--hover-color': 'var(--color-blue-500)' } as React.CSSProperties}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex justify-end">
                <Link href="/auth/reset-password" className="link-text text-xs sm:text-sm">
                  Forgot Password?
                </Link>
              </div>
              <button
                disabled={!isFormFilled}
                className="auth-button w-full py-2 rounded-lg text-white font-medium text-sm sm:text-base"
              >
                Login
              </button>
              <p className="text-center text-secondary text-xs sm:text-sm">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="link-text">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
        {/* Illustration Section */}
        <div className="w-full sm:w-1/2 bg-pure-white-feature dark:bg-blue-light flex items-center justify-center p-4 sm:p-6 min-h-[200px] sm:min-h-full">
          <Image
            src="/login.png"
            alt="Login Illustration"
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