
"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from "@/components/ui/toaster";
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, Users, Settings, BarChart3, LayoutDashboard, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    <p className="mt-4 text-slate-600 text-lg">Yükleniyor...</p>
  </div>
);

const navItems = [
  { href: "/users", label: "Kullanıcı Yönetimi", icon: Users },
  { href: "/status", label: "Servis Durumu", icon: BarChart3 },
  { href: "/setup", label: "Coturn Kurulumu", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth(); // Default redirect is /login
  const router = useRouter();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      // The /api/logout route (GET) clears the cookie.
      // After cookie is cleared, next auth check will fail.
      await fetch('/api/logout'); 
      // Force a reload or push to login to update client-side auth state immediately.
      // useAuth hook will eventually redirect if /api/me fails, but this is faster.
      router.push('/login'); 
      // router.refresh(); // To ensure server components also re-evaluate if needed.
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally, show a toast message to the user
      // For now, just redirect to login, auth check will handle the rest.
      router.push('/login');
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  // useAuth hook handles redirection if !isAuthenticated.
  // If we reach here and !isAuthenticated, it means useAuth hasn't redirected yet,
  // or there's a race condition. Showing loading is safer.
  // However, useAuth should robustly redirect.
  if (!isAuthenticated) {
     // This part should ideally not be reached if useAuth is working correctly.
     // It's a fallback.
    return <LoadingScreen />;
  }
  
  const NavLinkContent: React.FC<{ href: string; label: string; icon: React.ElementType; isActive: boolean; onClick?: () => void }> = ({ href, label, icon: Icon, isActive, onClick }) => (
     <Link href={href} passHref legacyBehavior>
        <a
          onClick={onClick}
          className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                      ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200 hover:text-slate-900'}`}
        >
          <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-600'}`} />
          {label}
        </a>
      </Link>
  );


  const DesktopNavigation = () => (
    <nav className="flex space-x-1">
      {navItems.map((item) => (
        <Button 
          key={item.href} 
          variant={pathname === item.href ? "default" : "ghost"} 
          size="sm" 
          asChild
          className={pathname === item.href ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-slate-700 hover:bg-slate-200"}
        >
          <Link href={item.href} className="flex items-center">
            <item.icon className={`mr-1.5 h-4 w-4 ${pathname === item.href ? 'text-white' : 'text-slate-500'}`} />
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
  
  const MobileNavigationMenu = () => (
     <nav className="flex flex-col space-y-1">
        {navItems.map((item) => (
          <NavLinkContent 
            key={item.href} 
            href={item.href} 
            label={item.label}
            icon={item.icon} 
            isActive={pathname === item.href}
            onClick={() => setIsSheetOpen(false)}
          />
        ))}
      </nav>
  );


  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
       <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/status" legacyBehavior>
              <a className="flex items-center text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                <LayoutDashboard className="mr-2 h-6 w-6" />
                TURN Admin
              </a>
            </Link>
            
            <div className="hidden md:flex items-center space-x-4">
              <DesktopNavigation />
              <Button onClick={handleLogout} variant="outline" size="sm" className="text-red-600 border-red-500 hover:bg-red-50 hover:text-red-700 hover:border-red-600">
                <LogOut className="mr-2 h-4 w-4" /> Çıkış Yap
              </Button>
            </div>

            <div className="md:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6 text-slate-700" />
                    <span className="sr-only">Menüyü aç</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 bg-white p-0 pt-2">
                  <SheetHeader className="p-4 border-b mb-2">
                    <SheetTitle className="flex items-center text-lg font-semibold text-blue-600">
                       <LayoutDashboard className="mr-2 h-5 w-5" /> TURN Admin Panel
                    </SheetTitle>
                  </SheetHeader>
                  <div className="p-4 space-y-3">
                    <MobileNavigationMenu />
                    <Button onClick={() => { handleLogout(); setIsSheetOpen(false); }} variant="outline" className="w-full text-red-600 border-red-500 hover:bg-red-50 hover:text-red-700 hover:border-red-600">
                      <LogOut className="mr-2 h-4 w-4" /> Çıkış Yap
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} TURN Yönetim Paneli. Tüm hakları saklıdır.</p>
        <p className="mt-1">Bu arayüz, sunucudaki <code className="text-xs bg-slate-200 text-slate-700 px-1 py-0.5 rounded-sm">turnadmin</code> ve <code className="text-xs bg-slate-200 text-slate-700 px-1 py-0.5 rounded-sm">systemctl</code> komutlarını kullanır.</p>
      </footer>
      <Toaster />
    </div>
  );
}
