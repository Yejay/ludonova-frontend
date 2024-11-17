'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/ui/mode-toggle";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Gamepad, 
  Menu, 
  X, 
  GamepadIcon, 
  Library, 
  Star, 
  ListTodo,
  Loader2 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const features = [
    {
      title: "Steam Integration",
      description: "Automatically sync your Steam library and keep track of all your games in one place.",
      icon: <GamepadIcon className="h-8 w-8 mb-4" />,
    },
    {
      title: "Game Library Management",
      description: "Organize your games across different platforms, track your progress, and manage your backlog effectively.",
      icon: <Library className="h-8 w-8 mb-4" />,
    },
    {
      title: "Progress Tracking",
      description: "Keep track of your gaming achievements, completion rates, and time spent on each game.",
      icon: <ListTodo className="h-8 w-8 mb-4" />,
    },
    {
      title: "Game Reviews",
      description: "Rate and review games you've played, and share your gaming experiences with others.",
      icon: <Star className="h-8 w-8 mb-4" />,
    }
  ];

  const handleAuthAction = async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-background border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-4">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="font-bold text-xl flex items-center">
              <Gamepad className="h-6 w-6 mr-2" />
              LudoNova
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <Link 
              href="#features" 
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link 
              href="#about" 
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link 
              href="#contact" 
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button 
                  variant="ghost"
                  onClick={() => router.push('/dashboard')}
                >
                  Dashboard
                </Button>
                <Button 
                  onClick={() => router.push('/games')}
                  className="flex items-center"
                >
                  <GamepadIcon className="mr-2 h-4 w-4" />
                  My Games
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">
                    Sign In
                  </Button>
                </Link>
                <Link href="/login">
                  <Button>
                    <GamepadIcon className="mr-2 h-4 w-4" />
                    Connect with Steam
                  </Button>
                </Link>
              </>
            )}
            <ModeToggle />
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="space-y-4">
              <Link 
                href="#features" 
                className="block text-foreground/80 hover:text-foreground"
              >
                Features
              </Link>
              <Link 
                href="#about" 
                className="block text-foreground/80 hover:text-foreground"
              >
                About
              </Link>
              <Link 
                href="#contact" 
                className="block text-foreground/80 hover:text-foreground"
              >
                Contact
              </Link>
              <div className="pt-4 space-y-4">
                {isAuthenticated ? (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push('/dashboard')}
                    >
                      Dashboard
                    </Button>
                    <Button 
                      className="w-full"
                      onClick={() => router.push('/games')}
                    >
                      <GamepadIcon className="mr-2 h-4 w-4" />
                      My Games
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block">
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/login" className="block">
                      <Button className="w-full">
                        <GamepadIcon className="mr-2 h-4 w-4" />
                        Connect with Steam
                      </Button>
                    </Link>
                  </>
                )}
                <div className="flex justify-center pt-2">
                  <ModeToggle />
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Manage Your Gaming Journey
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Track your progress, manage your backlog, and discover new games across all your gaming platforms.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-400">
            {isAuthenticated ? (
              <Button 
                size="lg" 
                className="w-full sm:w-auto"
                onClick={() => router.push('/dashboard')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GamepadIcon className="mr-2 h-5 w-5" />
                )}
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full">
                    <GamepadIcon className="mr-2 h-5 w-5" />
                    Connect with Steam
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full">
                    Create Free Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Manage Your Games
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-background transition-all hover:shadow-lg"
              >
                <CardHeader>
                  <CardTitle className="flex flex-col items-center text-center">
                    {feature.icon}
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Level Up Your Game Management?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of gamers who are already using LudoNova to organize their gaming life.
          </p>
          {isAuthenticated ? (
            <Button 
              size="lg"
              onClick={() => router.push('/dashboard')}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Go to Dashboard'
              )}
            </Button>
          ) : (
            <Link href="/login">
              <Button size="lg">
                Get Started Now
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <span className="font-bold text-xl flex items-center">
                <Gamepad className="h-6 w-6 mr-2" />
                LudoNova
              </span>
              <p className="text-sm text-muted-foreground">
                Your ultimate game collection manager.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features">Features</Link></li>
                <li><Link href="#pricing">Pricing</Link></li>
                <li><Link href="#about">About</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#faq">FAQ</Link></li>
                <li><Link href="#contact">Contact</Link></li>
                <li><Link href="#help">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/cookies">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} LudoNova. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}