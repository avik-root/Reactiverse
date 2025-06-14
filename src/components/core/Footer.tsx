import Link from 'next/link';
import { Flame, Linkedin, Github, Mail } from 'lucide-react';

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
    <footer className="bg-[hsl(var(--footer-background))] text-[hsl(var(--footer-foreground))]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* MintFire Info */}
          <div className="md:col-span-12 lg:col-span-5">
            <Link href="/" className="flex items-center gap-2 mb-3 text-[hsl(var(--footer-foreground))] hover:opacity-80 transition-opacity">
              <Flame size={28} />
              <span className="text-2xl font-headline font-semibold">MintFire</span>
            </Link>
            <p className="text-sm text-[hsl(var(--footer-muted-foreground))] mb-6 max-w-xs">
              Pioneering the Future of Technology.
            </p>
            <div className="flex space-x-4">
              <Link href="#" aria-label="LinkedIn" className="text-[hsl(var(--footer-muted-foreground))] hover:text-[hsl(var(--footer-foreground))] transition-colors">
                <Linkedin size={20} />
              </Link>
              <Link href="#" aria-label="GitHub" className="text-[hsl(var(--footer-muted-foreground))] hover:text-[hsl(var(--footer-foreground))] transition-colors">
                <Github size={20} />
              </Link>
              <Link href="mailto:info@mintfire.com" aria-label="Email" className="text-[hsl(var(--footer-muted-foreground))] hover:text-[hsl(var(--footer-foreground))] transition-colors">
                <Mail size={20} />
              </Link>
            </div>
          </div>

          {/* Spacer on large screens */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Services Links */}
          <div className="md:col-span-6 lg:col-span-3">
            <h3 className="font-semibold text-base mb-4 text-[hsl(var(--footer-foreground))]">Services</h3>
            <ul className="space-y-2">
              <FooterLink href="#">Cyber Security</FooterLink>
              <FooterLink href="#">Blockchain</FooterLink>
              <FooterLink href="#">Artificial Intelligence</FooterLink>
              <FooterLink href="#">IoT Devices</FooterLink>
              <FooterLink href="#">Industrial Software</FooterLink>
              <FooterLink href="#">Software Solutions</FooterLink>
            </ul>
          </div>

          {/* Company Links */}
          <div className="md:col-span-6 lg:col-span-3">
            <h3 className="font-semibold text-base mb-4 text-[hsl(var(--footer-foreground))]">Company</h3>
            <ul className="space-y-2">
              <FooterLink href="#">About Us</FooterLink>
              <FooterLink href="#">Blog</FooterLink>
              <FooterLink href="#">Careers</FooterLink>
              <FooterLink href="#">Contact</FooterLink>
              <FooterLink href="/admin/login">Admin Login</FooterLink>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-[hsl(var(--footer-border))]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-sm text-[hsl(var(--footer-muted-foreground))]">
            &copy; {currentYear} MintFire. All Rights Reserved.
          </p>
          <p className="text-xs text-[hsl(var(--footer-muted-foreground))] mt-1">
            Reactiverse is a product of MintFire.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
