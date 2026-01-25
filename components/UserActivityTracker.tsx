'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function UserActivityTracker() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return;

    // Function to send heartbeat
    const sendHeartbeat = async () => {
      try {
        await fetch('/api/user/heartbeat', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        console.error('Heartbeat failed', err);
      }
    };

    // Send immediately on mount
    sendHeartbeat();

    // Set interval to send every 2 minutes
    const interval = setInterval(sendHeartbeat, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [session]);

  return null;
}
