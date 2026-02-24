'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Upload, X, Loader2, Star, Tag, Package, Info, Image as ImageIcon, Settings, Search as SeoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { productAPI } from '@/lib/services/api';
import { formatPrice } from '@/lib/helpers';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CATEGORIES } from '@/lib/constants/categories';
import dynamic from 'next/dynamic';
import { useDropzone } from 'react-dropzone';

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

const productSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.string().min(1, 'Price is required'),
    discountPrice: z.string().optional(),
    category: z.string().min(1, 'Category is required'),
    subcategory: z.string().optional(),
    stock: z.string().min(1, 'Stock is required'),
    sku: z.string().optional(),
    tags: z.string().optional(),
    status: z.enum(['active', 'inactive']).default('active'),
    isFeatured: z.boolean().default(false),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    isCustomizable: z.boolean().default(false),
});

const AdminProducts = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [imageItems, setImageItems] = useState<{ url: string; file?: File; isExisting?: boolean }[]>([]);

    const { register, handleSubmit, reset, setValue, control, watch, formState: { errors } } = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            title: '',
            description: '',
            price: '',
            discountPrice: '',
            category: '',
            subcategory: '',
            stock: '',
            sku: '',
            tags: '',
            status: 'active' as const,
            isFeatured: false,
            metaTitle: '',
            metaDescription: '',
            isCustomizable: false,
        }
    });

    const isCustomizable = watch('isCustomizable');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await productAPI.getProducts({ limit: 100 });
            setProducts(response.data.products);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (imageItems.length + acceptedFiles.length > 8) {
            toast.error('Maximum 8 images allowed');
            return;
        }

        const newItems = acceptedFiles.map(file => ({
            url: URL.createObjectURL(file),
            file: file,
            isExisting: false
        }));
        setImageItems(prev => [...prev, ...newItems]);
    }, [imageItems]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 8
    });

    const removeImage = (index: number) => {
        setImageItems(prev => {
            const newItems = [...prev];
            if (!newItems[index].isExisting) {
                URL.revokeObjectURL(newItems[index].url);
            }
            newItems.splice(index, 1);
            return newItems;
        });
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (data[key] !== undefined && data[key] !== null) {
                    formData.append(key, data[key]);
                }
            });

            // Separate existing images from new files
            imageItems.forEach(item => {
                if (item.isExisting) {
                    formData.append('existingImages', item.url);
                } else if (item.file) {
                    formData.append('images', item.file);
                }
            });

            if (editingProduct) {
                await productAPI.updateProduct(editingProduct._id, formData);
                toast.success('Product updated successfully');
            } else {
                await productAPI.createProduct(formData);
                toast.success('Product created successfully');
            }

            setIsAddDialogOpen(false);
            fetchProducts();
            resetForm();
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to ${editingProduct ? 'update' : 'create'} product`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setValue('title', product.title);
        setValue('description', product.description);
        setValue('price', product.price.toString());
        setValue('discountPrice', product.discountPrice?.toString() || '');
        setValue('category', product.category);
        setValue('subcategory', product.subcategory || '');
        setValue('stock', product.stock.toString());
        setValue('sku', product.sku || '');
        setValue('tags', product.tags?.join(', ') || '');
        setValue('status', product.status);
        setValue('isFeatured', product.isFeatured || false);
        setValue('metaTitle', product.metaTitle || '');
        setValue('metaDescription', product.metaDescription || '');
        setValue('isCustomizable', product.isCustomizable || false);

        if (product.images) {
            setImageItems(product.images.map((img: string) => ({
                url: img,
                isExisting: true
            })));
        }

        setIsAddDialogOpen(true);
    };

    const handleView = (id: string) => {
        window.open(`/products/${id}`, '_blank');
    };

    const resetForm = () => {
        reset();
        setImageItems([]);
        setEditingProduct(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await productAPI.deleteProduct(id);
            toast.success('Product deleted');
            fetchProducts();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const filteredProducts = useMemo(() => products.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    ), [products, searchQuery]);

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean']
        ],
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Products</h1>
                    <p className="text-gray-500 text-sm">Manage your store inventory and product details.</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                    setIsAddDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-saffron hover:bg-saffron-600 shadow-md">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col p-0">
                        <DialogHeader className="p-6 pb-0">
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                {editingProduct ? (
                                    <><Edit className="w-5 h-5 text-saffron" /> Edit Product</>
                                ) : (
                                    <><Plus className="w-5 h-5 text-saffron" /> Add New Product</>
                                )}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
                            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
                                <Tabs defaultValue="general" className="w-full">
                                    <TabsList className="grid w-full grid-cols-5 mb-8 bg-gray-100 p-1 rounded-lg">
                                        <TabsTrigger value="general" className="flex items-center gap-2 rounded-md transition-all">
                                            <Info className="w-4 h-4" /> General
                                        </TabsTrigger>
                                        <TabsTrigger value="inventory" className="flex items-center gap-2 rounded-md transition-all">
                                            <Package className="w-4 h-4" /> Stock
                                        </TabsTrigger>
                                        <TabsTrigger value="media" className="flex items-center gap-2 rounded-md transition-all">
                                            <ImageIcon className="w-4 h-4" /> Media
                                        </TabsTrigger>
                                        <TabsTrigger value="seo" className="flex items-center gap-2 rounded-md transition-all">
                                            <SeoIcon className="w-4 h-4" /> SEO
                                        </TabsTrigger>
                                        <TabsTrigger value="advanced" className="flex items-center gap-2 rounded-md transition-all">
                                            <Settings className="w-4 h-4" /> More
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="general" className="space-y-6 animate-in fade-in-50 duration-300">
                                        <div className="grid gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="title" className="text-sm font-semibold uppercase tracking-wider text-gray-500">Product Name <span className="text-red-500">*</span></Label>
                                                <Input id="title" placeholder="e.g. Premium Photo Frame" {...register('title')} className="h-11 focus-visible:ring-saffron" />
                                                {errors.title && <p className="text-sm text-red-500 font-medium">{errors.title.message as string}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="description" className="text-sm font-semibold uppercase tracking-wider text-gray-500">Product Description <span className="text-red-500">*</span></Label>
                                                <div className="border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-saffron focus-within:ring-offset-2 transition-all">
                                                    <Controller
                                                        name="description"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <ReactQuill
                                                                theme="snow"
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                modules={quillModules}
                                                                className="h-48 mb-12"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                                {errors.description && <p className="text-sm text-red-500 font-medium">{errors.description.message as string}</p>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="category" className="text-sm font-semibold uppercase tracking-wider text-gray-500">Category <span className="text-red-500">*</span></Label>
                                                    <select
                                                        id="category"
                                                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        {...register('category')}
                                                    >
                                                        <option value="">Select a category</option>
                                                        {CATEGORIES.map((category) => (
                                                            <option key={category.name} value={category.name}>
                                                                {category.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.category && <p className="text-sm text-red-500 font-medium">{errors.category.message as string}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="subcategory" className="text-sm font-semibold uppercase tracking-wider text-gray-500">Subcategory</Label>
                                                    <Input id="subcategory" placeholder="e.g. Gift Items" {...register('subcategory')} className="h-11 focus-visible:ring-saffron" />
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="inventory" className="space-y-6 animate-in fade-in-50 duration-300">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="price" className="text-sm font-semibold uppercase tracking-wider text-gray-500">Base Price (Nu.) <span className="text-red-500">*</span></Label>
                                                    <Input id="price" type="number" step="0.01" placeholder="0.00" {...register('price')} className="h-11 focus-visible:ring-saffron" />
                                                    {errors.price && <p className="text-sm text-red-500 font-medium">{errors.price.message as string}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="discountPrice" className="text-sm font-semibold uppercase tracking-wider text-gray-500">Discount Price (Nu.)</Label>
                                                    <Input id="discountPrice" type="number" step="0.01" placeholder="0.00" {...register('discountPrice')} className="h-11 focus-visible:ring-saffron text-green-600 font-medium" />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="stock" className="text-sm font-semibold uppercase tracking-wider text-gray-500">Stock Quantity <span className="text-red-500">*</span></Label>
                                                    <Input id="stock" type="number" placeholder="0" {...register('stock')} className="h-11 focus-visible:ring-saffron" />
                                                    {errors.stock && <p className="text-sm text-red-500 font-medium">{errors.stock.message as string}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="sku" className="text-sm font-semibold uppercase tracking-wider text-gray-500">SKU / Item Code</Label>
                                                    <Input id="sku" placeholder="e.g. PRD-001-XYZ" {...register('sku')} className="h-11 focus-visible:ring-saffron" />
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="media" className="space-y-6 animate-in fade-in-50 duration-300">
                                        <div className="space-y-4">
                                            <Label className="text-sm font-semibold uppercase tracking-wider text-gray-500">Product Images (Up to 8)</Label>
                                            <div
                                                {...getRootProps()}
                                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 min-h-[200px] ${isDragActive ? 'border-saffron bg-saffron/5' : 'border-gray-200 hover:border-saffron hover:bg-gray-50'}`}
                                            >
                                                <input {...getInputProps()} />
                                                <div className="w-12 h-12 rounded-full bg-saffron/10 flex items-center justify-center">
                                                    <Upload className="w-6 h-6 text-saffron" />
                                                </div>
                                                <div>
                                                    <p className="text-base font-semibold">Click or drag images here</p>
                                                    <p className="text-sm text-gray-500 mt-1">PNG, JPG or WebP (Max 5MB each)</p>
                                                </div>
                                            </div>

                                            {imageItems.length > 0 && (
                                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-6">
                                                    {imageItems.map((item, index) => (
                                                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border-2 border-transparent hover:border-saffron transition-all bg-white shadow-sm overflow-hidden">
                                                            <img src={item.url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeImage(index)}
                                                                    className="bg-white/20 backdrop-blur-md text-white rounded-full p-2 hover:bg-red-500 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            {index === 0 && (
                                                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-saffron text-white text-[10px] font-bold rounded shadow-sm">
                                                                    PRIMARY
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="seo" className="space-y-6 animate-in fade-in-50 duration-300">
                                        <div className="space-y-4 max-w-2xl">
                                            <div className="space-y-2">
                                                <Label htmlFor="metaTitle" className="text-sm font-semibold uppercase tracking-wider text-gray-500">Meta Title (SEO)</Label>
                                                <Input id="metaTitle" placeholder="Google search title..." {...register('metaTitle')} className="h-11 focus-visible:ring-saffron" />
                                                <p className="text-[10px] text-gray-400">Recommended: 50-60 characters</p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="metaDescription" className="text-sm font-semibold uppercase tracking-wider text-gray-500">Meta Description (SEO)</Label>
                                                <Textarea id="metaDescription" placeholder="Brief summary for search engines..." {...register('metaDescription')} className="min-h-[100px] focus-visible:ring-saffron" />
                                                <p className="text-[10px] text-gray-400">Recommended: 150-160 characters</p>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="advanced" className="space-y-6 animate-in fade-in-50 duration-300">
                                        <div className="grid gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="tags" className="text-sm font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                                    <Tag className="w-4 h-4" /> Product Tags
                                                </Label>
                                                <Input id="tags" placeholder="gift, personalized, frame..." {...register('tags')} className="h-11 focus-visible:ring-saffron" />
                                                <p className="text-[10px] text-gray-400">Separate tags with commas</p>
                                            </div>

                                            <div className="flex flex-col gap-4 p-4 border rounded-xl bg-gray-50">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label htmlFor="status" className="text-base font-semibold">Publish Status</Label>
                                                        <p className="text-xs text-gray-500">Hide or show this product in your store.</p>
                                                    </div>
                                                    <select
                                                        id="status"
                                                        {...register('status')}
                                                        className="h-10 px-4 rounded-md border bg-white focus:ring-2 focus:ring-saffron outline-none text-sm font-medium"
                                                    >
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                    </select>
                                                </div>

                                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                                    <div className="space-y-0.5">
                                                        <Label htmlFor="isFeatured" className="text-base font-semibold">Featured Product</Label>
                                                        <p className="text-xs text-gray-500">Pin this product to your home page hero or featured section.</p>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        id="isFeatured"
                                                        {...register('isFeatured')}
                                                        className="w-6 h-6 rounded border-gray-300 text-saffron focus:ring-saffron transition-all cursor-pointer"
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                                    <div className="space-y-0.5">
                                                        <Label htmlFor="isCustomizable" className="text-base font-semibold">Allow Customization</Label>
                                                        <p className="text-xs text-gray-500">Enable text input or image uploads for customers.</p>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        id="isCustomizable"
                                                        {...register('isCustomizable')}
                                                        className="w-6 h-6 rounded border-gray-300 text-saffron focus:ring-saffron transition-all cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="h-11 px-6">
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-saffron hover:bg-saffron-600 h-11 px-8 font-semibold shadow-md active:scale-95 transition-all" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        editingProduct ? (
                                            <><Edit className="w-4 h-4 mr-2" /> Update Product</>
                                        ) : (
                                            <><Plus className="w-4 h-4 mr-2" /> Create Product</>
                                        )
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-saffron transition-colors" />
                    <Input
                        placeholder="Search by product name, SKU or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 border-gray-200 focus:border-saffron focus:ring-saffron"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full">
                    <thead className="bg-gray-50/50 border-b">
                        <tr>
                            <th className="text-left py-4 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">Product</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">Details</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">Pricing</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">Inventory</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                            <th className="text-right py-4 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center text-gray-400 flex flex-col items-center gap-2">
                                    <Package className="w-10 h-10 opacity-20" />
                                    No products found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm relative">
                                                {product.images && product.images[0] ? (
                                                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ImageIcon className="w-6 h-6 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-gray-900 truncate max-w-[220px]" title={product.title}>{product.title}</span>
                                                <span className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{product.sku || 'No SKU'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md w-fit inline-block">{product.category}</span>
                                            {product.isFeatured && (
                                                <div className="flex items-center gap-1 text-[10px] text-saffron font-bold uppercase tracking-wider">
                                                    <Star className="w-3 h-3 fill-saffron" />
                                                    Featured
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">{formatPrice(product.discountPrice || product.price)}</span>
                                            {product.discountPrice && (
                                                <span className="text-[10px] text-gray-400 line-through decoration-red-400/50">{formatPrice(product.price)}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-sm font-medium ${product.stock <= 5 ? 'text-red-500' : 'text-gray-600'}`}>{product.stock} in stock</span>
                                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${product.stock <= 5 ? 'bg-red-400' : 'bg-green-400'}`}
                                                    style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${product.status === 'active'
                                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                            : 'bg-rose-50 text-rose-700 ring-rose-600/20'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${product.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            {product.status}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                                                onClick={() => handleView(product._id)}
                                                title="View in store"
                                            >
                                                <Eye className="w-4.5 h-4.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-all"
                                                onClick={() => handleEdit(product)}
                                                title="Edit product"
                                            >
                                                <Edit className="w-4.5 h-4.5" />
                                            </Button>
                                            <div className="w-px h-4 bg-gray-200 mx-1" />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                onClick={() => handleDelete(product._id)}
                                                title="Delete product"
                                            >
                                                <Trash2 className="w-4.5 h-4.5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProducts;
