import { ReactNode, Suspense } from "react";
import Navbar from "@/components/organisms/Navbar";
import Footer from "@/components/organisms/Footer";
import WhatsAppFloat from "@/components/organisms/WhatsAppFloat";

interface PublicLayoutProps {
  children: ReactNode;
  showDecor?: boolean;
}

export default function PublicLayout({ children, showDecor = false }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden pt-16">
      <Navbar />
      {/* Decor can be injected via children or directly if decided */}
      <main>
        {children}
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
