'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, Loader2, Image as ImageIcon, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const AdminCategories = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', image: '', order: 0 });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const adminToken = localStorage.getItem('token');
            const response = await fetch('/api/admin/categories', {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const data = await response.json();
            if (response.ok && Array.isArray(data)) {
                setCategories(data);
            } else {
                setCategories([]);
                toast.error(data.message || 'Failed to load categories');
            }
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const adminToken = localStorage.getItem('token');
            const method = editingCategory ? 'PATCH' : 'POST';
            const url = editingCategory 
                ? `/api/admin/categories/${editingCategory._id}` 
                : '/api/admin/categories';

            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('image', formData.image);
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

            const data = await response.json();
            if (response.ok) {
                toast.success(`Category ${editingCategory ? 'updated' : 'created'}`);
                setIsDialogOpen(false);
                fetchCategories();
                resetForm();
            } else {
                toast.error(data.message || 'Operation failed');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            const adminToken = localStorage.getItem('token');
            const response = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (response.ok) {
                toast.success('Category deleted');
                fetchCategories();
            }
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', image: '', order: 0 });
        setImageFile(null);
        setImagePreview('');
        setEditingCategory(null);
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
                    <h1 className="text-2xl font-display font-bold">Circular Categories</h1>
                    <p className="text-gray-500 text-sm">Manage the circular icons shown at the top of the home page.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-saffron hover:bg-saffron-600">
                            <Plus className="w-4 h-4 mr-2" /> Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? 'Edit' : 'Add'} Category</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Category Name</Label>
                                <Input 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                    placeholder="e.g. Beauty" 
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Image (URL or Upload)</Label>
                                <div className="flex gap-4 items-center">
                                    <div className="w-16 h-16 rounded-full border bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
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
                            <div className="space-y-2">
                                <Label>Display Order</Label>
                                <Input 
                                    type="number"
                                    value={formData.order} 
                                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})} 
                                />
                            </div>
                            <Button type="submit" className="w-full bg-saffron" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Category'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {categories.map((cat) => (
                    <div key={cat._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 relative group">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-50">
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-sm text-center">{cat.name}</span>
                        
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button 
                                onClick={() => {
                                    setEditingCategory(cat);
                                    setFormData({ name: cat.name, image: cat.image, order: cat.order });
                                    setImagePreview(cat.image);
                                    setImageFile(null);
                                    setIsDialogOpen(true);
                                }}
                                className="p-1.5 bg-white shadow-md rounded-full text-blue-500 hover:bg-blue-50"
                            >
                                <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                                onClick={() => handleDelete(cat._id)}
                                className="p-1.5 bg-white shadow-md rounded-full text-red-500 hover:bg-red-50"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
                
                {categories.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-400">
                        <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No categories added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCategories;
