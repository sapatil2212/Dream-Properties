'use client';

import { useEffect } from 'react';

// Generate a session ID for the visitor
function getSessionId() {
  if (typeof window === 'undefined') return null;
  
  let sessionId = sessionStorage.getItem('visitor_session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('visitor_session_id', sessionId);
  }
  return sessionId;
}

// Check if this is a new session (no recent visit in last 30 minutes)
function isNewSession() {
  if (typeof window === 'undefined') return false;
  
  const lastVisit = sessionStorage.getItem('visitor_last_visit');
  const now = Date.now();
  
  if (!lastVisit) {
    sessionStorage.setItem('visitor_last_visit', now.toString());
    return true;
  }
  
  const lastVisitTime = parseInt(lastVisit, 10);
  // Use 1 minute in development for easier testing, 30 minutes in production
  const sessionTimeout = process.env.NODE_ENV === 'development' ? 60 * 1000 : 30 * 60 * 1000;
  
  if (now - lastVisitTime > sessionTimeout) {
    sessionStorage.setItem('visitor_last_visit', now.toString());
    return true;
  }
  
  return false;
}

export function VisitorTracker() {
  useEffect(() => {
    // Only track on client side
    if (typeof window === 'undefined') return;
    
    // Only track new sessions (not every page reload)
    if (!isNewSession()) return;
    
    const trackVisitor = async () => {
      try {
        const sessionId = getSessionId();
        const page = window.location.pathname + window.location.search;
        
        await fetch('/api/visitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page,
            sessionId,
            referrer: document.referrer || null,
          }),
        });
      } catch (err) {
        // Silently fail - don't break user experience
        console.error('Visitor tracking failed:', err);
      }
    };
    
    // Track with a small delay to not block page load
    const timeoutId = setTimeout(trackVisitor, 1000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return null;
}
