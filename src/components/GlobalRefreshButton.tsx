import { RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function GlobalRefreshButton() {
  const handleRefresh = () => {
    toast.info('Refreshing your experience...', {
      duration: 1000
    });
    // Use a small delay for the toast to be seen
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-8 left-8 z-[100]"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <div className="relative group">
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-brand to-banana-green rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-500 animate-pulse" />
        <Button
          onClick={handleRefresh}
          className="relative w-14 h-14 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl flex items-center justify-center shadow-2xl border border-white/5 transition-all group-hover:rotate-180 duration-700"
          title="Refresh Page"
        >
          <RefreshCw className="w-6 h-6 text-banana-green" />
        </Button>
      </div>
    </motion.div>
  );
}
