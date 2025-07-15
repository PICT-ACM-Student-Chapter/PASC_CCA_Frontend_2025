"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { RoleToggle } from "@/components/auth/RoleToggle";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { Department, IUser } from "@/types/auth";
import { IAdmin } from "@/types/auth";
import axios from "axios";

export default function Signup() {

  const [role, setRole] = useState("student");
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [year, setYear] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [passoutYear, setPassoutYear] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setAuth } = useAuthStore();

    
  const handleRoleChange = (selectedRole: string) => {
    setRole(selectedRole);
  };

  const isFormFilled =
    firstName.trim() !== "" &&
    surname.trim() !== "" &&
    email.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    (role === "admin" || (department.trim() !== "" && passoutYear.trim() !== "")) &&
    (role !== "student" || (year.trim() !== "" && rollNumber.trim() !== ""));


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const endpoint =
      role === "admin"
        ? "http://localhost:4000/api/auth/admin/register"
        : "http://localhost:4000/api/auth/user/register";

    try {
      let payload;
      if (role === "student") {
        payload = {
          name: `${firstName} ${surname}`,
          email: email,
          password: password,
          department: department as Department,
          year: Number(year),
          passoutYear: Number(passoutYear),
          roll: Number(rollNumber),
          hours: 0,
        };
      } else {
        payload = {
          name: `${firstName} ${surname}`,
          email: email,
          password: password,
        };
      }
      const res = await axios.post(endpoint, payload);
      const data = res.data;
      const authResponse = data.data;
      if (data.success) {
        setAuth({
          user: role === "student" ? authResponse.user : undefined,
          admin: role === "admin" ? authResponse.admin : undefined,
          role: role as "student" | "admin",
        });
        if (authResponse.token) {
          localStorage.setItem("token", authResponse.token);
        }
        window.location.href = "/auth/login";
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err: any) {
      console.log(err.response?.data);
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 -mt-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row w-full max-w-screen-xl min-h-[600px] rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="w-full sm:w-1/2 p-4 sm:p-6 lg:p-10 flex flex-col bg-faint-blue-feature dark:bg-card min-h-[600px]">
          <div className="lg:max-w-sm mx-0 sm:mx-auto w-full flex flex-col mt-0 sm:mt-4">
            <div className="mb-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-blue-500">
                Join the PICT ACM Community
              </h2>
            </div>
            <RoleToggle onRoleChange={handleRoleChange} />
            <form onSubmit={handleSignup}>
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
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Surname"
                      className="input-field text-sm sm:text-base w-1/2"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      required
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    className="input-field text-sm sm:text-base w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="input-field text-sm sm:text-base w-full pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-500"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      className="input-field text-sm sm:text-base w-full pr-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-500"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  {role === "student" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 sm:space-y-5"
                    >
                      <input
                        type="text"
                        placeholder="Year"
                        className="input-field text-sm sm:text-base w-full"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Roll Number"
                        className="input-field text-sm sm:text-base w-full"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        required
                      />
                    </motion.div>
                  )}
                  {role !== "admin" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 sm:space-y-5"
                    >
                      <input
                        type="text"
                        placeholder="Department"
                        className="input-field text-sm sm:text-base w-full"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Passout Year"
                        className="input-field text-sm sm:text-base w-full"
                        value={passoutYear}
                        onChange={(e) => setPassoutYear(e.target.value)}
                        required
                      />
                    </motion.div>
                  )}
                  {/* {error && (
                    <div className="text-red-500 text-xs sm:text-sm">{error}</div>
                  )} */}
                  <button
                    type="submit"
                    disabled={!isFormFilled || loading}
                    className="auth-button w-full py-2 rounded-lg text-white font-medium text-sm sm:text-base"
                  >
                    {loading ? "Signing up..." : "Sign Up"}
                  </button>
                  <p className="text-center text-secondary text-xs sm:text-sm">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="link-text">
                      Sign In
                    </Link>
                  </p>
                </motion.div>
              </AnimatePresence>
            </form>
          </div>
        </div>
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
  );
}

