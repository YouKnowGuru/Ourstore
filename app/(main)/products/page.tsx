'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useProducts } from '@/lib/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import { debounce } from '@/lib/helpers';

const ProductsContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const {
        products,
        categories,
        loading,
        pagination,
        getProducts,
        getCategories,
    } = useProducts();

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Filter states
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [priceRange, setPriceRange] = useState<[number, number]>([
        Number(searchParams.get('minPrice')) || 0,
        Number(searchParams.get('maxPrice')) || 50000,
    ]);
    const [isCustomizable, setIsCustomizable] = useState(
        searchParams.get('customizable') === 'true'
    );
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
        (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    );

    useEffect(() => {
        getCategories();
        fetchProducts();
    }, []);

    const fetchProducts = useCallback(
        debounce(() => {
            const params: any = {
                page: 1,
                limit: 12,
                sortBy,
                sortOrder,
            };

            if (searchQuery) params.search = searchQuery;
            if (selectedCategory) params.category = selectedCategory;
            if (priceRange[0] > 0) params.minPrice = priceRange[0];
            if (priceRange[1] < 50000) params.maxPrice = priceRange[1];
            if (isCustomizable) params.isCustomizable = true;

            getProducts(params);
        }, 300),
        [searchQuery, selectedCategory, priceRange, isCustomizable, sortBy, sortOrder]
    );

    const updateSearchParams = () => {
        // Next.js approach to update URL params
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (selectedCategory) params.set('category', selectedCategory);
        if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
        if (priceRange[1] < 50000) params.set('maxPrice', priceRange[1].toString());
        if (isCustomizable) params.set('customizable', 'true');
        if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
        if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);

        router.push(`/products?${params.toString()}`);
    };

    useEffect(() => {
        fetchProducts();
        // We don't call updateSearchParams here to avoid infinite loops or unnecessary pushes during initial render/state sync
        // But for filter changes triggered by user, we might want to update URL.
        // Ideally, we should sync state FROM URL, and push TO URL on change.
        // For simplicity of migration, we'll keep similar logic but ensure we don't loop.
    }, [selectedCategory, isCustomizable, sortBy, sortOrder]);

    // Sync URL on significant changes or just let actions trigger it
    useEffect(() => {
        // This effect ensures URL is updated when filters change
        const timer = setTimeout(() => {
            updateSearchParams();
        }, 500);
        return () => clearTimeout(timer);
    }, [selectedCategory, isCustomizable, sortBy, sortOrder, priceRange, searchQuery]);


    useEffect(() => {
        fetchProducts();
    }, [priceRange]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProducts();
        updateSearchParams();
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setPriceRange([0, 50000]);
        setIsCustomizable(false);
        setSortBy('createdAt');
        setSortOrder('desc');
        router.push('/products');
        setTimeout(() => fetchProducts(), 100);
    };

    const hasActiveFilters =
        searchQuery || selectedCategory || priceRange[0] > 0 || priceRange[1] < 50000 || isCustomizable;

    const FilterContent = () => (
        <div className="space-y-6">
            {/* Categories */}
            <div>
                <h4 className="font-medium mb-3">Categories</h4>
                <div className="space-y-2">
                    {categories.map((category) => (
                        <label key={category} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                                checked={selectedCategory === category}
                                onCheckedChange={() =>
                                    setSelectedCategory(selectedCategory === category ? '' : category)
                                }
                            />
                            <span className="text-sm">{category}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h4 className="font-medium mb-3">Price Range</h4>
                <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    max={50000}
                    step={500}
                    className="mb-4"
                />
                <div className="flex items-center justify-between text-sm">
                    <span>Nu. {priceRange[0]}</span>
                    <span>Nu. {priceRange[1]}</span>
                </div>
            </div>

            {/* Customizable */}
            <div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                        checked={isCustomizable}
                        onCheckedChange={(checked) => setIsCustomizable(checked as boolean)}
                    />
                    <span className="text-sm">Customizable Products Only</span>
                </label>
            </div>

            {hasActiveFilters && (
                <Button variant="outline" className="w-full" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                </Button>
            )}
        </div>
    );

    return (
        <div className="pt-24 pb-16">
            <div className="bhutan-container">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold mb-2">All Products</h1>
                    <p className="text-muted-foreground">
                        Showing {products.length} of {pagination.total} products
                    </p>
                </div>

                {/* Search and Filters Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </form>

                    {/* Sort */}
                    <div className="flex gap-2">
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="createdAt">Newest</SelectItem>
                                <SelectItem value="price">Price</SelectItem>
                                <SelectItem value="ratings.average">Rating</SelectItem>
                                <SelectItem value="salesCount">Popularity</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </Button>

                        {/* View Mode */}
                        <div className="hidden sm:flex border rounded-md">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="icon"
                                onClick={() => setViewMode('grid')}
                                className="rounded-none rounded-l-md"
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="icon"
                                onClick={() => setViewMode('list')}
                                className="rounded-none rounded-r-md"
                            >
                                <List className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Mobile Filter */}
                        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="lg:hidden">
                                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                                    Filters
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left">
                                <SheetHeader>
                                    <SheetTitle>Filters</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6">
                                    <FilterContent />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar Filters - Desktop */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-display font-semibold">Filters</h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-saffron hover:underline"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>
                            <FilterContent />
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-lg text-muted-foreground">No products found</p>
                                {hasActiveFilters && (
                                    <Button variant="outline" className="mt-4" onClick={clearFilters}>
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div
                                className={`grid gap-6 ${viewMode === 'grid'
                                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                                    : 'grid-cols-1'
                                    }`}
                            >
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center mt-8 gap-2">
                                {[...Array(pagination.totalPages)].map((_, i) => (
                                    <Button
                                        key={i}
                                        variant={pagination.currentPage === i + 1 ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => getProducts({ page: i + 1 })}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron" />
            </div>
        }>
            <ProductsContent />
        </Suspense>
    );
}
