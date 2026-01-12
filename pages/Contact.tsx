import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Instagram, Linkedin, Facebook } from 'lucide-react';
import { Button, Card, Input } from '../components/UIComponents.tsx';

export const ContactPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Thank you! Our consultant will call you shortly.");
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-slate-900 py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-blue-400 font-black text-[10px] uppercase tracking-[0.5em] mb-4 block"
          >
            Connect With Us
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6"
          >
            Let's Find Your <br />
            <span className="text-blue-400">Future Address</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg font-medium italic max-w-xl mx-auto"
          >
            Have a question or want to schedule a site visit? Our expert advisors are ready to assist you 24/7.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-12 gap-12 items-start">
        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7"
        >
          <Card className="p-8 md:p-12 shadow-2xl shadow-slate-200 border-none rounded-[3rem]">
            <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">Drop us a line</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input label="Your Name" placeholder="John Doe" required />
                <Input label="Phone Number" placeholder="+91 XXXXX XXXXX" required />
              </div>
              <Input label="Email Address" placeholder="john@example.com" type="email" required />
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Message</label>
                <textarea 
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 outline-none text-sm font-medium min-h-[150px] transition-all"
                  placeholder="Tell us what you're looking for..."
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full md:w-auto px-10 py-4 rounded-xl shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-[11px] gap-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                <Send size={16} />
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Contact Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-5 space-y-8"
        >
          {/* Main Office Card */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Our Headquarters</h3>
            
            <div className="space-y-6">
              {[
                { icon: <MapPin className="text-blue-600" />, label: "Visit Us", value: "Office No 957, 9th floor, Roongtha Future-X, RD circle, Nashik 422 009" },
                { icon: <Phone className="text-blue-600" />, label: "Call Us", value: "+91 98811 59245" },
                { icon: <Mail className="text-blue-600" />, label: "Email Us", value: "dreampropertiesnsk@gmail.com" },
                { icon: <Clock className="text-blue-600" />, label: "Working Hours", value: "Mon - Sat: 10:00 AM - 07:00 PM" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{item.label}</p>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="pt-8 border-t border-slate-200">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Stay Connected</h3>
             <div className="flex gap-4">
                {[
                  { icon: <Instagram size={20} />, href: "#" },
                  { icon: <Linkedin size={20} />, href: "#" },
                  { icon: <Facebook size={20} />, href: "#" },
                  { icon: <MessageCircle size={20} />, href: "#" }
                ].map((social, i) => (
                  <a 
                    key={i} 
                    href={social.href} 
                    className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 hover:shadow-lg transition-all"
                  >
                    {social.icon}
                  </a>
                ))}
             </div>
          </div>

          {/* Mini Map Placeholder */}
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl">
             <img 
               src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=800" 
               alt="Map placeholder"
               className="w-full h-full object-cover grayscale opacity-50"
             />
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-600/10">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-xl border-4 border-blue-50">
                   <MapPin size={24} />
                </div>
                <button className="mt-4 px-6 py-2 bg-white rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-lg hover:bg-slate-50 transition-colors">
                  Open in Maps
                </button>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};