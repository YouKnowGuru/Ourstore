'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, Loader2, Image as ImageIcon, MonitorIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const AdminBanners = () => {
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingBanner, setEditingBanner] = useState<any>(null);
    const [formData, setFormData] = useState({ 
        title: '', 
        subtitle: '', 
        buttonText: 'Shop Now', 
        image: '', 
        linkUrl: '', 
        position: 'home-main',
        order: 0
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const adminToken = localStorage.getItem('token');
            const response = await fetch('/api/admin/banners', {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const data = await response.json();
            if (response.ok && Array.isArray(data)) {
                setBanners(data);
            } else {
                setBanners([]);
                toast.error(data.message || 'Failed to load banners');
            }
        } catch (error) {
            toast.error('Failed to load banners');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const adminToken = localStorage.getItem('token');
            const method = editingBanner ? 'PATCH' : 'POST';
            const url = editingBanner 
                ? `/api/admin/banners/${editingBanner._id}` 
                : '/api/admin/banners';

            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('subtitle', formData.subtitle);
            submitData.append('buttonText', formData.buttonText);
            submitData.append('image', formData.image);
            submitData.append('linkUrl', formData.linkUrl);
            submitData.append('position', formData.position);
            submitData.append('order', formData.order.toString());
            
            if (imageFile) {
                submitData.append('imageFile', imageFile);
            }

            const response = await fetch(url, {
                method,
                headers: { 
                    'Authorization': `Bearer ${adminToken}`
                },
                body: submitData
            });

            if (response.ok) {
                toast.success(`Banner ${editingBanner ? 'updated' : 'created'}`);
                setIsDialogOpen(false);
                fetchBanners();
                resetForm();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Operation failed');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;
        try {
            const adminToken = localStorage.getItem('token');
            const response = await fetch(`/api/admin/banners/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (response.ok) {
                toast.success('Banner deleted');
                fetchBanners();
            }
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const resetForm = () => {
        setFormData({ 
            title: '', 
            subtitle: '', 
            buttonText: 'Shop Now', 
            image: '', 
            linkUrl: '', 
            position: 'home-main',
            order: 0
        });
        setImageFile(null);
        setImagePreview('');
        setEditingBanner(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-saffron w-10 h-10" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Home Page Banners</h1>
                    <p className="text-gray-500 text-sm">Manage large promo banners displayed on the home page.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-saffron hover:bg-saffron-600">
                            <Plus className="w-4 h-4 mr-2" /> Add Banner
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingBanner ? 'Edit' : 'Add'} Banner</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 pt-4">
                            <div className="col-span-2 space-y-2">
                                <Label>Title (Large Headline)</Label>
                                <Input 
                                    value={formData.title} 
                                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                                    placeholder="e.g. Style and Speed" 
                                    required 
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Subtitle</Label>
                                <Input 
                                    value={formData.subtitle} 
                                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})} 
                                    placeholder="e.g. Do it all with style..." 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Button Text</Label>
                                <Input 
                                    value={formData.buttonText} 
                                    onChange={(e) => setFormData({...formData, buttonText: e.target.value})} 
                                    placeholder="Shop Now" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Link URL</Label>
                                <Input 
                                    value={formData.linkUrl} 
                                    onChange={(e) => setFormData({...formData, linkUrl: e.target.value})} 
                                    placeholder="/products or https://..." 
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Position</Label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    value={formData.position} 
                                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                                >
                                    <option value="home-main">Main Hero Banner (Left Side)</option>
                                    <option value="home-side">Promo Grid Banner (Right Side 2x2)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Sort Order (Lowest first)</Label>
                                <Input 
                                    type="number"
                                    value={formData.order} 
                                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})} 
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Image (URL or Upload)</Label>
                                <div className="flex gap-4 items-center">
                                    <div className="w-24 h-16 rounded-xl border bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {(imagePreview || formData.image) ? (
                                            <img src={imagePreview || formData.image} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-6 h-6 text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="cursor-pointer"
                                        />
                                        <div className="text-xs text-center text-gray-500 font-bold uppercase tracking-wider">OR ENTER URL</div>
                                        <Input 
                                            value={formData.image} 
                                            onChange={(e) => {
                                                setFormData({...formData, image: e.target.value});
                                                if(!imageFile) setImagePreview(e.target.value);
                                            }} 
                                            placeholder="https://..." 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2 pt-4">
                                <Button type="submit" className="w-full bg-saffron" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Banner'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6">
                {banners.map((banner) => (
                    <div key={banner._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 relative group overflow-hidden">
                        <div className="w-full md:w-64 h-32 md:h-auto rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <MonitorIcon className="w-4 h-4 text-saffron" />
                                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                                    {banner.position === 'home-main' ? 'Main Banner' : 'Grid Banner'} (Order: {banner.order || 0})
                                </span>
                            </div>
                            <h3 className="text-xl font-bold">{banner.title}</h3>
                            <p className="text-gray-500 text-sm line-clamp-2">{banner.subtitle}</p>
                            <div className="pt-2 flex items-center gap-4">
                                <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600">{banner.buttonText}</span>
                                <span className="text-xs text-gray-400 truncate max-w-[200px]">{banner.linkUrl}</span>
                            </div>
                        </div>
                        
                        <div className="flex md:flex-col gap-2 justify-center">
                            <button 
                                onClick={() => {
                                    setEditingBanner(banner);
                                    setFormData({ 
                                        title: banner.title, 
                                        subtitle: banner.subtitle || '', 
                                        buttonText: banner.buttonText, 
                                        image: banner.image, 
                                        linkUrl: banner.linkUrl, 
                                        position: banner.position,
                                        order: banner.order || 0
                                    });
                                    setImagePreview(banner.image);
                                    setImageFile(null);
                                    setIsDialogOpen(true);
                                }}
                                className="flex-1 md:flex-none p-3 bg-gray-50 rounded-xl text-blue-500 hover:bg-blue-100 transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleDelete(banner._id)}
                                className="flex-1 md:flex-none p-3 bg-gray-50 rounded-xl text-red-500 hover:bg-red-100 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                
                {banners.length === 0 && (
                    <div className="py-20 text-center text-gray-400 bg-white rounded-3xl border border-dashed">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No banners added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBanners;
