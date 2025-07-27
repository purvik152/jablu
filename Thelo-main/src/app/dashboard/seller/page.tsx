"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Loader2, MoreHorizontal, Trash2, Pencil } from 'lucide-react';
import Image from 'next/image';
import { IProduct } from '@/models/Product';

// --- Helper function to convert a file to a Base64 string ---
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

function FormMessage({ type, message }: { type: 'error' | 'success', message: string }) { if (!message) return null; const color = type === 'error' ? 'text-red-600' : 'text-green-600'; return <p className={`text-sm font-medium ${color}`}>{message}</p>; }
function CreateProfileView({ onProfileCreated }: { onProfileCreated: () => void }) { const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setLoading(true); setError(""); const formData = new FormData(event.currentTarget); const profileData = { brandName: formData.get("brandName") as string, businessAddress: formData.get("businessAddress") as string, gstNumber: formData.get("gstNumber") as string }; try { const response = await fetch('/api/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profileData) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || "Failed to create profile."); onProfileCreated(); } catch (err: unknown) { if (err instanceof Error) { setError(err.message); } } finally { setLoading(false); } }; return (<div className="w-full max-w-2xl mx-auto py-12"><Card><CardHeader><CardTitle>Create Your Seller Profile</CardTitle><CardDescription>This information is required before you can add products.</CardDescription></CardHeader><CardContent><form onSubmit={handleSubmit}><div className="grid gap-4"><div className="grid gap-2"><Label htmlFor="brandName">Brand Name</Label><Input id="brandName" name="brandName" placeholder="e.g., Acme Fresh Goods" className="bg-[#FDFBF4]" required /></div><div className="grid gap-2"><Label htmlFor="businessAddress">Business Address</Label><Input id="businessAddress" name="businessAddress" placeholder="123 Business Rd, Business City" className="bg-[#FDFBF4]" required /></div><div className="grid gap-2"><Label htmlFor="gstNumber">GST Number (Optional)</Label><Input id="gstNumber" name="gstNumber" placeholder="22AAAAA0000A1Z5" className="bg-[#FDFBF4]"/></div>{error && <FormMessage type="error" message={error} />}<Button type="submit" className="w-full bg-[#BEA093] hover:bg-[#FBF3E5] hover:text-[#BEA093]" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Profile'}</Button></div></form></CardContent></Card></div>); }

