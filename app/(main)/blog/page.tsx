'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link'; // Updated import
import { Calendar, User, ArrowRight } from 'lucide-react';
import { blogAPI } from '@/lib/services/api'; // Updated import path
import { formatDate } from '@/lib/helpers'; // Updated import path
import { toast } from 'sonner';

interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage: string;
    category: string;
    author: { fullName: string };
    createdAt: string;
}

const Blog = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const response = await blogAPI.getBlogs();
            setBlogs(response.data.blogs);
        } catch (error) {
            toast.error('Failed to load blogs');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron" />
            </div>
        );
    }

    return (
        <div className="pt-24 pb-16">
            {/* Hero */}
            <section className="bg-maroon text-white py-16">
                <div className="bhutan-container text-center">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                        Our Blog
                    </h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto">
                        Latest news, tips, and stories from Our Store
                    </p>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-16">
                <div className="bhutan-container">
                    {blogs.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-muted-foreground">No blog posts yet</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blogs.map((blog) => (
                                <article key={blog._id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                                    <Link href={`/blog/${blog.slug}`} className="block aspect-video overflow-hidden">
                                        <img
                                            src={blog.featuredImage || `https://placehold.co/600x400/maroon/white?text=${encodeURIComponent(blog.title)}`}
                                            alt={blog.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </Link>
                                    <div className="p-6">
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(blog.createdAt)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                {blog.author.fullName}
                                            </span>
                                        </div>
                                        <Link href={`/blog/${blog.slug}`}>
                                            <h2 className="text-xl font-display font-semibold mb-2 group-hover:text-saffron transition-colors">
                                                {blog.title}
                                            </h2>
                                        </Link>
                                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                            {blog.excerpt}
                                        </p>
                                        <Link
                                            href={`/blog/${blog.slug}`}
                                            className="inline-flex items-center gap-2 text-saffron font-medium hover:underline"
                                        >
                                            Read More
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Blog;
