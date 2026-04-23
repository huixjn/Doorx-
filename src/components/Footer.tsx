import { ShoppingBag, Github, Twitter, Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-midnight text-white mt-32 border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-6 space-y-12">
            <Link to="/" className="flex items-center gap-6 group w-fit">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:-rotate-6 duration-700 shadow-2xl">
                <ShoppingBag className="w-10 h-10 text-midnight" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-5xl tracking-tighter uppercase italic leading-none">door<span className="text-banana-green">x</span></span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.6em] text-white/20 ml-1">Terminal Active</span>
              </div>
            </Link>
            <p className="text-white/40 max-w-lg text-2xl font-light leading-relaxed tracking-tight">
              The high-fidelity protocol for <span className="text-white">creative sovereignty</span>. 
              Engineering the next generation of digital distribution and <span className="text-banana-green">AI-driven provenance</span>.
            </p>
            <div className="flex gap-6">
              {[Twitter, Instagram, Github, Mail].map((Icon, i) => (
                <a key={i} href="#" className="group relative w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-midnight transition-all overflow-hidden active:scale-90">
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Icon className="w-7 h-7 relative z-10 transition-transform group-hover:rotate-12" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-10">
            <h4 className="text-white/20 text-[10px] font-mono font-black uppercase tracking-[0.4em]">Protocol Node</h4>
            <ul className="space-y-6 font-heading text-xl uppercase tracking-tight">
              <li><Link to="/" className="hover:text-banana-green transition-colors block">Inventory</Link></li>
              <li><Link to="/" className="hover:text-banana-green transition-colors block">Laboratories</Link></li>
              <li><Link to="/" className="hover:text-banana-green transition-colors block">Manifestos</Link></li>
              <li><Link to="/" className="hover:text-banana-green transition-colors block">Handshakes</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-10">
            <h4 className="text-white/20 text-[10px] font-mono font-black uppercase tracking-[0.4em]">Registry</h4>
            <ul className="space-y-6 font-heading text-xl uppercase tracking-tight">
              <li><Link to="/" className="hover:text-blue-brand transition-colors block">Archives</Link></li>
              <li><Link to="/" className="hover:text-blue-brand transition-colors block">Command</Link></li>
              <li><Link to="/" className="hover:text-blue-brand transition-colors block">Encryption</Link></li>
              <li><Link to="/" className="hover:text-blue-brand transition-colors block">Legal</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-32 pt-16 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col gap-3">
            <p className="text-white/10 font-mono text-[9px] uppercase tracking-[0.5em] leading-none">
              © {currentYear} protocol_doorx. all systems operational.
            </p>
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-banana-green animate-ping" />
               <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest italic">Encrypted Connection Established</span>
            </div>
          </div>
          
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-4 h-1 bg-white/20 group-hover:bg-banana-green transition-colors" />
                ))}
              </div>
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-white/60">Edge Node: 12.0.4</span>
            </div>
            <div className="font-mono text-[10px] text-white/20 uppercase tracking-widest border border-white/5 px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-md">
              Secure-Layer: ACTIVE
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
