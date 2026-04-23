import { Link } from 'react-router-dom';
import { User } from 'firebase/auth';
import { auth, signInWithGoogle, signInWithGithub } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Upload, LayoutDashboard, LogOut, User as UserIcon, PackageSearch, Github, ShieldCheck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface NavbarProps {
  user: User | null;
  dbUser?: any;
}

export default function Navbar({ user, dbUser }: NavbarProps) {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      toast.success('Logged in successfully');
    } catch (error) {
      toast.error('Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="bg-midnight/60 backdrop-blur-3xl border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:-rotate-6 duration-700 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                <ShoppingBag className="w-7 h-7 text-midnight" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-banana-green rounded-full border-2 border-midnight" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-heading text-3xl tracking-tighter text-white uppercase italic">door<span className="text-banana-green">x</span></span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.6em] text-white/20 ml-1">Terminal</span>
            </div>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-12">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <PackageSearch className="h-4 w-4 text-white/20 group-focus-within:text-banana-green transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Scan Protocol..."
                className="block w-full pl-12 pr-12 py-4 border border-white/5 rounded-2xl leading-5 bg-white/5 placeholder-white/10 text-white focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-banana-green/20 focus:border-banana-green/30 sm:text-sm transition-all font-mono font-bold"
                onClick={() => window.location.href = '/'}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => window.location.reload()}
                  className="h-8 w-8 rounded-xl hover:bg-white/10 text-white/20 hover:text-banana-green transition-all"
                  title="Quick Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-8">
            {user ? (
              <>
                <div className="flex items-center gap-2 sm:gap-4">
                  {dbUser?.role === 'creator' && (
                    <Link to="/upload">
                      <Button variant="ghost" className="gap-2 rounded-xl hover:bg-banana-green hover:text-midnight font-mono font-bold uppercase tracking-widest text-[9px] px-5 h-12">
                        <Upload className="w-4 h-4" />
                        <span className="hidden lg:inline">Initialize</span>
                      </Button>
                    </Link>
                  )}
                  <Link to="/dashboard">
                    <Button variant="ghost" className="gap-2 rounded-xl hover:bg-white/10 text-white font-mono font-bold uppercase tracking-widest text-[9px] px-5 h-12 border border-white/5">
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="hidden lg:inline">{dbUser?.role === 'creator' ? 'Station' : 'Account'}</span>
                    </Button>
                  </Link>
                  {dbUser?.role === 'admin' && (
                    <Link to="/admin">
                      <Button variant="ghost" className="gap-2 rounded-xl hover:bg-red-500 hover:text-white font-mono font-bold uppercase tracking-widest text-[9px] px-5 h-12 border border-red-500/20">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="hidden lg:inline">Master</span>
                      </Button>
                    </Link>
                  )}
                </div>
                <div className="h-10 w-px bg-white/5 mx-2" />
                <div className="flex items-center gap-4">
                  <Link to="/profile" className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-blue-brand to-banana-green rounded-2xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-700" />
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User" className="relative w-12 h-12 rounded-2xl border border-white/10 group-hover:border-white shadow-2xl object-cover transition-colors" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="relative w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white transition-colors">
                        <UserIcon className="w-6 h-6 text-white/40" />
                      </div>
                    )}
                  </Link>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white/20 hover:text-white hover:bg-red-500/10 rounded-xl transition-all h-12 w-12">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Button onClick={handleLogin} className="bg-white hover:bg-banana-green text-midnight rounded-xl px-10 h-14 font-heading text-xl uppercase tracking-tighter transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                  Connect
                </Button>
                <Button variant="outline" onClick={async () => {
                  try {
                    await signInWithGithub();
                    toast.success('Logged in with Github');
                  } catch (error) {
                    toast.error('Github login failed');
                  }
                }} className="rounded-xl w-14 h-14 p-0 border border-white/10 hover:border-white hover:bg-white/5 text-white transition-all hidden sm:flex items-center justify-center">
                  <Github className="w-6 h-6" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
