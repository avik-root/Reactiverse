
import type { Metadata, Viewport } from 'next'; // Added Viewport
import './globals.css';
import '@/components/core/DotGrid.css'; // Import CSS for DotGrid
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/core/Header';
import Footer from '@/components/core/Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import ClientDotGrid from '@/components/core/ClientDotGrid'; 
import AutoRefresher from '@/components/core/AutoRefresher';
import ClientSplashCursor from '@/components/core/ClientSplashCursor';
import React, { Suspense } from 'react'; // Added Suspense
import { Loader2 } from 'lucide-react'; // For Suspense fallback

export const metadata: Metadata = {
  title: 'Reactiverse - Showcase Your Designs',
  description: 'A platform for designers to showcase their React components and designs.',
  // viewport: 'width=device-width, initial-scale=1', // Removed from here
};

export const viewport: Viewport = { // Added new viewport export
  width: 'device-width',
  initialScale: 1,
};

// Simple loading fallback component for Suspense
function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16)-theme(spacing.12))] w-full">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 text-lg text-muted-foreground">Loading Page...</p>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased"> {/* Main body styling */}
        <ClientDotGrid
          dotSize={2} 
          gap={30} 
          baseColor="#B085FF" 
          activeColor="#FF66FF" 
          proximity={120} 
          speedTrigger={80} 
          shockRadius={180} 
          shockStrength={3} 
          maxSpeed={4000} 
          resistance={600} 
          returnDuration={1.2} 
        />
        <ClientSplashCursor />
        
        <div className="relative z-0 flex flex-col min-h-screen">
          <AuthProvider>
            <AutoRefresher /> 
            <Header />
            <main className="flex-grow container mx-auto px-4 py-6 md:py-8">
              <Suspense fallback={<PageLoadingFallback />}>
                {children}
              </Suspense>
            </main>
            <Footer />
            <Toaster />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
