/*
* =================================================================================================
* FILE: src/app/page.tsx
*
* This is the final, polished version of your homepage.
* It features a sophisticated animation and a professional layout with proper spacing.
* =================================================================================================
*/
"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LoginPageComponent } from '@/components/custom/LoginPageComponent';
import { SignupPageComponent } from '@/components/custom/SignupPageComponent';
import { Wheat, Store, Search, Handshake, Truck, Leaf, Fish, Milk } from 'lucide-react';
import Image from 'next/image';

// --- Polished Intro Animation Component ---
function IntroAnimation({ onFinished }: { onFinished: () => void }) {
    const icons = [
        <Wheat key="wheat" className="h-20 w-20 text-green-600" />,
        <Truck key="truck" className="h-20 w-20 text-gray-600" />,
        <Store key="store" className="h-20 w-20 text-orange-600" />,
    ];
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex >= icons.length) {
            const finishTimer = setTimeout(() => onFinished(), 500);
            return () => clearTimeout(finishTimer);
        }

        const timer = setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
        }, 1200); // Each icon shows for 1.2 seconds

        return () => clearTimeout(timer);
    }, [currentIndex, onFinished, icons.length]);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#FBF3E5] z-[100]">
            <div className="relative w-24 h-24 flex items-center justify-center">
                {icons.map((icon, index) => (
                    <div
                        key={index}
                        className={`absolute transition-opacity duration-500 ${index === currentIndex ? 'opacity-100 animate-fade-in-out' : 'opacity-0'}`}
                    >
                        {icon}
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Main Page Content with Professional Spacing ---
function HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const modal = searchParams.get('modal');

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      router.push('/');
    }
  };

  const categories = [
    { name: "Grains & Flours", icon: <Wheat className="h-8 w-8 text-yellow-600"/>, color: "bg-yellow-100" },
    { name: "Spices & Seasonings", icon: <Leaf className="h-8 w-8 text-red-600"/>, color: "bg-red-100" },
    { name: "Dairy & Cheeses", icon: <Milk className="h-8 w-8 text-blue-600"/>, color: "bg-blue-100" },
    { name: "Meat & Seafood", icon: <Fish className="h-8 w-8 text-cyan-600"/>, color: "bg-cyan-100" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="navigationbar sticky top-2 z-40 w-full border rounded-lg  bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* FIX: Added `mx-auto` to center the container */}
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-lg">
                <div>
                    <Image src="/FinalLogo-withoutBG.png" className="max-h-16" alt="Thelo" width={64} height={64} />
                </div>
            </span>
          </Link>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/?modal=login">Login</Link>
            </Button>
            <Button className="bg-[#BEA093] hover:bg-[#FBF3E5] hover:text-[#BEA093]" asChild>
              <Link href="/?modal=signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-[url(/FinalLogo-withoutBG.png)] bg-cover bg-center">
      <section className="py-20 md:py-32 bg-[#FBF3E5]/95">
          {/* FIX: Added `mx-auto` to center the container */}
          <div className="container mx-auto text-center px-4 md:px-6">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-gray-900">
                  Directly from the Source.
              </h1>
              <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-[#BEA093] mt-2">
                  Delivered to Your Door.
              </h2>
              <p className="mt-8 max-w-3xl mx-auto text-lg md:text-xl text-gray-600">
                  The definitive B2B marketplace for India&apos;s finest raw food materials. We bridge the gap between producers and businesses, ensuring quality, transparency, and growth.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <Button size="lg" className="h-12 px-8 text-base bg-[#BEA093] hover:bg-[#FBF3E5] hover:text-[#BEA093]" asChild>
                      <Link href="/?modal=signup">Become a Seller</Link>
                  </Button>
                   <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                      <Link href="/dashboard/shopkeeper">Browse Marketplace</Link>
                  </Button>
              </div>
          </div>
      </section>
      </div>

      {/* Featured Categories Section */}
      <section className="py-20 md:py-28 bg-[#FDFBF4] ">
        {/* FIX: Added `mx-auto` to center the container */}
        <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold tracking-tight">Explore Our Categories</h2>
                <p className="mt-3 text-lg text-muted-foreground">Find exactly what you need from our wide range of raw materials.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {categories.map((cat) => (
                    <div key={cat.name} className="p-6 rounded-xl border bg-card text-card-foreground text-center hover:shadow-lg transition-shadow">
                        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${cat.color} mb-5`}>
                            {cat.icon}
                        </div>
                        <h3 className="text-xl font-semibold">{cat.name}</h3>
                    </div>
                ))}
            </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 md:py-28 bg-[#FBF3E5]">
          {/* FIX: Added `mx-auto` to center the container */}
          <div className="container mx-auto px-4 md:px-6 text-center">
              <h2 className="text-4xl font-bold tracking-tight">A Simple, Transparent Process</h2>
              <p className="mt-3 text-lg text-muted-foreground">Connecting buyers and sellers in just 3 easy steps.</p>
              <div className="mt-20 relative grid md:grid-cols-3 gap-y-16 md:gap-x-16">
                  {/* Dotted line for desktop */}
                  <div className="hidden md:block absolute top-1/3 left-0 w-full h-px -translate-y-8">
                      <svg width="100%" height="100%"><line x1="0" y1="50%" x2="100%" y2="50%" strokeWidth="2" strokeDasharray="8 8" className="stroke-gray-300"></line></svg>
                  </div>
                  <div className="relative flex flex-col items-center">
                      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-green-100 text-green-600 mb-6 border-4 border-background"><Wheat className="h-10 w-10"/></div>
                      <h3 className="text-2xl font-semibold">1. Sellers List Products</h3>
                      <p className="mt-3 text-muted-foreground max-w-xs">Sellers showcase their raw materials, complete with details, pricing, and quality standards.</p>
                  </div>
                  <div className="relative flex flex-col items-center">
                      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 text-blue-600 mb-6 border-4 border-background"><Search className="h-10 w-10"/></div>
                      <h3 className="text-2xl font-semibold">2. Shopkeepers Discover</h3>
                      <p className="mt-3 text-muted-foreground max-w-xs">Shopkeepers easily search, filter, and find the exact ingredients they need for their business.</p>
                  </div>
                  <div className="relative flex flex-col items-center">
                      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-orange-100 text-orange-600 mb-6 border-4 border-background"><Handshake className="h-10 w-10"/></div>
                      <h3 className="text-2xl font-semibold">3. Goods are Transacted</h3>
                      <p className="mt-3 text-muted-foreground max-w-xs">Secure orders are placed, payments are processed, and goods are delivered efficiently.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#BEA093] text-gray-400">
          {/* FIX: Added `mx-auto` to center the container */}
          <div className="container mx-auto px-4 md:px-6 text-center text-white">
              <p>&copy; 2025 Thelo. A new era of B2B trade in India.</p>
          </div>
      </footer>

      {/* Modals */}
      <Dialog open={modal === 'login'} onOpenChange={handleOpenChange}><DialogContent><LoginPageComponent /></DialogContent></Dialog>
      <Dialog open={modal === 'signup'} onOpenChange={handleOpenChange}><DialogContent><SignupPageComponent /></DialogContent></Dialog>
    </div>
  );
}

// --- Main App Component with Animation Logic ---
export default function Home() {
    const [showAnimation, setShowAnimation] = useState(true);

    useEffect(() => {
        const hasSeenAnimation = sessionStorage.getItem('hasSeenIntroV2');
        if (hasSeenAnimation) {
            setShowAnimation(false);
        } else {
            sessionStorage.setItem('hasSeenIntroV2', 'true');
        }
    }, []);

    const onAnimationFinish = () => {
        setShowAnimation(false);
    };

    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            {showAnimation && <IntroAnimation onFinished={onAnimationFinish} />}
            <div className={`transition-opacity duration-500 ${showAnimation ? 'opacity-0' : 'opacity-100'}`}>
                <HomePageContent />
            </div>
        </Suspense>
    )
}