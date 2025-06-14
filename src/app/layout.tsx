
import type { Metadata } from 'next';
import './globals.css';
import '@/components/core/DotGrid.css'; // Import CSS for DotGrid
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/core/Header';
import Footer from '@/components/core/Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import ClientDotGrid from '@/components/core/ClientDotGrid'; // Import the new client component

export const metadata: Metadata = {
  title: 'Reactiverse - Showcase Your Designs',
  description: 'A platform for designers to showcase their React components and designs.',
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
          dotSize={2} // Size of each dot
          gap={30} // Spacing between dots
          baseColor="#B085FF" // Dark theme primary: hsl(271, 100%, 75.3%)
          activeColor="#FF66FF" // Dark theme accent: hsl(300, 100%, 70%)
          proximity={120} // How close mouse needs to be to affect dots
          speedTrigger={80} // Mouse speed to trigger inertia effect
          shockRadius={180} // Radius of click shockwave
          shockStrength={3} // Strength of click shockwave
          maxSpeed={4000} // Max speed for inertia calculation
          resistance={600} // Resistance for inertia movement
          returnDuration={1.2} // How quickly dots return to original position
        />
        {/* Main content wrapper with z-index to be above the DotGrid */}
        <div className="relative z-0 flex flex-col min-h-screen">
          <AuthProvider>
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
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
