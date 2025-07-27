"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

// ... (interfaces remain the same)
interface Product { _id: string; name: string; price: number; imageUrl?: string; }
interface CartItem { product: Product; quantity: number; }

// --- 1. ADD clearCart TO THE TYPE ---
interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const addToCart = (product: Product, quantity: number) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.product._id === product._id);
            toast.success(`Added ${quantity} x ${product.name} to cart!`);

            if (existingItem) {
                return prevItems.map(item =>
                    item.product._id === product._id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [...prevItems, { product, quantity }];
            }
        });
    };

    // --- 2. ADD THE clearCart FUNCTION ---
    const clearCart = () => {
        setCartItems([]);
    };

    return (
        // --- 3. ADD clearCart TO THE PROVIDER'S VALUE ---
        <CartContext.Provider value={{ cartItems, addToCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}