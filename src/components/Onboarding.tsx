import { useState } from 'react';
import { User } from 'firebase/auth';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Phone, Home, Mail, User as UserIcon, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface OnboardingProps {
  user: User;
  onComplete: (updatedUser: any) => void;
}

export default function Onboarding({ user, onComplete }: OnboardingProps) {
  const [role, setRole] = useState<'creator' | 'buyer' | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return toast.error('Please select your role');
    
    if (role === 'creator' && !mobileNumber) {
      return toast.error('Mobile number is required for creators');
    }
    
    if (role === 'buyer' && !address) {
      return toast.error('Address is required for buyers');
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/users/update', {
        email: user.email,
        role,
        mobileNumber: role === 'creator' ? mobileNumber : undefined,
        address: role === 'buyer' ? address : undefined,
      });
      toast.success(`Welcome to doorx as a ${role}!`);
      onComplete(res.data);
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/80 backdrop-blur-xl p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-neutral-900 text-white p-8 space-y-2 text-center">
            <div className="w-16 h-16 bg-blue-brand rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Sparkles className="w-8 h-8 text-banana-green" />
            </div>
            <CardTitle className="text-3xl font-black uppercase tracking-tighter">Complete Your Profile</CardTitle>
            <CardDescription className="text-neutral-400 font-medium">
              Join the future of creator commerce. Choose how you want to use doorx.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('creator')}
                  className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${
                    role === 'creator'
                      ? 'border-blue-brand bg-blue-brand/5 scale-105 shadow-xl shadow-blue-brand/10'
                      : 'border-neutral-100 opacity-60 hover:opacity-100 hover:border-blue-brand/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${role === 'creator' ? 'bg-blue-brand text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="font-black uppercase tracking-widest text-xs">Creator</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${
                    role === 'buyer'
                      ? 'border-banana-green bg-banana-green/5 scale-105 shadow-xl shadow-banana-green/10'
                      : 'border-neutral-100 opacity-60 hover:opacity-100 hover:border-banana-green/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${role === 'buyer' ? 'bg-banana-green text-black' : 'bg-neutral-100 text-neutral-400'}`}>
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <span className="font-black uppercase tracking-widest text-xs">Buyer</span>
                </button>
              </div>

              {role && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6 pt-4 border-t border-neutral-100"
                >
                  {role === 'creator' ? (
                    <div className="space-y-2">
                      <Label htmlFor="mobile" className="font-black uppercase tracking-widest text-[10px] text-neutral-500">Mobile Verification</Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                          id="mobile"
                          placeholder="+91 98765 43210"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="pl-12 h-14 rounded-2xl bg-neutral-50 border-none focus:ring-2 focus:ring-blue-brand font-bold"
                          required
                        />
                      </div>
                      <p className="text-[10px] text-neutral-400 font-medium">Creators require mobile authentication for payout security.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="address" className="font-black uppercase tracking-widest text-[10px] text-neutral-500">Shipping Address</Label>
                      <div className="relative">
                        <Home className="absolute left-4 top-4 w-4 h-4 text-neutral-400" />
                        <textarea
                          id="address"
                          placeholder="Your full delivery address..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full pl-12 p-4 min-h-[100px] rounded-2xl bg-neutral-50 border-none focus:ring-2 focus:ring-banana-green font-bold text-sm"
                          required
                        />
                      </div>
                      <p className="text-[10px] text-neutral-400 font-medium">Required for digital asset licensing and physical billing.</p>
                    </div>
                  )}
                </motion.div>
              )}

              <Button
                disabled={!role || loading}
                className={`w-full h-16 rounded-[1.5rem] text-lg font-black uppercase tracking-widest transition-all ${
                  role === 'creator' 
                    ? 'bg-blue-brand hover:bg-neutral-900 text-white shadow-xl shadow-blue-brand/20' 
                    : role === 'buyer'
                    ? 'bg-banana-green hover:bg-neutral-900 text-black shadow-xl shadow-banana-green/20'
                    : 'bg-neutral-100 text-neutral-400 pointer-events-none'
                }`}
              >
                {loading ? 'Processing...' : `Start as ${role || 'user'}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

import { ShoppingCart } from 'lucide-react';
