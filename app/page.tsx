'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ModeToggle from "@/components/ui/mode-toggle";
import { GamepadIcon, Menu, X, Search } from 'lucide-react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { rawgApi, FEATURED_GAME_IDS, HERO_GAME_IDS, type Game } from '@/lib/api/rawg';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);
  const [heroGames, setHeroGames] = useState<Game[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [popularGames, setPopularGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hero carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((current) => (current + 1) % heroGames.length);
    }, 5000); // Change hero every 5 seconds

    return () => clearInterval(interval);
  }, [heroGames.length]);

  // Fetch games from RAWG API
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        // Fetch hero games
        const heroData = await rawgApi.getMultipleGames(HERO_GAME_IDS);
        setHeroGames(heroData);

        // Fetch specific popular games
        const gamesData = await rawgApi.getMultipleGames(Object.values(FEATURED_GAME_IDS));
        setPopularGames(gamesData);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <header className={cn("fixed w-full z-50 transition-all duration-300", scrollY > 50 ? "bg-background/80 backdrop-blur-md shadow-md" : "")}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-between items-center h-16">
            <Link href="/" className="font-bold text-2xl flex items-center space-x-2">
              <GamepadIcon className="h-8 w-8 text-primary" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">LudoNova</span>
            </Link>
            <div className="hidden md:flex space-x-4 items-center">
              <Link href="#games" className="text-sm font-medium hover:text-primary transition-colors">
                Games
              </Link>
              {isAuthenticated ? (
                <Button onClick={() => router.push('/dashboard')} variant="outline">Dashboard</Button>
              ) : (
                <Button onClick={() => router.push('/login')}>
                  <GamepadIcon className="mr-2 h-4 w-4" />
                  Get Started
                </Button>
              )}
              <ModeToggle />
            </div>
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </nav>
        </div>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-background/95 backdrop-blur-md">
          <nav className="flex flex-col items-center justify-center h-full space-y-8">
            <Link href="#games" className="text-2xl font-medium hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
              Games
            </Link>
            {isAuthenticated ? (
              <Button size="lg" onClick={() => router.push('/dashboard')}>Dashboard</Button>
            ) : (
              <Button size="lg" onClick={() => router.push('/login')}>
                <GamepadIcon className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            )}
            <ModeToggle />
          </nav>
        </div>
      )}

      <main className="flex-grow pt-16">
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            {heroGames.map((game, index) => (
              <div
                key={game.id}
                className={cn(
                  "absolute inset-0 transition-opacity duration-1000",
                  index === currentHeroIndex ? 'opacity-20' : 'opacity-0'
                )}
              >
                <Image
                  src={game.background_image}
                  alt={game.name}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                Level Up Your Gaming Journey
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12">
              Track, manage, and discover games across all your platforms.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                size="lg" 
                onClick={() => router.push(isAuthenticated ? '/dashboard' : '/login')}
                className="w-full sm:w-auto"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Start Your Collection'}
              </Button>
              <div className="relative w-full sm:w-auto">
                <Input 
                  type="text" 
                  placeholder="Search games..." 
                  className="pl-10 pr-4 py-2 w-full sm:w-64"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
        </section>

        <section id="games" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Games</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="relative aspect-[3/4] rounded-lg overflow-hidden">
                    <Skeleton className="absolute inset-0" />
                  </div>
                ))
              ) : (
                // Game cards
                popularGames.map((game) => (
                  <div 
                    key={game.id} 
                    className="relative aspect-[3/4] rounded-lg overflow-hidden group cursor-pointer"
                    onClick={() => router.push(`/games/${game.id}`)}
                  >
                    <Image
                      src={game.background_image}
                      alt={game.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <h3 className="text-white font-semibold">{game.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">
                          {game.genres[0]?.name}
                        </span>
                        <span className="text-white/80 text-sm">
                          ★ {game.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <GamepadIcon className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">LudoNova</span>
            </div>
            <nav className="flex space-x-4">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </nav>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} LudoNova. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

