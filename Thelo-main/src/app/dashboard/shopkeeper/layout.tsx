/*
* =================================================================================================
* FILE: src/app/dashboard/shopkeeper/layout.tsx
*
* ACTION: Replace the code in this file.
* The incorrect import for './globals.css' has been removed.
* =================================================================================================
*/
import { Navbar } from '@/components/custom/Navbar';

export default function ShopkeeperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}