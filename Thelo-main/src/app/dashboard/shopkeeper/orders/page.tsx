"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { IOrder } from '@/models/Order';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// A more specific type for the order data after the product details have been fetched
interface PopulatedOrderItem {
    product: {
        _id: string;
        name: string;
        imageUrl?: string;
    };
    quantity: number;
    price: number;
}
interface PopulatedOrder extends Omit<IOrder, 'items'> {
    items: PopulatedOrderItem[];
}

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<PopulatedOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // This function runs every time the page is loaded
        async function fetchOrders() {
            try {
                // It calls the API to get the most up-to-date order list
                const response = await fetch('/api/orders/my-orders');
                const data = await response.json();
                if (data.success) {
                    setOrders(data.orders);
                }
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchOrders();
    }, []); // The empty array means this runs once when the component mounts

    // This helper function chooses the badge color based on the status from the database
    const getBadgeVariant = (status: string): "secondary" | "default" | "destructive" | "outline" => {
        switch (status) {
            case 'Pending': return 'secondary';
            case 'Shipped': return 'default';
            case 'Delivered': return 'secondary';
            case 'Cancelled': return 'destructive';
            default: return 'outline';
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold mb-8">My Orders</h1>
                <div className="space-y-6">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>
            {orders.length > 0 ? (
                <div className="space-y-6">
                    {orders.map(order => (
                        <Card key={order._id}>
                            <CardHeader className="flex flex-row justify-between items-center bg-gray-50 p-4">
                                <div>
                                    <CardTitle>Order #{order._id.toString().slice(-6).toUpperCase()}</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Placed on: {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <Badge variant={getBadgeVariant(order.status)}>{order.status}</Badge>
                            </CardHeader>
                            <CardContent className="p-4">
                                {order.items.map(item => (
                                    <div key={item.product._id} className="flex items-center gap-4 py-3 border-b last:border-b-0">
                                        <Image 
                                            src={item.product.imageUrl || 'https://placehold.co/64x64'}
                                            alt={item.product.name}
                                            width={50}
                                            height={50}
                                            className="rounded-md object-cover"
                                        />
                                        <div className="flex-grow">
                                            <p className="font-semibold">{item.product.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.quantity} x ₹{item.price.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter className="flex justify-end font-bold text-lg bg-gray-50 p-4">
                                <span>Total:</span>
                                <span className="ml-2">₹{order.totalAmount.toFixed(2)}</span>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border-dashed border-2 rounded-lg">
                    <h2 className="text-xl font-semibold">You haven't placed any orders yet.</h2>
                    <p className="text-muted-foreground mt-2">Your placed orders will appear here.</p>
                    <Button asChild className="mt-4">
                        <Link href="/dashboard/shopkeeper">Start Shopping</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}