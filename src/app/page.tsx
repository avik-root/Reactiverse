
'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Design } from '@/lib/types';
import DesignCard from '@/components/design/DesignCard';
import DesignDetailDialog from '@/components/design/DesignDetailDialog';
import { getAllDesignsAction } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import ScrambledText from '@/components/effects/ScrambledText';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card'; 
import { Search, ListFilter, Palette, Loader2, Sparkles, Wand2, MousePointerClick, ToggleLeft, CheckSquare, Navigation, CreditCard, LayoutGrid, XCircle } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type SortOption = 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'title-asc' | 'title-desc';

const popularCategories = [
  { name: "Hover Effects", icon: MousePointerClick, hint: "interactive animation" },
  { name: "Loading UI", icon: Loader2, hint: "progress indicator" },
  { name: "Glowing Effect", icon: Sparkles, hint: "neon shine" },
  { name: "Animated Backgrounds", icon: Wand2, hint: "dynamic backdrop" },
  { name: "Buttons", icon: Palette, hint: "cta interactive" },
  { name: "Forms", icon: CheckSquare, hint: "input fields" },
  { name: "Navigation", icon: Navigation, hint: "menu sidebar" },
  { name: "Cards", icon: LayoutGrid, hint: "content display" },
  { name: "Toggles & Switches", icon: ToggleLeft, hint: "interactive control" },
  { name: "Interactive Elements", icon: CreditCard, hint: "user interaction" },
];


export default function HomePage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const designerIdParam = searchParams.get('designerId');

  useEffect(() => {
    async function fetchDesigns() {
      setIsLoading(true);
      try {
        const fetchedDesigns = await getAllDesignsAction();
        setDesigns(fetchedDesigns);
      } catch (error) {
        console.error("Failed to fetch designs:", error);
      }
      setIsLoading(false);
    }
    fetchDesigns();
  }, []);

  const handleOpenDetail = (design: Design) => {
    setSelectedDesign(design);
    setIsDialogOpen(true);
  };

  const filteredAndSortedDesigns = useMemo(() => {
    let result = [...designs];

    if (designerIdParam) {
      result = result.filter(design => design.submittedByUserId === designerIdParam);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(design =>
        design.title.toLowerCase().includes(lowerSearchTerm) ||
        design.description.toLowerCase().includes(lowerSearchTerm) ||
        design.filterCategory.toLowerCase().includes(lowerSearchTerm) ||
        (!designerIdParam && design.designer.name.toLowerCase().includes(lowerSearchTerm)) ||
        design.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
      );
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'oldest':
        result.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case 'price-asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'title-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
    return result;
  }, [designs, searchTerm, sortBy, designerIdParam]);

  const featuredDesigns = useMemo(() => {
    if (isLoading || designerIdParam) return []; // Don't show featured if filtering by designer
    return [...designs].sort((a,b) => b.id.localeCompare(a.id)).slice(0, 3);
  }, [designs, isLoading, designerIdParam]);

  const pageSubTitle = useMemo(() => {
    if (designerIdParam) {
      const designer = designs.find(d => d.submittedByUserId === designerIdParam)?.designer;
      if (designer) {
        return `Browsing designs by ${designer.name}`;
      }
      return `Browsing designs by selected designer`;
    }
    return "Discover amazing components and designs shared by our talented community. Dive in and get inspired!";
  }, [designerIdParam, designs]);
  
  const allDesignsSectionTitle = useMemo(() => {
    if (designerIdParam) {
      const designer = designs.find(d => d.submittedByUserId === designerIdParam)?.designer;
      return designer ? `Designs by ${designer.name}` : `Designs by Selected Designer`;
    }
    return "All Designs";
  }, [designerIdParam, designs]);

  const noDesignsMessage = useMemo(() => {
    if (designerIdParam) {
      const designerName = designs.find(d => d.submittedByUserId === designerIdParam)?.designer.name;
      if (searchTerm) {
        return designerName ? `No designs by ${designerName} match your search "${searchTerm}".` : `No designs by this designer match your search "${searchTerm}".`;
      }
      return designerName ? `No designs found for ${designerName}. Consider submitting one!` : 'No designs found for this designer.';
    }
    if (searchTerm) {
      return "No designs match your search criteria.";
    }
    return "No designs available at the moment. Check back soon!";
  }, [designerIdParam, searchTerm, designs]);

  const clearDesignerFilter = () => {
    router.push('/#all-designs-section'); // Navigate to homepage root, effectively clearing query params
  };

  return (
    <div className="space-y-12">
      <section className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">
          Welcome to Reactiverse
        </h1>
        <ScrambledText className="text-lg md:text-xl text-muted-foreground mx-auto whitespace-nowrap">
          {pageSubTitle}
        </ScrambledText>
      </section>

      {!designerIdParam && (
        <>
          <section>
            <h2 className="text-3xl font-semibold font-headline mb-6 text-center">Featured Designs</h2>
            {isLoading && featuredDesigns.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2 p-4 border rounded-lg bg-card">
                    <Skeleton className="h-[150px] w-full rounded-lg bg-muted/50" />
                    <Skeleton className="h-6 w-3/4 rounded-md" />
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                    <Skeleton className="h-8 w-1/3 rounded-md mt-2" />
                  </div>
                ))}
              </div>
            ) : featuredDesigns.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredDesigns.map((design) => (
                  <DesignCard key={design.id} design={design} onOpenDetail={handleOpenDetail} />
                ))}
              </div>
            ) : (
              !isLoading && <p className="text-center text-muted-foreground py-10">No featured designs available at the moment.</p>
            )}
          </section>

          <section className="space-y-6 pt-8">
            <h2 className="text-3xl font-semibold font-headline text-center">Explore Popular Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {popularCategories.map((category) => (
                <Card
                  key={category.name}
                  className="aspect-square flex flex-col items-center justify-center p-4 text-center hover:shadow-lg transition-shadow duration-300 ease-in-out cursor-pointer bg-card hover:bg-muted/50 rounded-lg"
                  onClick={() => {
                    setSearchTerm(category.name);
                    document.querySelector('#all-designs-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSearchTerm(category.name); document.querySelector('#all-designs-section')?.scrollIntoView({ behavior: 'smooth' }); }}}
                  aria-label={`Filter by ${category.name}`}
                >
                  <category.icon className="h-10 w-10 mb-3 text-primary" strokeWidth={1.5}/>
                  <p className="text-sm font-medium text-foreground">{category.name}</p>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="space-y-6 pt-8" id="all-designs-section">
        <div className="text-center">
            <h2 className="text-3xl font-semibold font-headline mb-2">{allDesignsSectionTitle}</h2>
            {designerIdParam && (
                <Button variant="link" onClick={clearDesignerFilter} className="text-accent hover:text-accent/80 text-sm">
                    <XCircle className="mr-1.5 h-4 w-4" /> Clear filter and view all designs
                </Button>
            )}
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search designs by title, description, tags..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-full md:w-[200px]">
              <ListFilter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="title-asc">Title: A-Z</SelectItem>
              <SelectItem value="title-desc">Title: Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2 p-4 border rounded-lg bg-card">
                <Skeleton className="h-[150px] w-full rounded-lg bg-muted/50" />
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
                <Skeleton className="h-8 w-1/3 rounded-md mt-2" />
              </div>
            ))}
          </div>
        ) : filteredAndSortedDesigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedDesigns.map((design) => (
              <DesignCard key={design.id} design={design} onOpenDetail={handleOpenDetail} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">
            {noDesignsMessage}
          </p>
        )}
      </section>


      {selectedDesign && (
        <DesignDetailDialog
          design={selectedDesign}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </div>
  );
}

