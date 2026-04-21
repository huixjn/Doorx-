import { ShoppingBag, Github, Twitter, Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 text-white mt-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-16">
          <div className="col-span-1 md:col-span-3 space-y-10">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="w-14 h-14 bg-neutral-900 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 duration-500 shadow-2xl border border-white/5">
                <ShoppingBag className="w-7 h-7 text-banana-green" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-4xl tracking-tighter uppercase italic">door<span className="text-blue-brand">x</span></span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600 ml-0.5">Global Creative Protocol</span>
              </div>
            </Link>
            <p className="text-neutral-500 max-w-md text-xl font-medium leading-relaxed">
              We're building the infrastructure for the next generation of creative entrepreneurs. 
              Sell digital assets, leverage generative AI, and scale your brand globally.
            </p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Github, Mail].map((Icon, i) => (
                <a key={i} href="#" className="group relative w-14 h-14 rounded-2xl bg-neutral-900 border border-white/5 flex items-center justify-center text-neutral-500 hover:text-white transition-all overflow-hidden">
                  <div className="absolute inset-0 bg-blue-brand opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Icon className="w-6 h-6 relative z-10 transition-transform group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          <div className="col-span-1 md:col-span-1 border-l border-white/5 pl-8 hidden md:block">
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-blue-brand">Ecosystem</h4>
            <ul className="space-y-6 text-neutral-500 font-bold text-sm">
              <li><Link to="/" className="hover:text-blue-brand transition-colors flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-blue-brand transition-colors" />
                Digital Assets
              </Link></li>
              <li><Link to="/" className="hover:text-blue-brand transition-colors flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-blue-brand transition-colors" />
                AI Models
              </Link></li>
              <li><Link to="/" className="hover:text-blue-brand transition-colors flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-blue-brand transition-colors" />
                Creator Tools
              </Link></li>
              <li><Link to="/" className="hover:text-blue-brand transition-colors flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-blue-brand transition-colors" />
                Virtual Labs
              </Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-1 border-l border-white/5 pl-8 hidden md:block">
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-banana-green">Resources</h4>
            <ul className="space-y-6 text-neutral-500 font-bold text-sm">
              <li><Link to="/" className="hover:text-banana-green transition-colors flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-banana-green transition-colors" />
                Academy
              </Link></li>
              <li><Link to="/" className="hover:text-banana-green transition-colors flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-banana-green transition-colors" />
                Network
              </Link></li>
              <li><Link to="/" className="hover:text-banana-green transition-colors flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-banana-green transition-colors" />
                Protocol
              </Link></li>
              <li><Link to="/" className="hover:text-banana-green transition-colors flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-banana-green transition-colors" />
                Legal
              </Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-24 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-neutral-600 font-black text-[10px] uppercase tracking-widest leading-none">
              © {currentYear} protocol_doorx. All units operational.
            </p>
            <p className="text-[10px] text-neutral-800 font-bold uppercase tracking-tighter">Secure Decentralized Creative Network_</p>
          </div>
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-3 h-1 bg-banana-green animate-pulse" />
                ))}
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 italic">Core Systems Stable</span>
            </div>
            <div className="text-[9px] font-black text-neutral-600 uppercase tracking-widest border border-white/5 px-4 py-2 rounded-full">
              Region: Global_Edge
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
