import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Sparkles, ShoppingCart, Eye, Loader2, RefreshCcw, PackageSearch } from 'lucide-react';
import { fetchWithRetry, ServerStartingError } from '@/lib/api';
import EmptyState from '@/components/EmptyState';
import ProductSkeleton from '@/components/ProductSkeleton';

interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  creatorEmail: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Fashion', '3D Assets', 'Graphics', 'Presets', 'UI Kits'];

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    setIsStarting(false);
    try {
      const data = await fetchWithRetry<Product[]>('/api/products');
      if (Array.isArray(data)) {
        setProducts(data);
        setFilteredProducts(data);
      } else {
        console.error('Unexpected API response format:', data);
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (err) {
      if (err instanceof ServerStartingError) {
        setIsStarting(true);
      } else {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again later.');
      }
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;
    if (selectedCategory !== 'All') {
      result = products.filter(p => p.category === selectedCategory);
    }
    if (searchQuery) {
      result = result.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.creatorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, products]);

  return (
    <div className="space-y-12 pb-20 bg-neutral-50/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 sm:pt-48 sm:pb-40">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-blue-brand/20 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-10 left-0 -z-10 w-[400px] h-[400px] bg-banana-green/10 blur-[140px] rounded-full animate-bounce duration-[10s]" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 mb-12 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blue-brand animate-ping" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] italic">Network V3.2 Protocol Active</span>
            </div>

            <h1 className="font-heading text-8xl sm:text-[12rem] lg:text-[16rem] font-black tracking-tighter text-white leading-[0.75] mb-12 perspective-1000">
              CRAFT<br />
              <span className="text-banana-green italic -skew-x-12 inline-block">CODE</span><br />
              CONQUER
            </h1>

            <p className="text-xl sm:text-2xl text-white/50 max-w-3xl mx-auto leading-relaxed font-light mb-20 tracking-tight">
              The high-fidelity marketplace for elite digital assets. 
              <span className="text-white"> AI-driven provenance.</span> 
              <span className="text-blue-brand underline underline-offset-8 decoration-2"> Instant deployment.</span>
            </p>
            
            <div className="max-w-3xl mx-auto relative group mb-16">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-brand via-banana-green to-blue-brand rounded-[2rem] blur-xl opacity-20 group-focus-within:opacity-50 transition-all duration-700 animate-gradient-x" />
              <div className="relative flex items-center bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-2 overflow-hidden">
                <div className="pl-6">
                  <PackageSearch className="w-6 h-6 text-white/20" />
                </div>
                <input
                  type="text"
                  placeholder="Intercept data fragments..."
                  className="w-full px-6 py-4 text-white bg-transparent focus:outline-none font-heading text-2xl placeholder:text-white/10 uppercase tracking-tight"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button className="bg-white text-midnight hover:bg-banana-green transition-colors rounded-2xl px-10 h-16 font-heading text-xl uppercase tracking-tighter">
                  S-Execute
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${
                    selectedCategory === cat
                      ? 'bg-banana-green text-midnight shadow-[0_0_40px_rgba(204,255,0,0.3)] scale-110 -rotate-2'
                      : 'bg-white/5 border border-white/10 text-white/40 hover:border-banana-green hover:text-white hover:scale-105'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-banana-green animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-banana-green">Current Inventory</span>
            </div>
            <h2 className="text-5xl font-heading tracking-tighter uppercase leading-none">
              {selectedCategory === 'All' ? 'The Collection' : `${selectedCategory}`}
            </h2>
          </div>
          <div className="flex items-center gap-4 text-white/40 font-mono text-[10px] uppercase tracking-widest">
            <span>Scan Complete:</span>
            <span className="text-white">{filteredProducts.length} Items Indexed</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="Registry Empty"
            description={searchQuery ? "No assets match your search parameters." : "The marketplace is awaiting new terminal uploads."}
            actionLabel={searchQuery ? "Clear Search" : "Upload Asset"}
            onAction={searchQuery ? () => setSearchQuery('') : undefined}
            actionLink={searchQuery ? undefined : "/upload"}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className="group bg-transparent border-none shadow-none text-white p-0 relative">
                  <div className="aspect-[3/4] overflow-hidden relative rounded-[2rem] border border-white/10 group-hover:border-banana-green/50 transition-colors duration-500">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-midnight/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px] flex items-center justify-center p-8">
                      <Link to={`/product/${product._id}`} className="w-full">
                        <Button className="w-full h-16 rounded-2xl font-heading text-xl uppercase bg-white text-midnight hover:bg-banana-green hover:text-midnight transition-all translate-y-4 group-hover:translate-y-0 duration-500">
                          Inspect
                        </Button>
                      </Link>
                    </div>
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                       <Badge className="bg-midnight/80 backdrop-blur-md text-white border-white/10 rounded-lg font-mono text-[8px] uppercase px-3 py-1 tracking-widest">
                        {product.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] leading-none">Platform Asset</span>
                        <CardTitle className="text-2xl font-heading uppercase tracking-tight leading-none group-hover:text-banana-green transition-colors">{product.title}</CardTitle>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono font-bold text-banana-green">₹{product.price}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
                          <span className="text-[8px] font-bold uppercase">{product.creatorEmail[0]}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest italic truncate max-w-[120px]">
                          @{product.creatorEmail.split('@')[0]}
                        </span>
                      </div>
                      <Link to={`/product/${product._id}`}>
                        <div className="flex items-center gap-1.5 group/link">
                          <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-white/40 group-hover/link:text-white transition-colors">Details</span>
                          <Eye className="w-3 h-3 text-white/20 group-hover/link:text-banana-green transition-colors" />
                        </div>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
