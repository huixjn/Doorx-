import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Users, 
  ShoppingBag, 
  Trash2, 
  ShieldCheck, 
  Search, 
  Loader2, 
  AlertCircle,
  Package,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import EmptyState from '@/components/EmptyState';

interface AdminProps {
  user: User | null;
  dbUser: any;
}

export default function Admin({ user, dbUser }: AdminProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');

  const adminConfig = {
    headers: { 'x-admin-email': user?.email }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        axios.get('/api/admin/users', adminConfig),
        axios.get('/api/products'),
        axios.get('/api/admin/orders', adminConfig)
      ]);
      setUsers(usersRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Admin fetch error:', error);
      toast.error('Access Denied', {
        description: 'You must be an admin to view this page.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dbUser?.role === 'admin') {
      fetchData();
    }
  }, [dbUser]);

  const deleteUser = async (id: string, email: string) => {
    if (email === 'suvhobouri@gmail.com') return toast.error('Cannot delete root admin');
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await axios.delete(`/api/admin/users/${id}`, adminConfig);
      toast.success('User deleted');
      setUsers(users.filter(u => u._id !== id));
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`/api/admin/products/${id}`, adminConfig);
      toast.success('Product deleted');
      setProducts(products.filter(p => p._id !== id));
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  if (dbUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <EmptyState
          icon={ShieldCheck}
          title="Admin Access Only"
          description="This section is reserved for platform administrators only."
          actionLabel="Return Home"
          actionLink="/"
        />
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.creatorEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-banana-green" />
            </div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Protocol<span className="text-blue-brand">X</span> Admin</h1>
          </div>
          <p className="text-neutral-500 font-medium tracking-tight">Main control interface for doorx creative commerce.</p>
        </div>

        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-neutral-400 group-focus-within:text-blue-brand transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Global Search..."
            className="w-full pl-12 pr-4 py-3 border-2 border-neutral-100 rounded-2xl bg-white focus:outline-none focus:border-blue-brand/50 focus:ring-4 focus:ring-blue-brand/5 font-bold transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-brand', bg: 'bg-blue-brand/5' },
          { label: 'Live Products', value: products.length, icon: Package, color: 'text-banana-green', bg: 'bg-banana-green/5' },
          { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-500/5' }
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
            <CardContent className="p-8 flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 leading-none mb-1">{stat.label}</span>
                <span className="text-3xl font-black text-neutral-900 tabular-nums">{stat.value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-white border-2 border-neutral-100 p-1.5 rounded-3xl w-fit">
          <TabsTrigger value="users" className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all">Users</TabsTrigger>
          <TabsTrigger value="products" className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all">Products</TabsTrigger>
          <TabsTrigger value="orders" className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all">Orders</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-brand" />
          </div>
        ) : (
          <>
            <TabsContent value="users">
              <div className="bg-white border-2 border-neutral-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-neutral-50/50 border-b-2 border-neutral-100">
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">User</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Role</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Joined</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-neutral-100">
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="group hover:bg-neutral-50/30 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                                {u.displayName?.[0]?.toUpperCase() || <Users className="w-5 h-5 text-neutral-400" />}
                              </div>
                              <div className="flex flex-col leading-none">
                                <span className="font-black text-neutral-900 uppercase tracking-tighter text-sm mb-1">{u.displayName || 'No Name'}</span>
                                <span className="text-[10px] text-neutral-400 font-bold uppercase">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className={`inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              u.role === 'admin' ? 'bg-red-100 text-red-600' :
                              u.role === 'creator' ? 'bg-blue-brand/10 text-blue-brand' :
                              'bg-banana-green/10 text-black'
                            }`}>
                              {u.role}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-[10px] font-black text-neutral-400 uppercase tabular-nums">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteUser(u._id, u.email)}
                              className="text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              disabled={u.email === 'suvhobouri@gmail.com'}
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="products">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((p) => (
                  <Card key={p._id} className="group overflow-hidden border-2 border-neutral-100 hover:border-blue-brand/20 transition-all duration-500 rounded-[2rem] bg-white">
                    <div className="aspect-video relative overflow-hidden m-2 rounded-[1.5rem]">
                      <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                      <div className="absolute top-4 right-4">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteProduct(p._id)}
                          className="w-10 h-10 rounded-xl shadow-xl shadow-red-500/20 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                        >
                          <Trash2 className="w-5 h-5 text-white" />
                        </Button>
                      </div>
                    </div>
                    <CardHeader className="p-6">
                      <div className="flex flex-col gap-1">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter truncate">{p.title}</CardTitle>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Creator: {p.creatorEmail}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 flex justify-between items-center">
                      <span className="text-2xl font-black text-neutral-900">₹{p.price}</span>
                      <Badge variant="outline" className="rounded-full font-black uppercase text-[8px] border-neutral-200">{p.category}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="orders">
              <div className="bg-white border-2 border-neutral-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-neutral-50/50 border-b-2 border-neutral-100">
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Order ID</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Buyer</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Product</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-neutral-100">
                      {orders.map((o) => (
                        <tr key={o._id} className="group hover:bg-neutral-50/30 transition-colors">
                          <td className="px-8 py-6 font-mono text-[10px] font-black text-blue-brand">{o.razorpayOrderId}</td>
                          <td className="px-8 py-6 text-[10px] font-bold uppercase text-neutral-500">{o.userId}</td>
                          <td className="px-8 py-6">
                            <span className="text-sm font-black text-neutral-900 uppercase tracking-tighter truncate max-w-[200px] block">
                              {o.productId?.title || 'Unknown Product'}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                             <div className={`inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              o.status === 'completed' ? 'bg-banana-green/10 text-black' : 'bg-neutral-100 text-neutral-400'
                            }`}>
                              {o.status}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
