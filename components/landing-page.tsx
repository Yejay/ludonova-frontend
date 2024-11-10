'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/ui/mode-toggle";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gamepad, Menu, X, GamepadIcon, Library, Star, ListTodo } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white dark:bg-zinc-950 p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="font-bold text-xl text-black dark:text-white flex items-center">
              <Gamepad className="h-6 w-6 mr-2" />
              LudoNova
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <Link href="#features" className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300">
              Features
            </Link>
            <Link href="#about" className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300">
              About
            </Link>
            <Link href="#contact" className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300">
              Contact
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline" className="text-black dark:text-white border-black dark:border-white hover:bg-gray-200 dark:hover:bg-gray-800">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button>
                <GamepadIcon className="mr-2 h-4 w-4" />
                Connect with Steam
              </Button>
            </Link>
            <ModeToggle />
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-black dark:text-white" />
            ) : (
              <Menu className="h-6 w-6 text-black dark:text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-4 p-4">
            <Link href="#features" className="block text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300">
              Features
            </Link>
            <Link href="#about" className="block text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300">
              About
            </Link>
            <Link href="#contact" className="block text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300">
              Contact
            </Link>
            <div className="pt-4 space-y-4">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="w-full">
                  <GamepadIcon className="mr-2 h-4 w-4" />
                  Connect with Steam
                </Button>
              </Link>
              <div className="flex justify-center pt-2">
                <ModeToggle />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Manage Your Gaming Journey
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Track your progress, manage your backlog, and discover new games across all your gaming platforms.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                <GamepadIcon className="mr-2 h-5 w-5" />
                Connect with Steam
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Create Free Account
              </Button>
            </Link>
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
              <Card key={index} className="bg-background">
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
          <Link href="/login">
            <Button size="lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 text-white p-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-8 md:mb-0">
            <span className="font-bold text-xl flex items-center">
              <Gamepad className="h-6 w-6 mr-2" />
              LudoNova
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="hover:text-gray-300">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-gray-300">Pricing</Link></li>
                <li><Link href="#about" className="hover:text-gray-300">About</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="#faq" className="hover:text-gray-300">FAQ</Link></li>
                <li><Link href="#contact" className="hover:text-gray-300">Contact</Link></li>
                <li><Link href="#help" className="hover:text-gray-300">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="hover:text-gray-300">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-gray-300">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-gray-300">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-zinc-800 text-center text-sm text-zinc-400">
          © {new Date().getFullYear()} LudoNova. All rights reserved.
        </div>
      </footer>
    </div>
  );
}