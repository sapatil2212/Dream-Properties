import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Inbox, Loader2, Eye, EyeOff, ArrowUpRight } from 'lucide-react';

export const StatCard: React.FC<{ label: string, value: string, trend: string, trendUp?: boolean, icon: React.ReactNode, color: string }> = ({ label, value, trend, trendUp = true, icon, color }) => (
  <Card className="p-6 group hover:border-blue-200 transition-all duration-300">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {trendUp ? <ArrowUpRight size={14} /> : null} {trend}
      </div>
    </div>
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</p>
    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
  </Card>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger', size?: 'sm' | 'md' | 'lg' | 'icon', isLoading?: boolean }> = ({ children, variant = 'primary', size = 'md', className = '', isLoading = false, ...props }) => {
  const base = "inline-flex items-center justify-center rounded-xl font-bold transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-[10px]";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    outline: "border-2 border-slate-200 bg-transparent hover:border-blue-600 hover:text-blue-600 text-slate-700",
    ghost: "bg-transparent hover:bg-slate-50 text-slate-600",
    danger: "bg-red-500 text-white hover:bg-red-600"
  };
  const sizes = {
    sm: "px-3 py-1",
    md: "px-4 py-2",
    lg: "px-6 py-2.5 text-[10px]",
    icon: "p-2"
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-2xl border border-slate-200 overflow-hidden ${className}`}
  >
    {children}
  </motion.div>
);

export const Badge: React.FC<{ children: React.ReactNode, variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral', className?: string }> = ({ children, variant = 'neutral', className = '' }) => {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    error: "bg-rose-50 text-rose-700 border-rose-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
    neutral: "bg-slate-100 text-slate-600 border-slate-200"
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, icon?: React.ReactNode, error?: string }> = ({ label, icon, error, className = '', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = props.type === 'password';
  const type = isPassword ? (showPassword ? 'text' : 'password') : props.type;

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`px-3.5 py-2 rounded-xl border bg-white transition-all focus:border-blue-500 outline-none disabled:bg-slate-50 text-[13px] font-medium w-full ${icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''} ${
            error ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
          } ${className}`}
          {...props}
          type={type}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-bold text-rose-500 tracking-tight"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export const Select: React.FC<{
  options: { label: string, value: string }[],
  value: string,
  onChange: (value: string) => void,
  placeholder?: string,
  className?: string,
  size?: 'sm' | 'md'
}> = ({ options, value, onChange, placeholder = 'Select option', className = '', size = 'md' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none transition-all ${
          size === 'sm' ? 'px-3 py-1 text-[9px]' : 'px-3.5 py-2 text-[13px]'
        }`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={size === 'sm' ? 10 : 14} className={`ml-2 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-[100] top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden py-2"
          >
            {options.map((option) => (
              <button
                key={option.value}
                className={`w-full text-left px-5 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors ${value === option.value ? 'text-blue-600 bg-blue-50/50' : 'text-slate-700'}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Modal: React.FC<{ isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[10000]"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[10001] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl pointer-events-auto overflow-hidden"
          >
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black uppercase tracking-tight text-slate-900">{title}</h3>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-8">
              {children}
            </div>
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>
);

export const EmptyState: React.FC<{ title: string, message: string, icon?: React.ReactNode }> = ({ title, message, icon }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mb-6">
      {icon || <Inbox size={32} />}
    </div>
    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">{title}</h3>
    <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto leading-relaxed">{message}</p>
  </div>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
);

export const DataTable: React.FC<{
  headers: string[],
  children: React.ReactNode,
  className?: string
}> = ({ headers, children, className = '' }) => (
  <div className={`overflow-x-auto no-scrollbar ${className}`}>
    <table className="w-full text-left">
      <thead className="bg-slate-50/50 border-b border-slate-100">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {children}
      </tbody>
    </table>
  </div>
);