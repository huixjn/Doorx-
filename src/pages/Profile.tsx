import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon, Mail, Phone, Home, Sparkles, ShoppingBag, MapPin, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface ProfileProps {
  user: User | null;
  dbUser: any;
  onUpdate?: () => void;
}

export default function Profile({ user, dbUser, onUpdate }: ProfileProps) {
  const [mobileNumber, setMobileNumber] = useState(dbUser?.mobileNumber || '');
  const [address, setAddress] = useState(dbUser?.address || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dbUser) {
      setMobileNumber(dbUser.mobileNumber || '');
      setAddress(dbUser.address || '');
    }
  }, [dbUser]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/users/update', {
        email: user?.email,
        role: dbUser.role,
        mobileNumber,
        address,
      });
      toast.success('Profile updated successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !dbUser) return null;

  const isCreator = dbUser.role === 'creator';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <header className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-[2.5rem] bg-neutral-100 border-4 border-white shadow-2xl overflow-hidden mx-auto">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-brand/5">
                <UserIcon className="w-12 h-12 text-blue-brand" />
              </div>
            )}
          </div>
          <Badge className={`absolute -bottom-2 -right-2 px-4 py-1.5 rounded-xl border-4 border-white font-black uppercase text-[10px] ${isCreator ? 'bg-blue-brand text-white' : 'bg-banana-green text-black'}`}>
            {dbUser.role}
          </Badge>
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-neutral-900">{user.displayName || 'Anonymous User'}</h1>
          <p className="text-neutral-500 font-medium">{user.email}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="border-neutral-200 rounded-[2.5rem] shadow-sm overflow-hidden">
            <CardHeader className="bg-neutral-50 border-b border-neutral-200 p-8">
              <CardTitle className="text-xl font-black uppercase tracking-tight">Personal Details</CardTitle>
              <CardDescription>Update your contact and shipping information.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Account Type</Label>
                    <div className="flex items-center gap-2 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 opacity-60">
                      <Sparkles className={`w-5 h-5 ${isCreator ? 'text-blue-brand' : 'text-banana-green'}`} />
                      <span className="font-bold text-sm capitalize">{dbUser.role} Account</span>
                    </div>
                  </div>

                  {isCreator && (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Mobile Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input 
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="pl-12 h-14 rounded-2xl bg-neutral-50 border-none focus:ring-2 focus:ring-blue-brand font-bold"
                          placeholder="+91 00000 00000"
                        />
                      </div>
                    </div>
                  )}

                  {!isCreator && (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Default Shipping Address</Label>
                      <div className="relative">
                        <Home className="absolute left-4 top-4 w-4 h-4 text-neutral-400" />
                        <textarea 
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full pl-12 p-4 min-h-[120px] rounded-2xl bg-neutral-50 border-none focus:ring-2 focus:ring-banana-green font-bold text-sm"
                          placeholder="Enter your full address..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  disabled={loading}
                  className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all ${isCreator ? 'bg-blue-brand hover:bg-neutral-900 text-white' : 'bg-banana-green hover:bg-neutral-900 text-black'}`}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-neutral-200 rounded-[2rem] overflow-hidden bg-neutral-900 text-white">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-brand flex items-center justify-center">
                  <Clock className="w-5 h-5 text-banana-green" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Member Since</p>
                  <p className="font-bold">{new Date(dbUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-banana-green" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Status</p>
                  <p className="font-bold">Verified Account</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 px-2">Account Activity</h3>
            <div className="space-y-2">
              <div className="p-4 rounded-2xl bg-white border border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 text-blue-brand" />
                  <span className="text-sm font-bold">Total Orders</span>
                </div>
                <Badge variant="outline" className="rounded-lg border-neutral-200">12</Badge>
              </div>
              {isCreator && (
                <div className="p-4 rounded-2xl bg-white border border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-banana-green" />
                    <span className="text-sm font-bold">Product Rating</span>
                  </div>
                  <Badge variant="outline" className="rounded-lg border-neutral-200">4.9/5</Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
