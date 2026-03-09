'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Github, Tent, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-orange-500' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-amber-500' };
  if (score <= 4) return { score, label: 'Strong', color: 'bg-emerald-500' };
  return { score, label: 'Very Strong', color: 'bg-emerald-400' };
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validateField = useCallback((field: string, value: string, allData?: typeof formData): string | undefined => {
    const data = allData || formData;
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 3) return 'Name must be at least 3 characters';
        if (value.trim().length > 30) return 'Name must be under 30 characters';
        if (!/^[a-zA-Z0-9_ ]+$/.test(value.trim())) return 'Only letters, numbers, spaces, and underscores';
        return undefined;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        return undefined;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return undefined;
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== data.password) return 'Passwords do not match';
        return undefined;
      default:
        return undefined;
    }
  }, [formData]);

  const handleChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validateField(field, value, newData) }));
    }
    // Re-validate confirmPassword when password changes
    if (field === 'password' && touched['confirmPassword']) {
      setErrors(prev => ({ ...prev, confirmPassword: validateField('confirmPassword', newData.confirmPassword, newData) }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, formData[field as keyof typeof formData]) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fields = isLogin ? ['email', 'password'] : ['name', 'email', 'password', 'confirmPassword'];
    const newTouched: Record<string, boolean> = {};
    const newErrors: FormErrors = {};

    fields.forEach(field => {
      newTouched[field] = true;
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) (newErrors as Record<string, string>)[field] = error;
    });

    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Validation passed — navigate to feed (real auth comes later)
      window.location.href = '/';
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Reset errors when switching modes
  const handleModeSwitch = (login: boolean) => {
    setIsLogin(login);
    setErrors({});
    setTouched({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0a09] p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/15 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-stone-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-stone-800 overflow-hidden relative z-10"
      >
        <div className="p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-amber-500/20">
              <Tent size={24} />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500" style={{ fontFamily: 'var(--font-display)' }}>
              Shelter
            </span>
          </div>

          <div className="flex bg-stone-800 p-1 rounded-xl mb-8 border border-stone-700">
            <button 
              onClick={() => handleModeSwitch(true)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${isLogin ? 'bg-stone-700 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => handleModeSwitch(false)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${!isLogin ? 'bg-stone-700 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'}`}
            >
              Sign Up
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Full Name */}
                  <div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={20} />
                      <input 
                        type="text" 
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        onBlur={() => handleBlur('name')}
                        className={`w-full pl-10 pr-4 py-3 bg-stone-800/50 border rounded-xl text-white placeholder:text-stone-500 focus:outline-none transition-colors ${
                          errors.name && touched.name ? 'border-red-500 focus:border-red-400' : 'border-stone-700 focus:border-amber-500'
                        }`}
                      />
                      {touched.name && !errors.name && formData.name && (
                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                      )}
                    </div>
                    <AnimatePresence>
                      {errors.name && touched.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-red-400 text-xs mt-1.5 flex items-center gap-1 pl-1"
                        >
                          <AlertCircle size={12} />
                          {errors.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={20} />
                <input 
                  type="email" 
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full pl-10 pr-4 py-3 bg-stone-800/50 border rounded-xl text-white placeholder:text-stone-500 focus:outline-none transition-colors ${
                    errors.email && touched.email ? 'border-red-500 focus:border-red-400' : 'border-stone-700 focus:border-amber-500'
                  }`}
                />
                {touched.email && !errors.email && formData.email && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                )}
              </div>
              <AnimatePresence>
                {errors.email && touched.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-red-400 text-xs mt-1.5 flex items-center gap-1 pl-1"
                  >
                    <AlertCircle size={12} />
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`w-full pl-10 pr-12 py-3 bg-stone-800/50 border rounded-xl text-white placeholder:text-stone-500 focus:outline-none transition-colors ${
                    errors.password && touched.password ? 'border-red-500 focus:border-red-400' : 'border-stone-700 focus:border-amber-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && touched.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-red-400 text-xs mt-1.5 flex items-center gap-1 pl-1"
                  >
                    <AlertCircle size={12} />
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
              {/* Password strength indicator (signup only) */}
              {!isLogin && formData.password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2"
                >
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= passwordStrength.score ? passwordStrength.color : 'bg-stone-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    passwordStrength.score <= 1 ? 'text-red-400' :
                    passwordStrength.score <= 2 ? 'text-orange-400' :
                    passwordStrength.score <= 3 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {passwordStrength.label}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Confirm Password (signup only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={20} />
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                      className={`w-full pl-10 pr-12 py-3 bg-stone-800/50 border rounded-xl text-white placeholder:text-stone-500 focus:outline-none transition-colors ${
                        errors.confirmPassword && touched.confirmPassword ? 'border-red-500 focus:border-red-400' : 'border-stone-700 focus:border-amber-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-red-400 text-xs mt-1.5 flex items-center gap-1 pl-1"
                      >
                        <AlertCircle size={12} />
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remember me & Forgot password */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                      rememberMe ? 'bg-amber-500 border-amber-500' : 'border-stone-600 group-hover:border-stone-400'
                    }`}
                  >
                    {rememberMe && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-sm text-stone-400 group-hover:text-stone-300 transition-colors select-none">Remember me</span>
                </label>
                <a href="#" className="text-sm text-amber-400 hover:text-amber-300 font-medium">Forgot password?</a>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 group shadow-lg shadow-amber-500/20 mt-6"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute inset-x-0 h-px bg-stone-700"></div>
              <span className="relative bg-stone-900 px-4 text-sm text-stone-500">Or continue with</span>
            </div>
            
            <button className="w-full py-3 bg-stone-800 border border-stone-700 text-stone-300 rounded-xl font-medium hover:bg-stone-700 transition-colors flex items-center justify-center gap-3">
              <Github size={20} />
              GitHub
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
