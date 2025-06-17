
import type { Metadata } from 'next';
import './globals.css';
import '@/components/core/DotGrid.css'; // Import CSS for DotGrid
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/core/Header';
import Footer from '@/components/core/Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import ClientDotGrid from '@/components/core/ClientDotGrid'; 
import AutoRefresher from '@/components/core/AutoRefresher';
import ClientSplashCursor from '@/components/core/ClientSplashCursor'; // Import the new client component

export const metadata: Metadata = {
  title: 'Reactiverse - Showcase Your Designs',
  description: 'A platform for designers to showcase their React components and designs.',
  viewport: 'width=device-width, initial-scale=1', // Ensure proper viewport scaling
};

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
        <ClientSplashCursor /> {/* Use the new client component */}
        
        <div className="relative z-0 flex flex-col min-h-screen">
          <AuthProvider>
            <AutoRefresher /> 
            <Header />
            <main className="flex-grow container mx-auto px-4 py-6 md:py-8"> {/* Adjusted padding for mobile */}
              {children}
            </main>
            <Footer />
            <Toaster />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
