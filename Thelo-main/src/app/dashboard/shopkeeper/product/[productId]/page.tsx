import Image from 'next/image';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import SellerProfile from '@/models/SellerProfile';
import { notFound } from 'next/navigation';
import { ProductActions } from '@/components/custom/ProductActions';

// This function runs on the server to get clean, serializable data
async function getProductById(productId: string) {
  await dbConnect();
  try {
    const product = await Product.findById(productId).populate({
      path: 'seller',
      model: SellerProfile,
      select: 'brandName'
    });
    if (!product) return null;
    // This line is important to prevent data serialization errors
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

// This is the main Server Component for the page
export default async function ProductDetailPage({ params }: { params: { productId: string } }) {
  const product = await getProductById(params.productId);

  if (!product) {
    notFound();
    return null; // Add fallback return for type safety
  }

  return (
    <main className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Column */}
        <div>
          <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={product.imageUrl || 'https://placehold.co/600x600/e2e8f0/475569?text=No+Image'}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Details Column */}
        <div className="flex flex-col space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">{product.name}</h1>
          <p className="text-lg text-muted-foreground">
            Sold by <span className="text-primary font-semibold">{product.seller.brandName}</span>
          </p>
          <div className="py-4">
              <p className="text-lg leading-relaxed">{product.description}</p>
          </div>
          <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-md">
                  <div>
                      <p className="font-semibold">Price</p>
                      <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
                  </div>
                   <div>
                      <p className="font-semibold">Category</p>
                      <p>{product.category}</p>
                  </div>
                  <div>
                      <p className="font-semibold">Quantity Available</p>
                      <p>{product.stock} units</p>
                  </div>
                  <div>
                      <p className="font-semibold">Location</p>
                      <p>{product.location}</p>
                  </div>
              </div>
          </div>
          
          {/* This passes the clean product data to the interactive Client Component */}
          <ProductActions product={product} />
        </div>
      </div>
    </main>
  );
}