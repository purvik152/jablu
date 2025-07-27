/*
* =================================================================================================
* FILE: src/app/dashboard/seller/layout.tsx
*
* This layout wraps all pages inside the /seller route.
* It ensures the SellerNavbar is always present.
* =================================================================================================
*/
import { SellerNavbar } from "@/components/custom/SellerNavbar";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // FIX: Removed `items-center` to allow children to expand to full width.
    <div className="min-h-screen flex flex-col items-center  bg-muted/40">
      
        <SellerNavbar />
      
      {/* FIX: Added `w-full` and `flex-grow` to the main element. */}
      <main className="w-full flex-grow max-w-7xl">
        {children}
      </main>
    </div>
  );
}