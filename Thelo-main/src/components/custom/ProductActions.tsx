"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface Product {
    _id: string;
    name: string;
    price: number;
    imageUrl?: string;
    stock: number;
}

interface ProductActionsProps {
    product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart(product, quantity);
    };

    return (
        <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <div className="flex items-center border rounded-md">
                <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(q - 1, 1))} disabled={quantity <= 1}>
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.min(q + 1, product.stock))} disabled={quantity >= product.stock}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <Button size="lg" className="flex-grow" onClick={handleAddToCart}>
                Add {quantity} to Cart
            </Button>
        </div>
    );
}