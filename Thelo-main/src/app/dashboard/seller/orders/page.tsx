"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Define the types for the populated order data
interface PopulatedCustomer {
    firstName: string;
    lastName: string;
}
interface PopulatedOrderItem {
    product: { _id: string; name: string; imageUrl?: string; };
    quantity: number;
    price: number;
}
interface SellerOrder {
    _id: string;
    customer: PopulatedCustomer;
    items: PopulatedOrderItem[];
    shippingAddress: string;
    mobileNumber: string;
    status: string;
    createdAt: Date;
}

export default function OrdersReceivedPage() {
    const [orders, setOrders] = useState<SellerOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/orders/seller');
            const data = await response.json();
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error("Failed to fetch seller orders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdateStatus = async (orderId: string, newStatus: 'Shipped' | 'Delivered') => {
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error('Failed to update status');
            
            // Refetch orders to get the latest status
            fetchOrders(); 
            toast.success(`Order #${orderId.slice(-6).toUpperCase()} marked as ${newStatus}.`);

        } catch (error) {
            console.error(error);
            toast.error("Failed to update order status.");
        }
    };

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
                <h1 className="text-3xl font-bold mb-8">Orders Received</h1>
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Orders Received</h1>
            {orders.length > 0 ? (
                <div className="space-y-6">
                    {orders.map(order => (
                        <Card key={order._id}>
                            <CardHeader className="flex flex-row justify-between items-center bg-gray-50 p-4">
                                <div>
                                    <CardTitle>Order #{order._id.slice(-6).toUpperCase()}</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Received on: {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <Badge variant={getBadgeVariant(order.status)}>{order.status}</Badge>
                            </CardHeader>
                            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h3 className="font-semibold">Items in this Order</h3>
                                    {order.items.map(item => (
                                        <div key={item.product._id} className="flex items-center gap-4">
                                            <Image 
                                                src={item.product.imageUrl || 'https://placehold.co/64x64'}
                                                alt={item.product.name}
                                                width={40}
                                                height={40}
                                                className="rounded-md object-cover"
                                            />
                                            <div className="flex-grow">
                                                <p className="font-medium text-sm">{item.product.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.quantity} x ₹{item.price.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h3 className="font-semibold">Customer & Shipping Details</h3>
                                    <div className="text-sm">
                                        <p><span className="font-medium">Name:</span> {order.customer.firstName} {order.customer.lastName}</p>
                                        <p><span className="font-medium">Phone:</span> {order.mobileNumber}</p>
                                        <p><span className="font-medium">Address:</span> {order.shippingAddress}</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end p-4 bg-gray-50">
                                <Button 
                                    onClick={() => handleUpdateStatus(order._id, 'Shipped')}
                                    disabled={order.status !== 'Pending'}
                                >
                                    {order.status === 'Pending' ? 'Mark as Shipped' : `Order ${order.status}`}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                // --- THIS IS THE FIX ---
                // The closing </div> tag was missing here
                <div className="text-center py-20 border-dashed border-2 rounded-lg">
                    <h2 className="text-xl font-semibold">You have not received any orders yet.</h2>
                    <p className="text-muted-foreground mt-2">New orders will appear here.</p>
                </div>
            )}
        </div>
    );
}