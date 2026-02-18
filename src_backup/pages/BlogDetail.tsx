import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { blogAPI } from '@/services/api';
import { formatDate } from '@/utils/helpers';
import { toast } from 'sonner';

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  featuredImage: string;
  category: string;
  author: { fullName: string };
  createdAt: string;
}

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const response = await blogAPI.getBlog(slug as string);
      setBlog(response.data);
    } catch (error) {
      toast.error('Failed to load blog post');
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

  if (!blog) {
    return (
      <div className="pt-24 pb-16 text-center">
        <p className="text-muted-foreground">Blog post not found</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="bhutan-container max-w-4xl">
        <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-saffron mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <article>
          {/* Featured Image */}
          <div className="aspect-video rounded-2xl overflow-hidden mb-8">
            <img
              src={blog.featuredImage || `https://placehold.co/1200x600/maroon/white?text=${encodeURIComponent(blog.title)}`}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(blog.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {blog.author.fullName}
            </span>
            <span className="px-3 py-1 bg-saffron/10 text-saffron rounded-full text-xs">
              {blog.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-8">
            {blog.title}
          </h1>

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;
