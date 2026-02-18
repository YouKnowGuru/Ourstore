'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { blogAPI } from '@/lib/services/api';
import { formatDate } from '@/lib/helpers';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });


const blogSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    excerpt: z.string().optional(),
    category: z.string().optional(),
    tags: z.string().optional(),
    featuredImage: z.any().optional(),
});

const AdminBlogs = () => {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [editingBlog, setEditingBlog] = useState<any>(null);

    const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(blogSchema),
        defaultValues: {
            title: '',
            content: '',
            excerpt: '',
            category: '',
            tags: '',
        }
    });

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const response = await blogAPI.getBlogs({}); // Fetch all blogs (draft & published)
            setBlogs(response.data.blogs);
        } catch (error) {
            toast.error('Failed to load blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setImagePreview(URL.createObjectURL(file));
            setValue('featuredImage', file); // Register file manually
        }
    };

    const handleEdit = (blog: any) => {
        setEditingBlog(blog);
        setValue('title', blog.title);
        setValue('content', blog.content);
        setValue('excerpt', blog.excerpt || '');
        setValue('category', blog.category || '');
        setValue('tags', blog.tags ? blog.tags.join(', ') : '');

        if (blog.featuredImage) {
            setImagePreview(blog.featuredImage);
        } else {
            setImagePreview(null);
        }

        setIsAddDialogOpen(true);
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('content', data.content);
            if (data.excerpt) formData.append('excerpt', data.excerpt);
            if (data.category) formData.append('category', data.category);
            if (data.tags) formData.append('tags', data.tags);

            if (data.featuredImage) {
                formData.append('featuredImage', data.featuredImage);
            }

            if (editingBlog) {
                await blogAPI.updateBlog(editingBlog._id, formData);
                toast.success('Blog post updated successfully');
            } else {
                await blogAPI.createBlog(formData);
                toast.success('Blog post created successfully');
            }

            setIsAddDialogOpen(false);
            fetchBlogs();
            resetForm();
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to ${editingBlog ? 'update' : 'create'} blog post`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        reset({
            title: '',
            content: '',
            excerpt: '',
            category: '',
            tags: '',
        });
        setImagePreview(null);
        setEditingBlog(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog post?')) return;

        try {
            await blogAPI.deleteBlog(id);
            toast.success('Blog post deleted');
            fetchBlogs();
        } catch (error) {
            toast.error('Failed to delete blog post');
        }
    };

    const filteredBlogs = blogs.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
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
                <h1 className="text-2xl font-display font-bold">Blog Posts</h1>
                <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                    setIsAddDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-saffron hover:bg-saffron-600">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Post
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingBlog ? 'Edit Blog Post' : 'Add New Blog Post'}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                                        <Input id="title" placeholder="Blog post title" {...register('title')} />
                                        {errors.title && <p className="text-sm text-red-500">{errors.title.message as string}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Input id="category" placeholder="E.g., Tech, Lifestyle" {...register('category')} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tags">Tags</Label>
                                        <Input id="tags" placeholder="Comma separated tags (e.g., react, javascript)" {...register('tags')} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Featured Image</Label>
                                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={handleImageChange}
                                            />
                                            {imagePreview ? (
                                                <div className="relative aspect-video w-full overflow-hidden rounded-md">
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                        <p className="text-white font-medium">Click to change</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-8">
                                                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                                    <p className="text-sm text-gray-500">Click to upload image</p>
                                                    <p className="text-xs text-gray-400 mt-1">Max 5MB (JPG, PNG, WebP)</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="excerpt">Excerpt</Label>
                                        <Textarea
                                            id="excerpt"
                                            placeholder="Short summary of the post"
                                            className="h-[100px]"
                                            {...register('excerpt')}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Content <span className="text-red-500">*</span></Label>
                                <div className="min-h-[300px] mb-12">
                                    <Controller
                                        name="content"
                                        control={control}
                                        render={({ field }) => (
                                            <ReactQuill
                                                theme="snow"
                                                value={field.value}
                                                onChange={field.onChange}
                                                modules={modules}
                                                className="h-[250px]"
                                            />
                                        )}
                                    />
                                </div>
                                {errors.content && <p className="text-sm text-red-500 mt-12">{errors.content.message as string}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t">
                                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-saffron hover:bg-saffron-600" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {editingBlog ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        editingBlog ? 'Update Post' : 'Create Post'
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
                        placeholder="Search blog posts..."
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
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Post</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Author</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Views</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredBlogs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-gray-500">
                                    No blog posts found
                                </td>
                            </tr>
                        ) : (
                            filteredBlogs.map((blog) => (
                                <tr key={blog._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            {blog.featuredImage && (
                                                <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                                                    <img src={blog.featuredImage} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900 line-clamp-1">{blog.title}</p>
                                                <p className="text-xs text-gray-500">{blog.category || 'Uncategorized'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{blog.author?.fullName || 'Unknown'}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{formatDate(blog.createdAt)}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${blog.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {blog.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{blog.views || 0}</td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-500 hover:text-blue-600"
                                                onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-500 hover:text-orange-600"
                                                onClick={() => handleEdit(blog)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-500 hover:text-red-600"
                                                onClick={() => handleDelete(blog._id)}
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

export default AdminBlogs;
