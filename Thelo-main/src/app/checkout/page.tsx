"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Navbar } from '@/components/custom/Navbar';
import { toast } from 'sonner';

interface User {
    firstName: string;
    lastName: string;
    email: string;
}

// --- NEW: An interface for form errors ---
interface FormErrors {
    mobileNumber?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}

export default function CheckoutPage() {
    const { cartItems, clearCart } = useCart();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Form state
    const [mobileNumber, setMobileNumber] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [aptSuite, setAptSuite] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    
    // --- NEW: State to hold validation errors ---
    const [errors, setErrors] = useState<FormErrors>({});
    
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await fetch('/api/auth/me');
                const data = await response.json();
                if (data.success) setUser(data.user);
                else router.push('/?modal=login');
            } catch (error) {
                console.error("Failed to fetch user:", error);
                router.push('/?modal=login');
            } finally {
                setIsLoading(false);
            }
        }
        fetchUser();
    }, [router]);

    const subtotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

    // --- NEW: Improved validation function ---
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!mobileNumber) newErrors.mobileNumber = "Mobile number is required.";
        if (!streetAddress) newErrors.streetAddress = "Address is required.";
        if (!city) newErrors.city = "City is required.";
        if (!state) newErrors.state = "State is required.";
        if (!zipCode) newErrors.zipCode = "ZIP code is required.";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) {
            toast.error("Please fill in all required shipping fields.");
            return; // Stop if validation fails
        }

        setIsPlacingOrder(true);
        const fullAddress = `${streetAddress}, ${aptSuite ? aptSuite + ', ' : ''}${city}, ${state} ${zipCode}`;

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cartItems.map(item => ({
                        product: item.product._id,
                        quantity: item.quantity,
                        price: item.product.price,
                    })),
                    totalAmount: subtotal,
                    shippingAddress: fullAddress,
                    mobileNumber,
                }),
            });
            if (!response.ok) throw new Error('Failed to place order.');
            toast.success('Order placed successfully!');
            clearCart();
            router.push('/dashboard/shopkeeper/orders');
        } catch (error) {
            console.error(error);
            toast.error('There was an error placing your order.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container mx-auto py-8 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-7">
                        <div className="space-y-8">
                             <div>
                                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                                {isLoading ? <Skeleton className="h-12 w-full" /> : <Input type="email" placeholder="Email" value={user?.email ?? ''} disabled />}
                             </div>

                             <div>
                                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        {isLoading ? <Skeleton className="h-12 w-full" /> : <Input type="text" placeholder="First Name" value={user?.firstName ?? ''} disabled />}
                                        {isLoading ? <Skeleton className="h-12 w-full" /> : <Input type="text" placeholder="Last Name" value={user?.lastName ?? ''} disabled />}
                                    </div>
                                    <div>
                                        <Input type="tel" placeholder="Phone" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
                                        {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
                                    </div>
                                    <div>
                                        <Input type="text" placeholder="Address" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} />
                                        {errors.streetAddress && <p className="text-red-500 text-xs mt-1">{errors.streetAddress}</p>}
                                    </div>
                                    <Input type="text" placeholder="Apartment, suite, etc. (optional)" value={aptSuite} onChange={(e) => setAptSuite(e.target.value)} />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <Input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                                            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                        </div>
                                        <div>
                                            <Input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
                                            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                        </div>
                                        <div>
                                            <Input type="text" placeholder="ZIP code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                                            {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                                        </div>
                                    </div>
                                </div>
                             </div>

                             <div>
                                 <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                                 <div className="border rounded-md p-4">
                                     <p className="font-medium">Cash on Delivery</p>
                                     <p className="text-sm text-muted-foreground">Pay with cash upon receiving your order.</p>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Right Column: Cart Summary */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24 border rounded-lg bg-gray-50 p-6">
                            <h2 className="text-xl font-semibold mb-4 border-b pb-4">Order Summary</h2>
                            <div className="space-y-4 max-h-64 overflow-y-auto">
                                {cartItems.map(item => (
                                    <div key={item.product._id} className="flex justify-between items-center text-sm">
                                        <p>{item.product.name} <span className="text-muted-foreground">x {item.quantity}</span></p>
                                        <p>₹{(item.product.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t mt-4 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <p>Subtotal</p>
                                    <p>₹{subtotal.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <p>Delivery</p>
                                    <p>Free</p>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                                    <p>Estimated Total</p>
                                    <p>₹{subtotal.toFixed(2)}</p>
                                </div>
                            </div>
                            <Button 
                                size="lg" 
                                className="w-full mt-6"
                                onClick={handlePlaceOrder}
                                disabled={isPlacingOrder || cartItems.length === 0}
                            >
                                {isPlacingOrder ? "Placing Order..." : "Place Order"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}