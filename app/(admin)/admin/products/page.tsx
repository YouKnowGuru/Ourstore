'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Upload, X, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { productAPI } from '@/lib/services/api';
import { formatPrice } from '@/lib/helpers';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CATEGORIES } from '@/lib/constants/categories';

const productSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.string().min(1, 'Price is required'), // Input type is text for better control
    discountPrice: z.string().optional(),
    category: z.string().min(1, 'Category is required'),
    stock: z.string().min(1, 'Stock is required'),
    tags: z.string().optional(),
    status: z.enum(['active', 'inactive']).default('active'),
    isFeatured: z.boolean().default(false),
});

const AdminProducts = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            title: '',
            description: '',
            price: '',
            discountPrice: '',
            category: '',
            stock: '',
            tags: '',
            status: 'active' as const,
            isFeatured: false,
        }
    });

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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);

            // Limit to 5 images total
            if (selectedFiles.length + files.length > 5) {
                toast.error('Maximum 5 images allowed');
                return;
            }

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews([...imagePreviews, ...newPreviews]);
            setSelectedFiles([...selectedFiles, ...files]);
        }
    };

    const removeImage = (index: number) => {
        const newPreviews = [...imagePreviews];
        const newFiles = [...selectedFiles];

        URL.revokeObjectURL(newPreviews[index]); // Cleanup
        newPreviews.splice(index, 1);
        newFiles.splice(index, 1);

        setImagePreviews(newPreviews);
        setSelectedFiles(newFiles);
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('price', data.price);
            if (data.discountPrice) formData.append('discountPrice', data.discountPrice);
            formData.append('category', data.category);
            formData.append('stock', data.stock);
            if (data.tags) formData.append('tags', data.tags); // server splits by comma if strictly string
            formData.append('status', data.status);
            formData.append('isFeatured', data.isFeatured.toString());

            selectedFiles.forEach(file => {
                formData.append('images', file);
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
        setValue('stock', product.stock.toString());
        setValue('tags', product.tags?.join(', ') || '');
        setValue('status', product.status);
        setValue('isFeatured', product.isFeatured || false);

        if (product.images) {
            setImagePreviews(product.images);
        }

        setIsAddDialogOpen(true);
    };

    const handleView = (id: string) => {
        window.open(`/products/${id}`, '_blank');
    };

    const resetForm = () => {
        reset();
        setImagePreviews([]);
        setSelectedFiles([]);
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

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <h1 className="text-2xl font-display font-bold">Products</h1>
                <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                    setIsAddDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-saffron hover:bg-saffron-600">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Product Name <span className="text-red-500">*</span></Label>
                                        <Input id="title" placeholder="e.g. Premium Photo Frame" {...register('title')} />
                                        {errors.title && <p className="text-sm text-red-500">{errors.title.message as string}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Price (Nu.) <span className="text-red-500">*</span></Label>
                                            <Input id="price" type="number" placeholder="0.00" {...register('price')} />
                                            {errors.price && <p className="text-sm text-red-500">{errors.price.message as string}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="discountPrice">Discount Price</Label>
                                            <Input id="discountPrice" type="number" placeholder="0.00" {...register('discountPrice')} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                                        <select
                                            id="category"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            {...register('category')}
                                        >
                                            <option value="">Select a category</option>
                                            {CATEGORIES.map((category) => (
                                                <option key={category.name} value={category.name}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category && <p className="text-sm text-red-500">{errors.category.message as string}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="stock">Stock Quantity <span className="text-red-500">*</span></Label>
                                        <Input id="stock" type="number" placeholder="0" {...register('stock')} />
                                        {errors.stock && <p className="text-sm text-red-500">{errors.stock.message as string}</p>}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Product Images (Max 5)</Label>
                                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative min-h-[150px] flex flex-col items-center justify-center">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={handleImageChange}
                                            />
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">Click to upload images</p>
                                        </div>

                                        {imagePreviews.length > 0 && (
                                            <div className="grid grid-cols-4 gap-2 mt-4">
                                                {imagePreviews.map((preview, index) => (
                                                    <div key={index} className="relative aspect-square rounded-md overflow-hidden group border">
                                                        <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tags">Tags</Label>
                                        <Input id="tags" placeholder="Comma separated tags" {...register('tags')} />
                                    </div>

                                    <div className="flex items-center space-x-2 pt-4">
                                        <input
                                            type="checkbox"
                                            id="isFeatured"
                                            {...register('isFeatured')}
                                            className="w-4 h-4 rounded border-gray-300 text-saffron focus:ring-saffron"
                                        />
                                        <Label htmlFor="isFeatured" className="font-medium cursor-pointer">
                                            Feature on Home Page
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                                <Textarea
                                    id="description"
                                    placeholder="Detailed product description..."
                                    className="min-h-[120px]"
                                    {...register('description')}
                                />
                                {errors.description && <p className="text-sm text-red-500">{errors.description.message as string}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t">
                                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-saffron hover:bg-saffron-600" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        editingProduct ? 'Update Product' : 'Create Product'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Product</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Price</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Stock</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-gray-500">
                                    No products found
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                {product.images && product.images[0] ? (
                                                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Plus className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium truncate max-w-[200px]" title={product.title}>{product.title}</span>
                                                {product.isFeatured && (
                                                    <div className="flex items-center gap-1 text-[10px] text-saffron font-bold uppercase tracking-wider">
                                                        <Star className="w-3 h-3 fill-saffron" />
                                                        Featured
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{product.category}</td>
                                    <td className="py-3 px-4 text-sm font-medium">
                                        {formatPrice(product.discountPrice || product.price)}
                                        {product.discountPrice && (
                                            <span className="ml-2 text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{product.stock}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-500 hover:text-blue-600"
                                                onClick={() => handleView(product._id)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-500 hover:text-orange-600"
                                                onClick={() => handleEdit(product)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-500 hover:text-red-600"
                                                onClick={() => handleDelete(product._id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
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
