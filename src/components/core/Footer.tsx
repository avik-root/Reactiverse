
import Link from 'next/link';
import { Linkedin, Github, Mail } from 'lucide-react';
import Logo from './Logo'; // Import the Logo component

const FooterLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <li>
    <Link href={href} className="text-sm text-[hsl(var(--footer-muted-foreground))] hover:text-[hsl(var(--footer-foreground))] transition-colors">
      {children}
    </Link>
  </li>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[hsla(var(--footer-background),0.75)] backdrop-blur-md text-[hsl(var(--footer-foreground))]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Reactiverse Info */}
          <div className="md:col-span-12 lg:col-span-5">
            <div className="mb-3"> {/* Wrapper for Logo for styling consistency if needed */}
              <Logo />
            </div>
            <p className="text-sm text-[hsl(var(--footer-muted-foreground))] mb-6 max-w-xs">
              A platform for designers to showcase their components and designs.
            </p>
            <div className="flex space-x-4">
              <Link href="https://www.linkedin.com/in/avik-samanta-root/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-[hsl(var(--footer-muted-foreground))] hover:text-[hsl(var(--footer-foreground))] transition-colors">
                <Linkedin size={20} />
              </Link>
              <Link href="https://github.com/avik-root" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-[hsl(var(--footer-muted-foreground))] hover:text-[hsl(var(--footer-foreground))] transition-colors">
                <Github size={20} />
              </Link>
              <Link href="mailto:mintfire.official@gmail.com" aria-label="Email" className="text-[hsl(var(--footer-muted-foreground))] hover:text-[hsl(var(--footer-foreground))] transition-colors">
                <Mail size={20} />
              </Link>
            </div>
          </div>

          {/* Spacer on large screens */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Discover Links */}
          <div className="md:col-span-6 lg:col-span-3">
            <h3 className="font-semibold text-base mb-4 text-[hsl(var(--footer-foreground))]">Discover</h3>
            <ul className="space-y-2">
              <FooterLink href="/">Browse Designs</FooterLink>
              <FooterLink href="/dashboard/designs/submit">Submit Your Design</FooterLink>
              <FooterLink href="/designers">Top Designers</FooterLink>
              <FooterLink href="/guidelines">Design Guidelines</FooterLink>
            </ul>
          </div>

          {/* Connect Links */}
          <div className="md:col-span-6 lg:col-span-3">
            <h3 className="font-semibold text-base mb-4 text-[hsl(var(--footer-foreground))]">Connect</h3>
            <ul className="space-y-2">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/community">Community Forum</FooterLink>
              <FooterLink href="/support">Contact Support</FooterLink>
              <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
              <FooterLink href="/admin">Admin Access</FooterLink>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-[hsl(var(--footer-border))]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-sm text-[hsl(var(--footer-muted-foreground))]">
            &copy; {currentYear} Reactiverse. MintFire Tech
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

