'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { RoleToggle } from '../../../../components/RoleToggle'
import { Eye, EyeOff } from 'lucide-react'

export default function Signup() {
  const [role, setRole] = useState('student')
  const [firstName, setFirstName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [year, setYear] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [department, setDepartment] = useState('')
  const [passoutYear, setPassoutYear] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleRoleChange = (selectedRole: string) => {
    setRole(selectedRole)
  }

  const isFormFilled = firstName.trim() !== '' && 
                      surname.trim() !== '' && 
                      email.trim() !== '' && 
                      password.trim() !== '' && 
                      confirmPassword.trim() !== '' && 
                      (role === 'admin' || (department.trim() !== '' && passoutYear.trim() !== '')) &&
                      (role !== 'student' || (year.trim() !== '' && rollNumber.trim() !== ''))

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 -mt-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row w-full max-w-screen-xl min-h-[600px] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Form Section */}
        <div className="w-full sm:w-1/2 p-4 sm:p-6 lg:p-10 flex flex-col bg-faint-blue-feature dark:bg-card min-h-[600px]">
          <div className="lg:max-w-sm mx-0 sm:mx-auto w-full flex flex-col mt-0 sm:mt-4">
            {/* Header Section */}
            <div className="mb-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-blue-500">
                Join the PICT ACM Community
              </h2>
            </div>
            <RoleToggle onRoleChange={handleRoleChange} />
            {/* Form Fields with Animation */}
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 sm:space-y-5 min-h-[450px] mt-4"
              >
                <div className="flex flex-row gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="input-field text-sm sm:text-base w-1/2"
                    value={firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Surname"
                    className="input-field text-sm sm:text-base w-1/2"
                    value={surname}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSurname(e.target.value)}
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  className="input-field text-sm sm:text-base w-full"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="input-field text-sm sm:text-base w-full pr-10"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-500"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {role === 'student' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 sm:space-y-5"
                  >
                    <input
                      type="text"
                      placeholder="Year"
                      className="input-field text-sm sm:text-base w-full"
                      value={year}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYear(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Roll Number"
                      className="input-field text-sm sm:text-base w-full"
                      value={rollNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRollNumber(e.target.value)}
                    />
                  </motion.div>
                )}
                {role !== 'admin' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 sm:space-y-5"
                  >
                    <input
                      type="text"
                      placeholder="Department"
                      className="input-field text-sm sm:text-base w-full"
                      value={department}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDepartment(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Passout Year"
                      className="input-field text-sm sm:text-base w-full"
                      value={passoutYear}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassoutYear(e.target.value)}
                    />
                  </motion.div>
                )}
                <button
                  disabled={!isFormFilled}
                  className="auth-button w-full py-2 rounded-lg text-white font-medium text-sm sm:text-base"
                >
                  Sign Up
                </button>
                <p className="text-center text-secondary text-xs sm:text-sm">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="link-text">
                    Sign In
                  </Link>
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        {/* Illustration Section */}
        <div className="w-full sm:w-1/2 bg-pure-white-feature dark:bg-blue-light flex items-center justify-center p-4 sm:p-6 min-h-[200px] sm:min-h-full">
          <Image
            src="/signup.png"
            alt="Signup Illustration"
            width={600}
            height={600}
            className="object-contain max-h-[50vh] sm:max-h-full sm:h-full sm:w-full"
            priority
          />
        </div>
      </motion.div>
    </div>
  )
}