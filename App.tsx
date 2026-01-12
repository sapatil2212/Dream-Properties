import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UserRole } from './types.ts';
import { Sidebar, DashboardHeader } from './components/LayoutComponents.tsx';
import { HomePage } from './pages/Home.tsx';
import { PropertyListingPage } from './pages/Properties.tsx';
import { PropertyDetailsPage } from './pages/PropertyDetails.tsx';
import { CategoryDetailPage } from './pages/CategoryDetailPage.tsx';
import { NotFoundPage } from './pages/NotFound.tsx';
import { AboutPage } from './pages/About.tsx';
import { ContactPage } from './pages/Contact.tsx';
import { PrivacyPolicy } from './pages/PrivacyPolicy.tsx';
import { TermsOfService } from './pages/TermsOfService.tsx';
import { 
  SuperAdminDashboard, BuilderDashboard, TelecallerDashboard, SalesExecutiveDashboard,
  BuildersManagement, InventoryManagement, LeadsHub, UserManagement, FinanceView, ReportsView, SettingsView
} from './pages/DashboardPages.tsx';
import { Card, Button, Input, Modal } from './components/UIComponents.tsx';
import { QuickBanner } from './components/QuickBanner.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { Mail, Lock, User, ArrowRight, Key, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const AuthPage: React.FC<{ onLogin: (role: UserRole) => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.SUPER_ADMIN);
  const [showForgotModal, setShowForgotModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8">
      <motion.div 
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`bg-white w-full max-w-5xl flex flex-col ${isLogin ? 'md:flex-row' : 'md:flex-row-reverse'} rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100 min-h-[650px]`}
      >
        <motion.div layout className="w-full md:w-1/2 relative hidden md:block">
          <img 
            src={isLogin 
              ? "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200" 
              : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200"
            } 
            alt="Luxury Real Estate" className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>

        <motion.div layout className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center items-center bg-white relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm mt-4"
            >
              <div className="mb-10 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">{isLogin ? 'Sign In' : 'Create Account'}</h1>
                <p className="text-slate-400 text-sm font-medium">{isLogin ? 'Enter your credentials to access your dashboard' : 'Register as a builder or buyer to get started'}</p>
              </div>

              <div className="space-y-4">
                {!isLogin && <Input label="Full Name" placeholder="John Doe" icon={<User size={18} />} />}
                <Input label="Email Address" placeholder="name@company.com" icon={<Mail size={18} />} />
                <Input label="Password" type="password" placeholder="••••••••" icon={<Lock size={18} />} />
                
                {isLogin && (
                  <div className="flex justify-end">
                    <button onClick={() => setShowForgotModal(true)} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">Forgot Password?</button>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Access Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    {Object.values(UserRole).map(r => (<option key={r} value={r}>{r.replace('_', ' ')}</option>))}
                  </select>
                </div>

                <Button className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] mt-6 gap-2 shadow-none" onClick={() => onLogin(role)}>
                  {isLogin ? 'Enter Dashboard' : 'Create My Account'}
                  <ArrowRight size={16} />
                </Button>

                <div className="text-center mt-8">
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-blue-600 hover:text-blue-700 font-black border-none bg-transparent cursor-pointer p-0">{isLogin ? 'Sign Up Now' : 'Sign In Instead'}</button>
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <Modal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} title="Reset Password">
        <div className="space-y-6">
          <p className="text-slate-500 text-sm font-medium leading-relaxed">Please provide your email address and Permanent Security Key (PSK) to verify your identity.</p>
          <div className="space-y-4">
            <Input label="Email Address" placeholder="name@company.com" icon={<Mail size={18} />} />
            <Input label="PSK (Permanent Security Key)" placeholder="Enter 6-digit PSK" icon={<Key size={18} />} type="password" />
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <Button className="w-full py-3 rounded-xl font-black uppercase tracking-widest text-[11px]" onClick={() => setShowForgotModal(false)}>Verify & Reset Password</Button>
            <Button variant="ghost" className="w-full py-3 rounded-xl font-black uppercase tracking-widest text-[11px] gap-2" onClick={() => setShowForgotModal(false)}>
              <ArrowLeft size={16} /> Back to Sign In
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode, role: UserRole | null, onLogout: () => void }> = ({ children, role, onLogout }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const isDashboard = location.pathname.startsWith('/dashboard');

  if (!isDashboard) {
    return (
      <div className="flex flex-col min-h-screen">
        <QuickBanner />
        <Navbar onAuthClick={() => window.location.hash = '#/login'} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    );
  }

  if (!role) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} collapsed={collapsed} setCollapsed={setCollapsed} onLogout={onLogout} />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <DashboardHeader 
          title={location.pathname.split('/').pop()?.replace('-', ' ').toUpperCase() || 'DASHBOARD'} 
          user={{ name: 'John Doe', role }} 
        />
        <main className="p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    window.location.hash = '#/dashboard';
  };

  const handleLogout = () => {
    setUserRole(null);
    window.location.hash = '#/login';
  };

  return (
    <HashRouter>
      <ScrollToTop />
      <Layout role={userRole} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertyListingPage />} />
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
          <Route path="/category/:slug" element={<CategoryDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/login" element={<AuthPage onLogin={handleLogin} />} />
          
          {/* Dashboard Sub-routes */}
          <Route path="/dashboard" element={
            userRole === UserRole.SUPER_ADMIN ? <SuperAdminDashboard /> :
            userRole === UserRole.ADMIN ? <SuperAdminDashboard /> :
            userRole === UserRole.BUILDER ? <BuilderDashboard /> :
            userRole === UserRole.TELECALLER ? <TelecallerDashboard /> :
            userRole === UserRole.SALES_EXECUTIVE ? <SalesExecutiveDashboard /> :
            <Navigate to="/login" replace />
          } />
          
          <Route path="/dashboard/builders" element={<BuildersManagement />} />
          <Route path="/dashboard/properties" element={<InventoryManagement />} />
          <Route path="/dashboard/leads" element={<LeadsHub />} />
          <Route path="/dashboard/follow-ups" element={<LeadsHub />} />
          <Route path="/dashboard/site-visits" element={<LeadsHub />} />
          <Route path="/dashboard/users" element={<UserManagement />} />
          <Route path="/dashboard/employees" element={<UserManagement />} />
          <Route path="/dashboard/billing" element={<FinanceView />} />
          <Route path="/dashboard/finance" element={<FinanceView />} />
          <Route path="/dashboard/reports" element={<ReportsView />} />
          <Route path="/dashboard/settings" element={<SettingsView />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;