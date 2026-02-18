import { useEffect, useState } from 'react';
import { galleryAPI } from '@/services/api';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import BackToTop from '@/components/BackToTop';

interface GalleryImage {
  _id: string;
  url: string;
  caption: string;
}

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await galleryAPI.getGallery();
      // Flatten images from all galleries
      const allImages = response.data.flatMap((gallery: any) => gallery.images);
      setImages(allImages);
    } catch (error) {
      toast.error('Failed to load gallery');
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
    <div className="pt-20">
      <BackToTop />

      {/* Hero */}
      <section className="relative min-h-[400px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-maroon via-maroon-800 to-bhutan-blue">
          <div className="absolute inset-0 mandala-pattern opacity-10" />
          <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-saffron/20 blur-3xl float-slow" />
          <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-gold/20 blur-3xl float-medium" />
        </div>

        <div className="bhutan-container relative z-10 text-center text-white py-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 animate-slide-in-up">
            Our{' '}
            <span className="bg-gradient-to-r from-saffron via-gold to-saffron bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
              Gallery
            </span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Explore our products and services through images
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-gradient-to-b from-white to-bhutan-cream/30">
        <div className="bhutan-container">
          {images.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No images in gallery yet</p>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {images.map((image, index) => (
                <button
                  key={image._id}
                  onClick={() => setSelectedImage(image)}
                  className="group relative break-inside-avoid mb-4 block w-full rounded-2xl overflow-hidden shadow-lg hover:shadow-bhutan-xl transition-all duration-500 transform hover:-translate-y-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {image.caption}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 w-12 h-12 rounded-full glass-dark text-white hover:bg-white/20 transition-all duration-300 flex items-center justify-center group"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
          <div className="max-w-6xl w-full">
            <img
              src={selectedImage.url}
              alt={selectedImage.caption}
              className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            />
            {selectedImage.caption && (
              <p className="text-center text-white text-lg mt-6 font-medium">
                {selectedImage.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
