import { useState } from 'react';
import React from 'react';
import { User } from 'firebase/auth';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload as UploadIcon, FileText, Image as ImageIcon, Loader2, Video, LogIn, Sparkles } from 'lucide-react';
import EmptyState from '@/components/EmptyState';

interface UploadProps {
  user: User | null;
  dbUser: any;
}

export default function Upload({ user, dbUser }: UploadProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Fashion');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Please sign in to upload');
    if (!image || !productFile) return toast.error('Please select both image and product file');

    setUploading(true);
    try {
      // Upload Image
      const imageRef = ref(storage, `products/${Date.now()}_${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      // Upload Product File
      const fileRef = ref(storage, `files/${Date.now()}_${productFile.name}`);
      await uploadBytes(fileRef, productFile);
      const fileUrl = await getDownloadURL(fileRef);

      // Create Product in DB
      const productData = {
        title,
        description,
        category,
        price: Number(price),
        imageUrl,
        fileUrl,
        creatorEmail: user.email,
      };

      const res = await axios.post('/api/products/create', productData);
      toast.success('Product uploaded successfully!');
      navigate(`/product/${res.data._id}`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload product');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <EmptyState
          icon={LogIn}
          title="Sign in to start selling"
          description="You need to be logged in to upload and manage your products."
        />
      </div>
    );
  }

  if (dbUser?.role !== 'creator') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <EmptyState
          icon={Sparkles}
          title="Creator Access Required"
          description="Only creators can upload products. Please update your profile or contact support."
          actionLabel="Go to Dashboard"
          actionLink="/dashboard"
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-neutral-50 border-b border-neutral-200 p-8">
          <CardTitle className="text-2xl font-bold">Create New Product</CardTitle>
          <CardDescription>Fill in the details below to list your digital product on doorx.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title</Label>
              <Input
                id="title"
                placeholder="e.g. Cinematic Lightroom Presets"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <textarea
                id="description"
                placeholder="Give more details about your product..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[100px] p-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-brand/20 focus:border-blue-brand outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-brand/20 focus:border-blue-brand outline-none transition-all text-sm bg-white"
              >
                {['Fashion', '3D Assets', 'Graphics', 'Presets', 'UI Kits'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (INR)</Label>
              <Input
                id="price"
                type="number"
                placeholder="e.g. 499"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Product Preview Image</Label>
                <div className="relative group">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-200 rounded-xl cursor-pointer hover:border-blue-brand hover:bg-blue-brand/5 transition-all"
                  >
                    {image ? (
                      <div className="flex items-center gap-2 text-blue-brand font-black italic">
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-sm truncate max-w-[150px]">{image.name}</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-neutral-400 mb-2" />
                        <span className="text-xs text-neutral-500 font-bold uppercase">Click to upload image</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Product File (ZIP/PDF/Preset)</Label>
                <div className="relative group">
                  <Input
                    type="file"
                    onChange={(e) => setProductFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-200 rounded-xl cursor-pointer hover:border-blue-brand hover:bg-blue-brand/5 transition-all"
                  >
                    {productFile ? (
                      <div className="flex items-center gap-2 text-blue-brand font-black italic">
                        <FileText className="w-5 h-5" />
                        <span className="text-sm truncate max-w-[150px]">{productFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <FileText className="w-8 h-8 text-neutral-400 mb-2" />
                        <span className="text-xs text-neutral-500 font-bold uppercase">Click to upload file</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-brand hover:bg-neutral-900 text-white h-14 rounded-2xl text-lg font-black gap-2 shadow-xl shadow-blue-brand/20 transition-all active:scale-95"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-banana-green" />
                  Publish Product
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
