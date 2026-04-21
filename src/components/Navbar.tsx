import { Link } from 'react-router-dom';
import { User } from 'firebase/auth';
import { auth, signInWithGoogle, signInWithGithub } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Upload, LayoutDashboard, LogOut, User as UserIcon, PackageSearch, Github } from 'lucide-react';
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
    <nav className="bg-white/70 backdrop-blur-2xl border-b border-neutral-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-neutral-900 rounded-[1rem] flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 duration-500 shadow-2xl">
                <ShoppingBag className="w-6 h-6 text-banana-green" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-brand rounded-full border-2 border-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-2xl tracking-[0.02em] text-neutral-900 uppercase italic">door<span className="text-blue-brand">x</span></span>
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-neutral-300 ml-0.5">Marketplace</span>
            </div>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-12">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <PackageSearch className="h-4 w-4 text-neutral-400 group-focus-within:text-blue-brand transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search assets..."
                className="block w-full pl-12 pr-4 py-3 border-2 border-neutral-50 rounded-2xl leading-5 bg-neutral-50/50 placeholder-neutral-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-brand/5 focus:border-blue-brand/20 sm:text-sm transition-all font-bold"
                onClick={() => window.location.href = '/'}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            {user ? (
              <>
                <div className="flex items-center gap-2 sm:gap-3">
                  {dbUser?.role === 'creator' && (
                    <Link to="/upload">
                      <Button variant="ghost" className="gap-2 rounded-2xl hover:bg-banana-green/20 hover:text-black font-black uppercase tracking-widest text-[9px] px-4">
                        <Upload className="w-4 h-4" />
                        <span className="hidden lg:inline">Upload</span>
                      </Button>
                    </Link>
                  )}
                  <Link to="/dashboard">
                    <Button variant="ghost" className="gap-2 rounded-2xl hover:bg-blue-brand/10 hover:text-blue-brand font-black uppercase tracking-widest text-[9px] px-4">
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="hidden lg:inline">{dbUser?.role === 'creator' ? 'Station' : 'Account'}</span>
                    </Button>
                  </Link>
                </div>
                <div className="h-10 w-px bg-neutral-100 mx-2" />
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-neutral-900 leading-none uppercase tracking-tight">{user.displayName}</span>
                      {dbUser && (
                        <span className={`text-[7px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${dbUser.role === 'creator' ? 'bg-neutral-900 text-white' : 'bg-banana-green text-black border border-black/10'}`}>
                          {dbUser.role}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link to="/profile" className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-blue-brand to-banana-green rounded-2xl blur opacity-0 group-hover:opacity-40 transition-opacity" />
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User" className="relative w-10 h-10 rounded-2xl border-2 border-white shadow-xl object-cover ring-1 ring-neutral-100" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="relative w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center border-2 border-white shadow-lg">
                        <UserIcon className="w-5 h-5 text-neutral-400" />
                      </div>
                    )}
                  </Link>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-colors">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button onClick={handleLogin} className="bg-neutral-900 hover:bg-blue-brand text-white rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] transition-all shadow-2xl shadow-neutral-900/20 active:scale-95">
                  Sign In
                </Button>
                <Button variant="outline" onClick={async () => {
                  try {
                    await signInWithGithub();
                    toast.success('Logged in with Github');
                  } catch (error) {
                    toast.error('Github login failed');
                  }
                }} className="rounded-2xl w-12 h-12 p-0 border-2 border-neutral-100 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all hidden sm:flex items-center justify-center">
                  <Github className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
