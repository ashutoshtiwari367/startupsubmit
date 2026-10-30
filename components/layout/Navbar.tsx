// components/layout/Navbar.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown,
  CornerDownLeft,
  Menu,
  Plus,
  Rocket,
  Search,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import { cn } from 'cn';
import { categories, categoryHref, siteConfig } from '@/lib/site-config';
import { buttonVariants } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const currentYear = 2026;

  // Keyed by pathname so menus close automatically when navigating without useEffect setState.
  const [openMenuPath, setOpenMenuPath] = useState<{ mobile?: string; cat?: string }>({});
  const mobileOpen = openMenuPath.mobile === pathname;
  const catOpen = openMenuPath.cat === pathname;

  const setMobileOpen = (next: boolean) =>
    setOpenMenuPath((prev) => ({ ...prev, mobile: next ? pathname : undefined }));
  const setCatOpen = (next: boolean) =>
    setOpenMenuPath((prev) => ({ ...prev, cat: next ? pathname : undefined }));

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const catRef = useRef<HTMLDivElement>(null);

  // Outside click / Escape for category dropdown
  useEffect(() => {
    if (!catOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setOpenMenuPath((prev) => ({ ...prev, cat: undefined }));
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenuPath((prev) => ({ ...prev, cat: undefined }));
      }
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [catOpen]);

  // Cmd/Ctrl + K opens search modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setSearchOpen(false);
    router.push(q ? `/directory?q=${encodeURIComponent(q)}` : '/directory');
  };

  const navLinkClass = (active: boolean) =>
    cn(
      'inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors duration-150',
      active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-2.5 rounded-lg py-1 pr-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs transition-transform duration-150 group-hover:scale-105">
            <Rocket className="size-4" aria-hidden="true" />
          </span>
          <span className="text-[0.95rem] font-bold tracking-tight text-foreground">
            {siteConfig.name}
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          <Link href="/" className={navLinkClass(pathname === '/')}>
            Launches
          </Link>
          <Link href="/directory" className={navLinkClass(pathname === '/directory')}>
            Products
          </Link>

          {/* Categories dropdown */}
          <div ref={catRef} className="relative">
            <button
              type="button"
              aria-expanded={catOpen}
              aria-haspopup="menu"
              onClick={() => setCatOpen(!catOpen)}
              className={navLinkClass(pathname.startsWith('/category'))}
            >
              <span>Categories</span>
              <ChevronDown
                aria-hidden="true"
                className={cn('size-3.5 transition-transform duration-150', catOpen && 'rotate-180')}
              />
            </button>

            {catOpen && (
              <div
                role="menu"
                aria-label="Categories"
                className="animate-fade-in absolute top-full left-0 mt-2 w-72 rounded-xl border border-border bg-popover p-2 shadow-lg"
              >
                <div className="grid grid-cols-1 gap-0.5">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      role="menuitem"
                      href={categoryHref(cat.slug)}
                      onClick={() => setCatOpen(false)}
                      className="flex flex-col rounded-lg px-3 py-2 transition-colors hover:bg-muted"
                    >
                      <span className="text-sm font-medium text-foreground">{cat.name}</span>
                      <span className="text-xs text-muted-foreground">{cat.description}</span>
                    </Link>
                  ))}
                </div>
                <div className="mt-1 border-t border-border pt-1">
                  <Link
                    role="menuitem"
                    href="/directory"
                    onClick={() => setCatOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-primary hover:bg-primary-soft/60"
                  >
                    <span>Browse full directory</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/best" className={navLinkClass(pathname === '/best')}>
            <Trophy className="size-3.5 text-gold" aria-hidden="true" />
            <span>Best of {currentYear}</span>
          </Link>
          <Link href="/pricing" className={navLinkClass(pathname === '/pricing')}>
            Pricing
          </Link>
          <a
            href="/llms.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 inline-flex h-7 items-center gap-1 rounded-full bg-primary-soft px-2.5 text-xs font-medium text-primary-soft-foreground transition-colors hover:bg-primary-soft/75"
          >
            <Sparkles className="size-3" aria-hidden="true" />
            <span>llms.txt</span>
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search products (Ctrl+K)"
            className="inline-flex h-9 items-center gap-2.5 rounded-lg border border-border bg-subtle px-3 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            <Search className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Search products...</span>
            <kbd className="hidden rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground lg:inline-block">
              ⌘K
            </kbd>
          </button>

          <Link
            href="/submit"
            className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'h-9 px-3.5')}
          >
            <Plus className="size-4" aria-hidden="true" />
            <span>Submit product</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className={cn(buttonVariants({ variant: 'secondary', size: 'icon-sm' }), 'size-9 md:hidden')}
          >
            {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </Container>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div id="mobile-nav" className="border-t border-border bg-background md:hidden">
          <Container className="flex flex-col gap-4 py-4">
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className={navLinkClass(pathname === '/')}
              >
                Launches
              </Link>
              <Link
                href="/directory"
                onClick={() => setMobileOpen(false)}
                className={navLinkClass(pathname === '/directory')}
              >
                Products
              </Link>
              <Link
                href="/best"
                onClick={() => setMobileOpen(false)}
                className={navLinkClass(pathname === '/best')}
              >
                <Trophy className="size-3.5 text-gold" aria-hidden="true" />
                <span>Best of {currentYear}</span>
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileOpen(false)}
                className={navLinkClass(pathname === '/pricing')}
              >
                Pricing
              </Link>
              <a
                href="/llms.txt"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className={navLinkClass(false)}
              >
                <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
                <span>llms.txt (AI Index)</span>
              </a>
            </nav>

            <div className="border-t border-border pt-3">
              <p className="px-3 pb-2 text-eyebrow text-muted-foreground">Categories</p>
              <div className="grid grid-cols-2 gap-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={categoryHref(cat.slug)}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </div>
      )}

      {/* Quick search dialog (Cmd/Ctrl + K) */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-lg p-5">
          <DialogTitle className="text-h4">Search directory</DialogTitle>
          <form onSubmit={handleSearchSubmit} className="mt-2 flex flex-col gap-4">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                autoFocus
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name, tagline or category..."
                aria-label="Search products"
                className="h-11 pr-20 pl-9"
              />
              <button
                type="submit"
                className="absolute top-1/2 right-2 inline-flex h-7 -translate-y-1/2 items-center gap-1 rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary-hover"
              >
                <span>Go</span>
                <CornerDownLeft className="size-3" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-caption font-medium text-muted-foreground">Browse by category</span>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={categoryHref(cat.slug)}
                    onClick={() => setSearchOpen(false)}
                    className="rounded-full border border-border bg-subtle px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary-soft hover:text-primary-soft-foreground"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}
