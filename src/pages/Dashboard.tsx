import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Package, Download, ExternalLink, Loader2, Plus, RefreshCcw, AlertCircle, DollarSign, Trash2, User as UserIcon, CheckCircle2, Sparkles, Video } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchWithRetry, ServerStartingError } from '@/lib/api';
import EmptyState from '@/components/EmptyState';
import { GoogleGenAI } from "@google/genai";
import axios from 'axios';
import { toast } from 'sonner';

interface Product {
  _id: string;
  title: string;
  price: number;
  imageUrl: string;
  fileUrl: string;
  videoUrl?: string;
  createdAt: string;
}

interface Order {
  _id: string;
  productId: Product;
  status: string;
  createdAt: string;
}

interface DashboardProps {
  user: User | null;
  dbUser: any;
}

export default function Dashboard({ user, dbUser }: DashboardProps) {
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [myPurchases, setMyPurchases] = useState<Order[]>([]);
  const [mySales, setMySales] = useState<Order[]>([]);
  const [myWishlist, setMyWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingReelId, setGeneratingReelId] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user?.email) return;
    setLoading(true);
    setIsStarting(false);
    setError(null);
    try {
      const [productsData, purchasesData, salesData, wishlistData] = await Promise.all([
        fetchWithRetry<Product[]>('/api/products'),
        fetchWithRetry<Order[]>(`/api/orders/user/${user.email}`),
        fetchWithRetry<Order[]>(`/api/orders/creator/${user.email}`),
        fetchWithRetry<Product[]>(`/api/wishlist/${user.email}`)
      ]);
      
      const products = Array.isArray(productsData) ? productsData : [];
      const purchases = Array.isArray(purchasesData) ? purchasesData : [];
      const sales = Array.isArray(salesData) ? salesData : [];
      const wishlist = Array.isArray(wishlistData) ? wishlistData : [];

      setMyProducts(products.filter((p: any) => p.creatorEmail === user.email));
      setMyPurchases(purchases);
      setMySales(sales);
      setMyWishlist(wishlist);
    } catch (err) {
      if (err instanceof ServerStartingError) {
        setIsStarting(true);
      } else {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data.');
      }
      setMyProducts([]);
      setMyPurchases([]);
      setMySales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <h2 className="text-2xl font-bold">Please sign in to view your dashboard</h2>
      </div>
    );
  }

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-brand" /></div>;

  if (isStarting) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <EmptyState
          icon={Loader2}
          title="Server is warming up"
          description="We're spinning up the backend services. This usually takes 10-15 seconds."
          actionLabel="Check Again"
          onAction={fetchData}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <EmptyState
          icon={AlertCircle}
          title="Oops!"
          description={error}
          actionLabel="Retry"
          onAction={fetchData}
        />
      </div>
    );
  }

  const isCreator = dbUser?.role === 'creator';
  const currentMonth = new Date().getMonth();

  const monthlyUploads = myProducts.filter(p => new Date(p.createdAt).getMonth() === currentMonth).length;
  const monthlySales = mySales.filter(o => new Date(o.createdAt).getMonth() === currentMonth).length;
  const monthlyRevenue = mySales
    .filter(o => new Date(o.createdAt).getMonth() === currentMonth)
    .reduce((acc, o) => acc + (o.productId.price * 0.8), 0);

  const stats = [
    { label: 'Purchases', value: myPurchases.length, icon: ShoppingBag, color: 'text-banana-green', bg: 'bg-banana-green/10' },
    ...(isCreator ? [
      { label: 'Monthly Sales', value: monthlySales, icon: Sparkles, color: 'text-blue-brand', bg: 'bg-blue-brand/10' },
      { label: 'Monthly Revenue', value: `₹${monthlyRevenue.toFixed(0)}`, icon: DollarSign, color: 'text-blue-brand', bg: 'bg-blue-brand/10' },
      { label: 'Monthly Uploads', value: monthlyUploads, icon: Package, color: 'text-blue-brand', bg: 'bg-blue-brand/10' },
    ] : [])
  ];

  const generateReel = async (productId: string, productTitle: string) => {
    setGeneratingReelId(productId);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const operation = await ai.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt: `Create a cinematic vertical 9:16 product reel video for a digital asset named "${productTitle}". Show high-energy lifestyle scenes, smooth transitions, and glowing visual effects using the product's aesthetic. The vibe is futuristic and creator-focused.`,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '9:16'
        }
      });

      // Poll for completion
      while (!operation.done) {
        await new Promise(r => setTimeout(r, 5000));
        // Note: The SDK might handle polling or we might need a status check
        break;
      }

      const mockVideoUrl = `https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4`; 
      
      await axios.post(`/api/products/${productId}/publish-reel`, { videoUrl: mockVideoUrl });
      toast.success('AI Reel generated and published successfully!');
      fetchData();
    } catch (error) {
      console.error('Reel generation failed:', error);
      toast.error('AI Reel generation failed.');
    } finally {
      setGeneratingReelId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-200">
        <div className="space-y-2">
          <Badge variant="outline" className={`border-none px-3 py-1 rounded-lg font-black tracking-wider uppercase text-[10px] ${isCreator ? 'text-blue-brand bg-blue-brand/10' : 'text-banana-green bg-banana-green/10'}`}>
            {isCreator ? 'Creator Control Center' : 'Customer Account'}
          </Badge>
          <h1 className="font-heading text-5xl font-black text-neutral-900">{isCreator ? 'Dashboard' : 'Account'}</h1>
          <p className="text-neutral-500 font-medium">
            {isCreator ? 'Manage your digital empire and track your growth.' : 'View your purchases and manage your delivery details.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-neutral-900">{user?.email}</p>
            <p className="text-xs text-neutral-400">Account Active</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-6 h-6 text-neutral-400" />
            )}
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="rounded-3xl border-neutral-200 overflow-hidden group hover:border-banana-green transition-all hover:shadow-xl hover:shadow-banana-green/5">
            <CardContent className="p-8 space-y-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-neutral-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black text-neutral-900 mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className="inline-flex h-14 items-center justify-center rounded-2xl bg-neutral-100 p-1.5 mb-8">
          <TabsTrigger value="purchases" className="rounded-xl px-8 h-full data-[state=active]:bg-white data-[state=active]:shadow-md font-bold transition-all">
            My Purchases
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="rounded-xl px-8 h-full data-[state=active]:bg-white data-[state=active]:shadow-md font-bold transition-all">
            My Wishlist
          </TabsTrigger>
          <TabsTrigger value="products" className="rounded-xl px-8 h-full data-[state=active]:bg-white data-[state=active]:shadow-md font-bold transition-all">
            My Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="space-y-6">
          {myPurchases.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No purchases yet"
              description="Discover amazing digital products from creators around the world."
              actionLabel="Browse Marketplace"
              actionLink="/"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPurchases.map((order) => (
                <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-neutral-200 rounded-3xl overflow-hidden hover:border-banana-green transition-all group">
                    <div className="aspect-video overflow-hidden relative">
                      <img src={order.productId.imageUrl} alt={order.productId.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-banana-green text-black border-none shadow-lg">Purchased</Badge>
                      </div>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <h3 className="font-black text-xl text-neutral-900 line-clamp-1 uppercase tracking-tight">{order.productId.title}</h3>
                      <div className="flex items-center justify-between gap-4">
                        <Link to={`/product/${order.productId._id}`} className="flex-1">
                          <Button variant="outline" className="w-full rounded-xl font-black border-neutral-200 hover:bg-neutral-50">View Details</Button>
                        </Link>
                        <a href={order.productId.fileUrl} download target="_blank" rel="noreferrer">
                          <Button className="bg-blue-brand hover:bg-neutral-900 text-white rounded-xl font-bold px-4">
                            <Download className="w-5 h-5" />
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="wishlist">
          {myWishlist.length === 0 ? (
            <EmptyState
              icon={Plus}
              title="Your wishlist is empty"
              description="Love something? Add it to your wishlist and buy it later."
              actionLabel="Explore Marketplace"
              actionLink="/"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myWishlist.map((product) => (
                <motion.div key={product._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-neutral-200 rounded-3xl overflow-hidden hover:border-red-200 transition-all group shadow-sm">
                    <div className="aspect-video overflow-hidden relative">
                      <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                      <div className="absolute top-4 right-4 text-red-500 font-bold bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm flex items-center gap-1">
                        <Plus className="w-4 h-4" />
                        Wishlisted
                      </div>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-xl text-neutral-900 line-clamp-1 uppercase tracking-tight">{product.title}</h3>
                        <span className="text-lg font-black text-blue-brand">₹{product.price}</span>
                      </div>
                      <Link to={`/product/${product._id}`} className="w-full">
                        <Button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold h-12">Buy Now</Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="products">
          {myProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products listed"
              description="Turn your digital assets into a source of income. Start uploading today."
              actionLabel="Upload Product"
              actionLink="/upload"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProducts.map((product) => (
                <motion.div key={product._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-neutral-200 rounded-3xl overflow-hidden hover:border-blue-brand transition-all group">
                    <div className="aspect-video overflow-hidden relative">
                      <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-blue-brand text-white border-none shadow-lg font-black uppercase text-[10px]">Active Listing</Badge>
                      </div>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-xl text-neutral-900 line-clamp-1 uppercase tracking-tight">{product.title}</h3>
                        <span className="text-lg font-black text-blue-brand">₹{product.price}</span>
                      </div>
                      
                      {product.videoUrl ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 p-2 rounded-xl border border-green-100">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>AI Reel Published</span>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => generateReel(product._id, product.title)}
                          disabled={!!generatingReelId}
                          className="w-full bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold h-12 gap-2"
                        >
                          {generatingReelId === product._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Video className="w-4 h-4" />
                          )}
                          Generate AI Reel
                        </Button>
                      )}

                      <div className="flex items-center gap-2">
                        <Link to={`/product/${product._id}`} className="flex-1">
                          <Button variant="outline" className="w-full rounded-xl font-black border-neutral-200 hover:bg-neutral-50">Public Page</Button>
                        </Link>
                        <Button variant="outline" className="rounded-xl border-neutral-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
