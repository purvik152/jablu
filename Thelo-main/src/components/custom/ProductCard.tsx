import Image from 'next/image';
import { Card, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { IProduct } from '@/models/Product';

// Interface for product data including the seller's details
interface PopulatedSeller {
  _id: string;
  brandName: string;
}

interface PopulatedProduct extends Omit<IProduct, 'seller'> {
  seller: PopulatedSeller | null;
}

interface ProductCardProps {
  product: PopulatedProduct;
  onSelect: () => void;
  isSelected: boolean;
}

export function ProductCard({ product, onSelect, isSelected }: ProductCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:bg-amber-50 w-full",
        isSelected ? "bg-amber-100 border-amber-400" : "border-transparent"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center space-x-4 p-3">
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image
            src={product.imageUrl || 'https://placehold.co/64x64/e2e8f0/475569?text=Img'}
            alt={product.name}
            fill
            className="rounded-md object-cover"
          />
        </div>
        <div className="flex-grow overflow-hidden">
          <CardTitle className="text-sm font-bold truncate">{product.name}</CardTitle>
          <p className="text-xs text-muted-foreground truncate">by {product.seller?.brandName ?? 'Unknown Seller'}</p>
          <p className="text-md font-bold mt-1">₹{product.price.toFixed(2)}</p>
        </div>
      </div>
    </Card>
  );
}