function ManageProductsView() {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<IProduct | null>(null);
    const [productToDelete, setProductToDelete] = useState<IProduct | null>(null);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchMyProducts = useCallback(async () => { setIsLoadingProducts(true); try { const response = await fetch('/api/products/my-products'); const data = await response.json(); if (!response.ok) throw new Error(data.message || "Failed to fetch products."); setProducts(data.products); } catch (err: unknown) { if (err instanceof Error) { console.error(err.message); } setProducts([]); } finally { setIsLoadingProducts(false); } }, []);
    useEffect(() => { fetchMyProducts(); }, [fetchMyProducts]);

    const handleOpenForm = (product: IProduct | null) => { setProductToEdit(product); setError(''); setIsFormOpen(true); };
    const handleOpenAlert = (product: IProduct) => { setProductToDelete(product); setIsAlertOpen(true); };

    const handleSaveProduct = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); setError(''); setIsSaving(true);
        const form = event.currentTarget;
        const formData = new FormData(form);
        const imageFile = formData.get('image') as File;
        let imageUrl = productToEdit?.imageUrl || '';

        if (imageFile && imageFile.size > 0) {
            try { imageUrl = await toBase64(imageFile); } catch (err: unknown) { if (err instanceof Error) { setError(`Image Error: ${err.message}`); } setIsSaving(false); return; }
        }

        const productData = { name: formData.get('name') as string, description: formData.get('description') as string, price: Number(formData.get('price')), stock: Number(formData.get('stock')), status: formData.get('status') as string, category: formData.get('category') as string, location: formData.get('location') as string, imageUrl };
        const isEditing = !!productToEdit;
        const url = isEditing ? `/api/products/${productToEdit?._id}` : '/api/products';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || `Failed to ${isEditing ? 'update' : 'add'} product.`);
            setIsFormOpen(false); setProductToEdit(null); form.reset(); fetchMyProducts();
        } catch (err: unknown) { if (err instanceof Error) { setError(err.message); } } finally { setIsSaving(false); }
    };

    const handleDeleteProduct = async () => { if (!productToDelete) return; try { const response = await fetch(`/api/products/${productToDelete._id}`, { method: 'DELETE' }); const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Failed to delete product.'); fetchMyProducts(); } catch (err: unknown) { if (err instanceof Error) { console.error(err); } } };

    const renderProductContent = () => {
        if (isLoadingProducts) {
            return <div className="text-center h-24 flex items-center justify-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></div>;
        }

        if (products.length === 0) {
            return <div className="text-center h-24 flex items-center justify-center">You haven't added any products yet.</div>;
        }

        return (
            <>
                {/* Table view for medium screens and up (md:) */}
                <div className="hidden md:block rounded-lg border bg-card">
                    <Table>
                        <TableHeader><TableRow><TableHead className="w-[80px] bg-[#BEA093] border rounded-tl-lg">Image</TableHead><TableHead className="bg-[#BEA093] border">Product Name</TableHead><TableHead className="bg-[#BEA093] border">Status</TableHead><TableHead className="text-right bg-[#BEA093] border">Price</TableHead><TableHead className="text-right bg-[#BEA093] border">Stock</TableHead><TableHead className="w-[50px] bg-[#BEA093] border rounded-tr-lg">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product._id}>
                                    <TableCell><div className="relative h-16 w-16 rounded-md overflow-hidden"><Image src={product.imageUrl || 'https://placehold.co/64x64/eee/ccc?text=No+Image'} alt={product.name} fill className="object-cover"/></div></TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell><span className={`px-2 py-1 text-xs font-medium rounded-full ${product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{product.status}</span></TableCell>
                                    <TableCell className="text-right">₹{product.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">{product.stock}</TableCell>
                                    <TableCell>
                                        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-[#FBF3E5]">
                                                <DropdownMenuLabel className="bg-[#BEA093] rounded-t-md">Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleOpenForm(product)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleOpenAlert(product)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Card grid for small screens (hidden on md:) */}
                <div className="grid grid-cols-1 sm :grid-cols-2 gap-4 md:hidden">
                    {products.map((product) => (
                        <Card key={product._id}>
                            <CardContent className="p-4 flex flex-col justify-between h-full">
                                <div className="flex gap-4">
                                    <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden">
                                        <Image src={product.imageUrl || 'https://placehold.co/80x80/eee/ccc?text=No+Image'} alt={product.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold leading-tight">{product.name}</h3>
                                            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0 -mt-2"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleOpenForm(product)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleOpenAlert(product)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{product.status}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-4 pt-2 border-t">
                                    <div className="text-sm">
                                        <span className="font-semibold">Price: </span>₹{product.price.toFixed(2)}
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-semibold">Stock: </span>{product.stock}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </>
        );
    };

    return (
        <>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                <div><h1 className="text-3xl font-bold">My Products</h1><p className="text-muted-foreground">Manage your inventory and view product status.</p></div>
                <Button onClick={() => handleOpenForm(null)} className="bg-[#BEA093] hover:bg-[#FBF3E5] hover:text-[#BEA093]"><PlusCircle className="mr-2 h-4 w-4" />Add New Product</Button>
            </div>
            
            {renderProductContent()}

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-lg bg-[#FBF3E5]">
                    <DialogHeader><DialogTitle>{productToEdit ? 'Edit Product' : 'Add a New Product'}</DialogTitle><DialogDescription>Fill in the details below. Click save when you're done.</DialogDescription></DialogHeader>
                    <form onSubmit={handleSaveProduct}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2"><Label htmlFor="name" className="sm:text-right">Name</Label><Input id="name" name="name" defaultValue={productToEdit?.name} className="sm:col-span-3 bg-[#FDFBF4]" required /></div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2"><Label htmlFor="description" className="sm:text-right">Description</Label><Textarea id="description" name="description" defaultValue={productToEdit?.description} className="sm:col-span-3 bg-[#FDFBF4]" required /></div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2"><Label htmlFor="category" className="sm:text-right">Category</Label><Input id="category" name="category" defaultValue={productToEdit?.category} className="sm:col-span-3 bg-[#FDFBF4]" placeholder="e.g., Grains, Spices" required /></div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2"><Label htmlFor="price" className="sm:text-right">Price (₹)</Label><Input id="price" name="price" type="number" defaultValue={productToEdit?.price} className="sm:col-span-3 bg-[#FDFBF4]" required /></div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2"><Label htmlFor="stock" className="sm:text-right">Stock</Label><Input id="stock" name="stock" type="number" defaultValue={productToEdit?.stock} className="sm:col-span-3 bg-[#FDFBF4]" required /></div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2"><Label htmlFor="location" className="sm:text-right">Location</Label><Input id="location" name="location" defaultValue={productToEdit?.location} className="sm:col-span-3 bg-[#FDFBF4]" placeholder="e.g., Nashik, Maharashtra" required /></div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2"><Label htmlFor="status" className="sm:text-right">Status</Label><select id="status" name="status" defaultValue={productToEdit?.status || 'Active'} className="sm:col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"><option value="Active" className="bg-[#FBF3E5]">Active</option><option value="Archived" className="bg-[#FBF3E5]">Archived</option></select></div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-x-4 gap-y-2"><Label htmlFor="image" className="sm:text-right">Image</Label><Input id="image" name="image" type="file" className="sm:col-span-3 bg-[#FDFBF4]" accept="image/*" /></div>
                        </div>
                        {error && <p className="text-sm text-red-600 mb-4 text-center">{error}</p>}
                        <DialogFooter><Button type="submit" disabled={isSaving} className="bg-[#BEA093] hover:bg-[#FBF3E5] hover:text-[#BEA093]">{isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}><AlertDialogContent className="bg-[#FBF3E5]"><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the product "{productToDelete?.name}".</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
        </>
    );
}

export default function SellerDashboard() {
    const [profileExists, setProfileExists] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const checkProfile = useCallback(async () => { setIsLoading(true); try { const response = await fetch('/api/profiles'); if (response.ok) { setProfileExists(true); } else { setProfileExists(false); } } catch (error) { console.error("Failed to check profile", error); setProfileExists(false); } finally { setIsLoading(false); } }, []);
    useEffect(() => { checkProfile(); }, [checkProfile]);
    if (isLoading) { return (<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>); }
    
    return (
        <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
            {profileExists ? <ManageProductsView /> : <CreateProfileView onProfileCreated={checkProfile} />}
        </div>
    );
}