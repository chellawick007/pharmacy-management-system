import React, { useState } from "react";
import { Mail, Lock, User, Building, Pill, ShieldCheck, Sparkles } from "lucide-react";

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    email: "",
    username: "",
    password: "",
    full_name: "",
    role: "pharmacist",
  });

  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Login failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SIGNUP ----------------
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Signup failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-6xl">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center lg:w-1/2 space-y-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-2xl opacity-30"></div>
            <div className="relative bg-white p-8 rounded-full shadow-2xl">
              <Pill className="w-24 h-24 text-blue-600" strokeWidth={1.5} />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Smart Pharmacy
            </h1>
            <p className="text-xl text-gray-600 font-medium">Next-Gen Management System</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/40">
              <ShieldCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">Secure</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/40">
              <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">AI-Powered</p>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/40 space-y-6">
            {/* Mobile Header */}
            <div className="text-center space-y-2 lg:hidden">
              <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
                <Pill className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Smart Pharmacy
              </h1>
              <p className="text-gray-500 text-sm">Management System</p>
            </div>

            {/* Tabs */}
            <div className="flex bg-gradient-to-r from-blue-100 to-purple-100 p-1 rounded-xl">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 rounded-lg transition-all duration-300 font-medium ${
                  isLogin
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg text-white transform scale-105"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Login
              </button>

              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 rounded-lg transition-all duration-300 font-medium ${
                  !isLogin
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg text-white transform scale-105"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center animate-shake">
                {error}
              </div>
            )}

            {/* ============ LOGIN FORM ============ */}
            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input
                      type="email"
                      required
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input
                      type="password"
                      required
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
            ) : (
              // ============ SIGNUP FORM ============
              <form onSubmit={handleSignup} className="space-y-4">
                {/* Full Name */}
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={18} />
                    <input
                      type="text"
                      required
                      value={signupData.full_name}
                      onChange={(e) =>
                        setSignupData({ ...signupData, full_name: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={18} />
                    <input
                      type="text"
                      required
                      value={signupData.username}
                      onChange={(e) =>
                        setSignupData({ ...signupData, username: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                      placeholder="johndoe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={18} />
                    <input
                      type="email"
                      required
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({ ...signupData, email: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={18} />
                    <input
                      type="password"
                      required
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({ ...signupData, password: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Role</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={18} />
                    <select
                      value={signupData.role}
                      onChange={(e) =>
                        setSignupData({ ...signupData, role: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none appearance-none bg-white"
                    >
                      <option value="pharmacist">Pharmacist</option>
                      <option value="cashier">Cashier</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </form>
            )}

            {/* Demo Credentials */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Demo Credentials</p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-lg inline-block">
                <p className="text-sm">
                  <span className="font-semibold text-gray-700">admin@pharmacy.com</span>
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="font-semibold text-gray-700">admin123</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}
