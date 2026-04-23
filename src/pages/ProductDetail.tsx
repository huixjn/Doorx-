import { useEffect, useState, useRef } from 'react';
import React from 'react';
import { useParams } from 'react-router-dom';
import { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ShoppingCart, Sparkles, Wand2, Download, Play, Loader2, Image as ImageIcon, CheckCircle2, RefreshCcw, AlertCircle, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { GoogleGenAI } from "@google/genai";
import axios from 'axios';
import { fetchWithRetry, ServerStartingError } from '@/lib/api';
import EmptyState from '@/components/EmptyState';

interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  fileUrl: string;
  videoUrl?: string;
  creatorEmail: string;
  wishlistedBy: string[];
  reviews: {
    user: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
}

interface ProductDetailProps {
  user: User | null;
}

export default function ProductDetail({ user }: ProductDetailProps) {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [tryOnImage, setTryOnImage] = useState<string | null>(null);
  const [processingTryOn, setProcessingTryOn] = useState(false);
  const [adText, setAdText] = useState('');
  const [generatingAd, setGeneratingAd] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchProduct = async () => {
    setLoading(true);
    setIsStarting(false);
    setError(null);
    try {
      const data = await fetchWithRetry<Product>(`/api/products/${id}`);
      setProduct(data);
      if (user?.email && data.wishlistedBy) {
        setWishlisted(data.wishlistedBy.includes(user.email));
      }
      
      // Check if already purchased
      if (user?.email) {
        const ordersData = await fetchWithRetry<any[]>(`/api/orders/user/${user.email}`);
        const hasPurchased = ordersData.some((order: any) => order.productId._id === id);
        setPurchased(hasPurchased);
      }
    } catch (err) {
      if (err instanceof ServerStartingError) {
        setIsStarting(true);
      } else {
        console.error('Failed to fetch product:', err);
        setError('Failed to load product details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id, user]);

  const toggleWishlist = async () => {
    if (!user) return toast.error('Please sign in to wishlist');
    try {
      const res = await axios.post(`/api/products/${id}/wishlist`, { email: user.email });
      setWishlisted(res.data.wishlistedBy.includes(user.email));
      toast.success(res.data.wishlistedBy.includes(user.email) ? 'Added to wishlist' : 'Removed from wishlist');
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Please sign in to review');
    if (reviewRating < 1 || reviewRating > 5) return toast.error('Please provide a rating between 1 and 5');
    setSubmittingReview(true);
    try {
      const res = await axios.post(`/api/products/${id}/reviews`, {
        userEmail: user.email,
        rating: reviewRating,
        comment: reviewComment
      });
      setProduct(res.data);
      setReviewComment('');
      toast.success('Review submitted');
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };
  const handlePayment = async () => {
    if (!user) return toast.error('Please sign in to buy');
    if (!product) return;

    try {
      const res = await axios.post('/api/payment/create', {
        productId: product._id,
        userId: user.email,
        amount: product.price,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key_id', // Use env variable with fallback for demo
        amount: res.data.amount,
        currency: res.data.currency,
        name: "doorx",
        description: `Purchase ${product.title}`,
        order_id: res.data.orderId,
        handler: async (response: any) => {
          try {
            await axios.post('/api/payment/verify', response);
            setPurchased(true);
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 }
            });
            toast.success('Payment successful! Product unlocked.');
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment');
    }
  };

  const handleTryOn = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product) return;

    setProcessingTryOn(true);
    try {
      const userBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });

      const prodRes = await fetch(product.imageUrl);
      const blob = await prodRes.blob();
      const productBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(blob);
      });

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: userBase64,
                mimeType: file.type,
              },
            },
            {
              inlineData: {
                data: productBase64,
                mimeType: blob.type,
              },
            },
            {
              text: `This is a premium AI virtual try-on application for doorx.
              - Image 1 is the user's portrait.
              - Image 2 is a digital asset or clothing item.
              
              ACTION: Modify Image 1 to show the person realistically wearing or being styled with the item from Image 2. 
              The result should be indistinguishable from a real photo. 
              Preserve the person's facial features and the original background as much as possible.
              Output ONLY the resulting image as data in image format.`,
            },
          ],
        },
      });

      const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        setTryOnImage(`data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`);
        toast.success('AI Try-on generated successfully!');
      } else {
        throw new Error('AI failed to generate an image.');
      }
    } catch (error) {
      console.error('Try-on failed:', error);
      toast.error('AI Try-on failed. Please try a different photo.');
    } finally {
      setProcessingTryOn(false);
    }
  };

  const generateAdCopy = async () => {
    if (!product) return;
    setGeneratingAd(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a short, catchy 10-word marketing hook for a digital product titled "${product.title}". Focus on its value for creators.`,
      });
      setAdText(response.text || '');
    } catch (error) {
      console.error('AI error:', error);
      setAdText(`Transform your workflow with ${product.title}. Get it now!`);
    } finally {
      setGeneratingAd(false);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-brand" /></div>;

  if (isStarting) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <EmptyState
          icon={Loader2}
          title="Server is warming up"
          description="We're spinning up the backend services. This usually takes 10-15 seconds."
          actionLabel="Check Again"
          onAction={fetchProduct}
        />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <EmptyState
          icon={AlertCircle}
          title="Oops!"
          description={error || 'Product not found'}
          actionLabel="Retry"
          onAction={fetchProduct}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        {/* Left Column: Visuals */}
        <div className="space-y-12 sticky top-32">
          <div className="relative group rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 shadow-[0_0_80px_rgba(255,255,255,0.03)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={tryOnImage || product.imageUrl}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="aspect-[4/5]"
              >
                <img
                  src={tryOnImage || product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </AnimatePresence>
            
            {tryOnImage && (
              <Button 
                variant="secondary" 
                size="sm" 
                className="absolute top-8 right-8 rounded-xl bg-white text-midnight font-heading text-lg hover:bg-banana-green transition-colors"
                onClick={() => setTryOnImage(null)}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
            
            {processingTryOn && (
              <div className="absolute inset-0 bg-midnight/80 backdrop-blur-xl flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-banana-green animate-spin" />
                <p className="text-banana-green font-mono text-xs uppercase tracking-widest animate-pulse">Processing Protocol...</p>
              </div>
            )}

            <div className="absolute bottom-8 left-8 right-8">
              <div className="bg-midnight/80 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 shadow-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                    <Sparkles className="w-6 h-6 text-banana-green animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Active System</p>
                    <p className="text-sm font-heading tracking-tight text-white uppercase italic">AI High-Fidelity Sync</p>
                  </div>
                </div>
                <Badge className="bg-banana-green text-midnight border-none font-black text-[10px]">V3.2</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <button 
              className="relative group p-8 rounded-[2rem] bg-white/5 border border-white/10 text-left transition-all hover:border-banana-green/50 active:scale-95"
              onClick={generateAdCopy}
            >
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-banana-green/10 flex items-center justify-center group-hover:bg-banana-green transition-colors duration-500">
                  <Play className="w-6 h-6 text-banana-green group-hover:text-midnight transition-colors" />
                </div>
                <div>
                  <p className="text-xl font-heading uppercase text-white">Ad Gen</p>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Execute Marketing</p>
                </div>
              </div>
            </button>

            <button className="relative group p-8 rounded-[2rem] bg-white/5 border border-white/10 text-left transition-all hover:border-blue-brand/50 active:scale-95">
              <label className="cursor-pointer w-full h-full block">
                <input type="file" accept="image/*" className="hidden" onChange={handleTryOn} disabled={processingTryOn} />
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-brand/10 flex items-center justify-center group-hover:bg-blue-brand transition-colors duration-500">
                    <Wand2 className="w-6 h-6 text-blue-brand group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-xl font-heading uppercase text-white">Try-On</p>
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Visual Simulation</p>
                  </div>
                </div>
              </label>
            </button>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-mono font-bold text-banana-green uppercase tracking-widest">
                Class A Asset
              </div>
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest italic">@{product.creatorEmail.split('@')[0]}</span>
            </div>
            <h1 className="font-heading text-7xl sm:text-8xl lg:text-9xl text-white leading-[0.85] tracking-tighter uppercase mb-8">
              {product.title}
            </h1>
            <div className="flex items-end gap-6 pt-4">
              <span className="text-6xl font-heading text-white">₹{product.price}</span>
              <div className="flex flex-col pb-1">
                 <span className="text-lg font-mono text-white/20 line-through leading-none">₹{Math.round(product.price * 1.5)}</span>
                 <span className="text-[10px] font-mono font-black text-banana-green uppercase tracking-widest">33% Yield Loss</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {product.videoUrl && (
              <div className="rounded-[2.5rem] border border-white/10 overflow-hidden bg-midnight aspect-[9/16] max-h-[500px] shadow-2xl relative group">
                <video 
                  src={product.videoUrl} 
                  controls 
                  autoPlay 
                  loop 
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-6 left-6 z-10">
                  <Badge className="bg-banana-green text-midnight border-none gap-2 px-4 py-2 font-mono font-black uppercase text-[10px] rounded-xl">
                    <Video className="w-4 h-4" />
                    Protocol Preview
                  </Badge>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-6">
              <div className="flex gap-6">
                {purchased ? (
                  <div className="space-y-6 flex-1">
                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-banana-green/20 flex items-center justify-center text-banana-green">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-heading uppercase text-white tracking-tight">Identity Verified</h3>
                        <p className="text-xs font-mono text-white/40 uppercase tracking-widest">Asset ownership unlocked for this terminal.</p>
                      </div>
                    </div>
                    <a href={product.fileUrl} download target="_blank" rel="noreferrer" className="block w-full">
                      <Button className="w-full h-20 bg-white hover:bg-banana-green text-midnight rounded-[1.5rem] font-heading text-2xl uppercase tracking-tight transition-all">
                        <Download className="w-7 h-7 mr-3" />
                        Download Data
                      </Button>
                    </a>
                  </div>
                ) : (
                  <Button 
                    onClick={handlePayment} 
                    className="flex-1 h-20 bg-white hover:bg-banana-green text-midnight rounded-[1.5rem] font-heading text-2xl uppercase tracking-tight transition-all shadow-[0_0_60px_rgba(255,255,255,0.05)]"
                  >
                    <ShoppingCart className="w-7 h-7 mr-3" />
                    Acquire Asset
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={toggleWishlist}
                  className={`h-20 w-20 rounded-[1.5rem] border-2 transition-all active:scale-90 ${
                    wishlisted ? 'border-red-500 bg-red-500/10 text-red-500 ring-4 ring-red-500/20' : 'border-white/10 bg-white/5 text-white/20 hover:border-red-500 hover:text-red-500'
                  }`}
                >
                   <AnimatePresence mode="wait">
                    <motion.div
                      key={wishlisted ? 'filled' : 'outline'}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${wishlisted ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </motion.div>
                  </AnimatePresence>
                </Button>
              </div>
              <p className="text-center font-mono text-[9px] text-white/20 uppercase tracking-[0.3em]">Encrypted Handshake Protocol Active • V3.2 Verification Ready</p>
            </div>
          </div>

          <Tabs defaultValue="ai-features" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-neutral-100 p-1.5 h-14">
              <TabsTrigger value="ai-features" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-bold">
                AI Experience
              </TabsTrigger>
              <TabsTrigger value="details" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-bold">
                Product Info
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ai-features" className="mt-8 space-y-10">
              {/* AI Marketing Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <Play className="w-5 h-5 text-blue-brand" />
                    AI Marketing Content
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-brand font-black hover:bg-blue-brand/10"
                    onClick={generateAdCopy}
                    disabled={generatingAd}
                  >
                    {generatingAd ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                    Regenerate
                  </Button>
                </div>
                <Card className="border-neutral-200 rounded-3xl overflow-hidden bg-neutral-900 text-white shadow-2xl transition-all hover:scale-[1.01]">
                  <CardContent className="p-8 aspect-video flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.blue-brand/0.15),transparent)] animate-pulse" />
                    
                    {adText ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 space-y-4"
                      >
                        <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-md">Dynamic AI Script</Badge>
                        <h2 className="text-3xl font-black font-heading italic tracking-tight uppercase leading-none max-w-sm">
                          {adText}
                        </h2>
                        <div className="flex items-center justify-center gap-2 text-neutral-400 text-sm font-medium">
                          <Sparkles className="w-4 h-4 text-banana-green" />
                          <span>Cinematic transitions applied</span>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="relative z-10 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto backdrop-blur-md border border-white/10">
                          <Play className="w-8 h-8 fill-current" />
                        </div>
                        <div className="space-y-2">
                          <p className="font-bold text-lg">Generate AI Content</p>
                          <p className="text-neutral-400 text-sm max-w-[240px]">Create an instant marketing hook for your social media channels.</p>
                        </div>
                        <Button onClick={generateAdCopy} className="bg-blue-brand hover:bg-neutral-800 font-bold rounded-xl px-8 h-12">
                          Create Video Ad
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* AI Try-On Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-blue-brand" />
                    Virtual Try-On
                  </h3>
                  <Badge className="bg-banana-green text-black border-none font-black">PRO AI</Badge>
                </div>
                <Card className="border-neutral-200 rounded-2xl overflow-hidden bg-neutral-50/30">
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="try-on-upload" className="text-sm font-bold text-neutral-700">Upload your portrait</Label>
                      <div className="relative">
                        <input
                          type="file"
                          id="try-on-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleTryOn}
                          disabled={processingTryOn}
                        />
                        <label
                          htmlFor="try-on-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-200 rounded-2xl cursor-pointer hover:border-blue-brand hover:bg-blue-brand/5 transition-all group"
                        >
                          {processingTryOn ? (
                            <Loader2 className="w-8 h-8 text-blue-brand animate-spin" />
                          ) : (
                            <>
                              <ImageIcon className="w-8 h-8 text-neutral-300 mb-2 group-hover:text-banana-green transition-colors" />
                              <span className="text-sm text-neutral-500 font-medium text-center px-4">Click or drag to see the magic</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    {tryOnImage && (
                      <div className="flex gap-4">
                        <Button 
                          variant="outline" 
                          className="flex-1 rounded-xl border-neutral-200 hover:bg-neutral-50 font-bold"
                          onClick={() => setTryOnImage(null)}
                        >
                          <RefreshCcw className="w-4 h-4 mr-2" />
                          Clear AI Preview
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

            </TabsContent>

            <TabsContent value="details" className="mt-8 space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-neutral-900">Product Description</h3>
                <p className="text-neutral-600 leading-relaxed bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                  {product.description || "No description provided."}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-neutral-900">Customer Reviews</h3>
                  <div className="flex items-center gap-1 font-black text-banana-green bg-neutral-900 px-3 py-1 rounded-lg">
                    <Sparkles className="w-4 h-4" />
                    {product.reviews?.length > 0 
                      ? (product.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / product.reviews.length).toFixed(1)
                      : "0.0"
                    }
                  </div>
                </div>

                {/* Review Form */}
                <Card className="border-neutral-200 rounded-2xl shadow-sm">
                  <CardContent className="p-6">
                    <form onSubmit={submitReview} className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Label>Rating</Label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setReviewRating(num)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                reviewRating >= num ? 'bg-banana-green text-black scale-110 shadow-lg shadow-banana-green/20' : 'bg-neutral-100 text-neutral-400'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        placeholder="Write your review here..."
                        className="w-full p-4 rounded-xl border border-neutral-200 min-h-[100px] text-sm focus:ring-2 focus:ring-blue-brand/10 outline-none"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        required
                      />
                      <Button type="submit" disabled={submittingReview} className="w-full bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold">
                        {submittingReview ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Submit Review
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Reviews List */}
                <div className="space-y-4">
                  {product.reviews?.length > 0 ? (
                    product.reviews.map((review, i) => (
                      <div key={i} className="p-6 bg-white border border-neutral-200 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-neutral-900">{review.user.split('@')[0]}</span>
                          <Badge className="bg-banana-green/10 text-banana-green border-banana-green/20">{review.rating} / 5</Badge>
                        </div>
                        <p className="text-neutral-600 text-sm">{review.comment}</p>
                        <span className="text-[10px] text-neutral-400 block">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                      <p className="text-sm text-neutral-400 italic">No reviews yet. Be the first to share your experience!</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
