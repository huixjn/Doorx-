/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GlobalRefreshButton from '@/components/GlobalRefreshButton';
import Onboarding from '@/components/Onboarding';
import Home from '@/pages/Home';
import Upload from '@/pages/Upload';
import ProductDetail from '@/pages/ProductDetail';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Admin from '@/pages/Admin';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import axios from 'axios';
import { toast } from 'sonner';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        try {
          const res = await axios.post('/api/users/sync', { 
            email: currentUser.email,
            displayName: currentUser.displayName 
          });
          setDbUser(res.data);
        } catch (error) {
          console.error('Failed to sync user:', error);
          toast.error('Connection Error', {
            description: 'We couldn\'t sync your profile with our servers.',
          });
        }
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-900">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-brand/20 border-t-blue-brand rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-banana-green rounded-lg animate-pulse shadow-[0_0_15px_rgba(204,255,0,0.5)]"></div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-white font-black uppercase tracking-[0.4em] text-xl italic drop-shadow-[0_0_10px_rgba(0,102,255,0.3)]">door<span className="text-blue-brand">x</span></h2>
            <div className="h-1 w-24 bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-brand to-banana-green animate-[loading_1.5s_infinite_linear] w-[50%] origin-left"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="dark min-h-screen bg-midnight font-sans text-white selection:bg-banana-green selection:text-midnight">
          {user && dbUser && !dbUser.isConfigured && (
            <Onboarding user={user} onComplete={(updated) => setDbUser(updated)} />
          )}
          <Navbar user={user} dbUser={dbUser} />
          <main className="min-h-[80vh]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload user={user} dbUser={dbUser} />} />
              <Route path="/product/:id" element={<ProductDetail user={user} />} />
              <Route path="/dashboard" element={<Dashboard user={user} dbUser={dbUser} />} />
              <Route path="/admin" element={<Admin user={user} dbUser={dbUser} />} />
              <Route path="/profile" element={<Profile user={user} dbUser={dbUser} onUpdate={() => {/* Trigger re-sync if needed */}} />} />
            </Routes>
          </main>
          <Footer />
          <GlobalRefreshButton />
          <Toaster position="top-center" richColors />
        </div>
      </Router>
    </ErrorBoundary>
  );
}
