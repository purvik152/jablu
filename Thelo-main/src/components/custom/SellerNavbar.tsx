"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, LogOut, ShoppingBag } from 'lucide-react';
import { NotificationBell } from './NotificationBell'; // 1. ADD this import at the top

export function SellerNavbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout');
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard/seller" className="mr-6 flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Thelo Seller</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/dashboard/seller" className="transition-colors hover:text-foreground/80 text-foreground">
              My Products
            </Link>
            <Link href="/dashboard/seller/orders" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Orders Received
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* 2. ADD the NotificationBell component here, with the 'seller' role */}
          <NotificationBell role="seller" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">User Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/seller/profile')}>Profile</DropdownMenuItem>
              <DropdownMenuItem>Analytics</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}