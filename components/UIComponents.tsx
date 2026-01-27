import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Inbox, Loader2, Eye, EyeOff, ArrowUpRight, CheckCircle, XCircle, AlertCircle, AlertTriangle, Search, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export const StatCard: React.FC<{ label: string, value: string, trend: string, trendUp?: boolean, icon: React.ReactNode, color: string, className?: string }> = ({ label, value, trend, trendUp = true, icon, color, className = '' }) => (
  <Card className={`p-6 group hover:border-blue-200 transition-all duration-300 ${className}`}>
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
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={isLoading || props.disabled} suppressHydrationWarning {...props}>
      {isLoading ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-2xl border border-slate-200 ${className}`}
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
          suppressHydrationWarning
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
            suppressHydrationWarning
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
  size?: 'sm' | 'md',
  icon?: React.ReactNode,
  error?: string,
  label?: string
}> = ({ options, value, onChange, placeholder = 'Select option', className = '', size = 'md', icon, error, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Small delay to ensure render
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`} ref={containerRef}>
      {label && <label className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">{label}</label>}
      <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white border rounded-xl font-bold text-slate-700 focus:outline-none transition-all ${
          size === 'sm' ? 'px-3 py-1 text-[9px]' : 'px-3.5 py-2 text-[13px]'
        } ${error ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'}`}
        suppressHydrationWarning
      >
        <div className="flex items-center overflow-hidden">
          {icon && <span className="mr-2 text-slate-400 flex-shrink-0">{icon}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown size={size === 'sm' ? 10 : 14} className={`ml-2 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-bold text-rose-500 tracking-tight mt-1"
        >
          {error}
        </motion.p>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-[9999] top-full mt-2 left-0 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col"
          >
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-100 text-slate-700 placeholder:text-slate-400"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={`w-full text-left px-4 py-2 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors ${value === option.value ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    suppressHydrationWarning
                  >
                    {option.label}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-center text-xs text-slate-400 font-medium">
                  No options found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export const DatePicker: React.FC<{
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}> = ({ label, value, onChange, error, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const dateValue = value ? new Date(value) : null;
  const [viewDate, setViewDate] = useState(dateValue || new Date());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const formatted = newDate.toISOString().split('T')[0];
    onChange(formatted);
    setIsOpen(false);
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`} ref={containerRef}>
      {label && <label className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3.5 py-2 bg-white border rounded-xl font-medium text-[13px] text-slate-700 focus:outline-none transition-all ${error ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'}`}
        >
           <div className="flex items-center gap-2">
             <Calendar size={18} className="text-slate-400" />
             <span className={!value ? 'text-slate-400' : ''}>{value || 'Select Date'}</span>
           </div>
           <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
             <motion.div
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="absolute z-[9999] top-full mt-2 left-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-4"
             >
               <div className="flex items-center justify-between mb-4 px-1 gap-2">
                 <div className="flex items-center gap-1">
                   <select 
                     value={viewDate.getMonth()} 
                     onChange={(e) => setViewDate(new Date(viewDate.getFullYear(), parseInt(e.target.value), 1))}
                     className="text-xs font-bold text-slate-700 bg-transparent cursor-pointer focus:outline-none hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-50"
                     onClick={(e) => e.stopPropagation()}
                   >
                     {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                   </select>
                   <select 
                     value={viewDate.getFullYear()} 
                     onChange={(e) => setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth(), 1))}
                     className="text-xs font-bold text-slate-700 bg-transparent cursor-pointer focus:outline-none hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-50"
                     onClick={(e) => e.stopPropagation()}
                   >
                     {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 80 + i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                   </select>
                 </div>
                 <div className="flex gap-1">
                   <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"><ChevronLeft size={14} /></button>
                   <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"><ChevronRight size={14} /></button>
                 </div>
               </div>
               <div className="grid grid-cols-7 gap-1 mb-2">
                 {days.map(d => <div key={d} className="text-center text-[10px] font-bold text-slate-400">{d}</div>)}
               </div>
               <div className="grid grid-cols-7 gap-1">
                 {Array.from({ length: getFirstDayOfMonth(viewDate) }).map((_, i) => <div key={`empty-${i}`} />)}
                 {Array.from({ length: getDaysInMonth(viewDate) }).map((_, i) => {
                   const day = i + 1;
                   const isSelected = value && new Date(value).getDate() === day && new Date(value).getMonth() === viewDate.getMonth() && new Date(value).getFullYear() === viewDate.getFullYear();
                   return (
                     <button
                       key={day}
                       type="button"
                       onClick={(e) => { e.stopPropagation(); handleDayClick(day); }}
                       className={`h-8 w-8 rounded-full text-xs font-medium flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white' : 'text-slate-700'}`}
                     >
                       {day}
                     </button>
                   );
                 })}
               </div>
             </motion.div>
          )}
        </AnimatePresence>
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

export const Modal: React.FC<{ isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode, className?: string }> = ({ isOpen, onClose, title, children, className = 'max-w-xl' }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
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
              className={`bg-white rounded-2xl shadow-2xl w-full ${className} pointer-events-auto`}
            >
              {title && (
                <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center rounded-t-2xl">
                  <h3 className="font-black uppercase tracking-tight text-slate-900">{title}</h3>
                  <button onClick={onClose} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors" suppressHydrationWarning>
                    <X size={20} />
                  </button>
                </div>
              )}
              <div className="p-4">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

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

// Alert/Notification Component
export const Alert: React.FC<{
  isOpen: boolean,
  onClose: () => void,
  type: 'success' | 'error' | 'warning' | 'info',
  title: string,
  message: string,
  autoClose?: boolean,
  duration?: number
}> = ({ isOpen, onClose, type, title, message, autoClose = true, duration = 3000 }) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: <CheckCircle size={24} className="text-emerald-600" />,
      iconBg: 'bg-emerald-100',
      title: 'text-emerald-900',
      message: 'text-emerald-700'
    },
    error: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      icon: <XCircle size={24} className="text-rose-600" />,
      iconBg: 'bg-rose-100',
      title: 'text-rose-900',
      message: 'text-rose-700'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <AlertTriangle size={24} className="text-amber-600" />,
      iconBg: 'bg-amber-100',
      title: 'text-amber-900',
      message: 'text-amber-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: <AlertCircle size={24} className="text-blue-600" />,
      iconBg: 'bg-blue-100',
      title: 'text-blue-900',
      message: 'text-blue-700'
    }
  };

  const style = styles[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[10000]"
          />
          <div className="fixed inset-0 flex items-start justify-center pt-20 p-4 z-[10001] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className={`${style.bg} ${style.border} border-2 rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden`}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`${style.iconBg} p-3 rounded-full flex-shrink-0`}>
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-black ${style.title} mb-1`}>{title}</h3>
                    <p className={`text-sm font-medium ${style.message}`}>{message}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-white/50 transition-colors flex-shrink-0"
                  >
                    <X size={18} className="text-slate-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// Confirmation Dialog Component
export const ConfirmDialog: React.FC<{
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void,
  title: string,
  message: string,
  confirmText?: string,
  cancelText?: string,
  type?: 'danger' | 'warning' | 'info',
  isLoading?: boolean
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger', isLoading = false }) => {
  const styles = {
    danger: {
      bg: 'bg-rose-50',
      icon: <XCircle size={32} className="text-rose-600" />,
      iconBg: 'bg-rose-100',
      button: 'bg-rose-600 hover:bg-rose-700'
    },
    warning: {
      bg: 'bg-amber-50',
      icon: <AlertTriangle size={32} className="text-amber-600" />,
      iconBg: 'bg-amber-100',
      button: 'bg-amber-600 hover:bg-amber-700'
    },
    info: {
      bg: 'bg-blue-50',
      icon: <AlertCircle size={32} className="text-blue-600" />,
      iconBg: 'bg-blue-100',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const style = styles[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[10000]"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[10001] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className={`${style.iconBg} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6`}>
                  {style.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">{title}</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed mb-8">{message}</p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {cancelText}
                  </Button>
                  <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`flex-1 ${style.button} text-white font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2`}
                  >
                    {isLoading && <Loader2 className="animate-spin" size={14} />}
                    {confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
