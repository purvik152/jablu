"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from '@/components/custom/ProductCard';
import { MarketplaceSearch } from '@/components/custom/MarketplaceSearch';
import { ProductActions } from '@/components/custom/ProductActions';
import { IProduct } from '@/models/Product';
import { Toaster, toast } from 'sonner';

// Interface for product data including the seller's details
interface PopulatedSeller {
  _id: string;
  brandName: string;
}

interface PopulatedProduct extends Omit<IProduct, 'seller'> {
  _id: string; // Ensure _id is a string
  seller: PopulatedSeller | null;
}

// A new component for the right-side detail view
function ProductDetailView({ product }: { product: PopulatedProduct }) {
  return (
    <div className="sticky top-24"> {/* Makes the right column "stick" */}
        <div className="relative w-full h-80 mb-6 rounded-lg overflow-hidden">
          <Image
            src={product.imageUrl || 'https://placehold.co/800x600/e2e8f0/475569?text=Image'}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <h2 className="text-3xl font-bold">{product.name}</h2>
        <p className="text-lg text-muted-foreground mb-4">by {product.seller?.brandName ?? 'Unknown Seller'}</p>
        <p className="text-4xl font-bold text-primary my-4">₹{product.price.toFixed(2)}</p>

        <div className="text-md space-y-3 my-6 border-t pt-6">
          <p><span className="font-semibold text-muted-foreground">Location:</span> {product.location}</p>
          <p><span className="font-semibold text-muted-foreground">Category:</span> {product.category}</p>
          <p><span className="font-semibold text-muted-foreground">Stock:</span> {product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'}</p>
        </div>

        <p className="text-md text-foreground leading-relaxed my-4">{product.description}</p>
        
        <ProductActions product={product} />
    </div>
  );
}

export default function ShopkeeperMarketplace() {
  const [products, setProducts] = useState<PopulatedProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<PopulatedProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  const fetchProducts = async (searchQuery = '', locationQuery = '') => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products?search=${searchQuery}&location=${locationQuery}`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
        if (data.products.length > 0) {
            setSelectedProduct(data.products[0]); // Select the first product
        } else {
            setSelectedProduct(null); // Clear selection if no products
            toast.info("No products found for your search.");
        }
      } else {
        toast.error("Failed to fetch products.");
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("An error occurred while fetching products.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = () => {
    fetchProducts(searchTerm, location);
  };

  return (
    <main className="container mx-auto py-8">
      <Toaster richColors />
      <div className="mb-8">
        <MarketplaceSearch 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            location={location}
            setLocation={setLocation}
            onSearch={handleSearch}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Product List */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="space-y-2">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)
            ) : products.length > 0 ? (
              products.map((product) => (
                <ProductCard
                  key={String(product._id)}
                  product={product}
                  isSelected={selectedProduct?._id === product._id}
                  onSelect={() => setSelectedProduct(product)}
                />
              ))
            ) : (
              <p className="text-center py-10 text-muted-foreground">No products found.</p>
            )}
          </div>
        </div>

        {/* Right Column: Product Detail */}
        <div className="lg:col-span-7 xl:col-span-8">
          {isLoading ? (
            <Skeleton className="h-[800px] w-full rounded-lg" />
          ) : selectedProduct ? (
            <ProductDetailView product={selectedProduct} />
          ) : (
             <div className="flex h-full items-center justify-center text-muted-foreground">
                <p>Select a product to see details.</p>
             </div>
          )}
        </div>
      </div>
    </main>
  );
}