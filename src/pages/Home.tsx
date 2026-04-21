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
      <section className="relative overflow-hidden pt-24 pb-20 sm:pt-40 sm:pb-32">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -z-10 w-1/3 h-1/3 bg-blue-brand/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 -z-10 w-1/4 h-1/4 bg-banana-green/5 blur-[100px] rounded-full animate-bounce" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-neutral-900 text-white mb-10 transform -rotate-1 shadow-2xl">
              <Sparkles className="w-4 h-4 text-banana-green fill-banana-green animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">The Next Gen Creator Economy</span>
            </div>

            <h1 className="font-heading text-7xl sm:text-9xl font-black tracking-tight text-neutral-900 leading-[0.85] mb-10">
              CREATE<br />
              <span className="text-blue-brand relative">
                CONNECT
                <div className="absolute -bottom-2 left-0 w-full h-4 bg-banana-green/30 -z-10 skew-x-[-12deg]" />
              </span><br />
              CONQUER
            </h1>

            <p className="text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed font-medium mb-16">
              Empowering creators with AI-driven marketing, virtual try-ons, and instant global marketplace reach.
            </p>
            
            <div className="max-w-2xl mx-auto relative group mb-12">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-brand via-banana-green to-blue-brand rounded-[2.5rem] blur-xl opacity-20 group-focus-within:opacity-40 transition-all duration-500 animate-gradient-x" />
              <div className="relative flex items-center bg-white rounded-3xl border-2 border-neutral-100 shadow-2xl overflow-hidden p-2">
                <div className="pl-6">
                  <PackageSearch className="w-6 h-6 text-neutral-400" />
                </div>
                <input
                  type="text"
                  placeholder="What are you creating today?"
                  className="w-full px-6 py-4 text-neutral-900 bg-transparent focus:outline-none font-bold text-lg placeholder:text-neutral-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button className="bg-blue-brand hover:bg-neutral-900 text-white rounded-2xl px-12 h-14 font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-blue-brand/40">
                  Search
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedCategory === cat
                      ? 'bg-neutral-900 text-white shadow-2xl scale-110 -rotate-2 ring-4 ring-banana-green/20'
                      : 'bg-white border-2 border-neutral-100 text-neutral-400 hover:border-blue-brand hover:text-blue-brand hover:scale-105'
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-banana-green" />
            {selectedCategory === 'All' ? 'Featured Products' : `${selectedCategory} Collection`}
          </h2>
          <div className="h-px flex-1 bg-neutral-200 mx-6 hidden sm:block" />
          <span className="text-sm font-bold text-neutral-400">{filteredProducts.length} items found</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : isStarting ? (
          <EmptyState
            icon={Loader2}
            title="Server is warming up"
            description="We're spinning up the backend services. This usually takes 10-15 seconds."
            actionLabel="Check Again"
            onAction={fetchProducts}
          />
        ) : error ? (
          <EmptyState
            icon={RefreshCcw}
            title="Oops!"
            description={error}
            actionLabel="Retry"
            onAction={fetchProducts}
          />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No products found"
            description={searchQuery ? "Try searching for something else or browse categories." : "Be the first to upload a digital product and start selling today!"}
            actionLabel={searchQuery ? "Clear Search" : "Upload Product"}
            onAction={searchQuery ? () => setSearchQuery('') : undefined}
            actionLink={searchQuery ? undefined : "/upload"}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group overflow-hidden border-neutral-100 hover:border-blue-brand/20 transition-all duration-500 hover:shadow-[0_32px_64px_-12px_rgba(0,102,255,0.12)] rounded-[2.5rem] bg-white relative">
                  <div className="aspect-[4/5] overflow-hidden relative m-2 rounded-[2rem]">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <Link to={`/product/${product._id}`}>
                        <Button className="w-full gap-2 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-white text-neutral-900 hover:bg-banana-green hover:text-black border-none shadow-2xl py-6">
                          <Eye className="w-4 h-4" />
                          View Masterpiece
                        </Button>
                      </Link>
                    </div>
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <div className="bg-neutral-900/60 backdrop-blur-xl text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-white/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-banana-green animate-pulse" />
                        Asset
                      </div>
                      {product.category && (
                        <div className="bg-blue-brand/90 backdrop-blur-xl text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">
                          {product.category}
                        </div>
                      )}
                    </div>
                  </div>
                  <CardHeader className="px-6 py-4 pb-0">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="text-xl font-black line-clamp-1 group-hover:text-blue-brand transition-colors tracking-tighter uppercase">{product.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200">
                          <span className="text-[10px] font-black">{product.creatorEmail[0].toUpperCase()}</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">@{product.creatorEmail.split('@')[0]}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="px-6 py-6 pt-4">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Price</span>
                        <span className="text-2xl font-black text-neutral-900 tabular-nums">₹{product.price}</span>
                      </div>
                      <Link to={`/product/${product._id}`}>
                        <div className="w-14 h-14 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-blue-brand group-hover:text-white group-hover:rotate-12 transition-all duration-500 cursor-pointer shadow-inner border border-neutral-100">
                          <ShoppingCart className="w-6 h-6" />
                        </div>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
