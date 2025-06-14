import Link from 'next/link';
import { Layers3 } from 'lucide-react';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
      <Layers3 size={28} />
      <span className="text-2xl font-headline font-semibold">Reactiverse</span>
    </Link>
  );
};

export default Logo;
