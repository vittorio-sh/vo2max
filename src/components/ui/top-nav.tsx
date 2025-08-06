"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Calculator, Timer, Activity, Menu, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TopNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const apps = [
    {
      title: "VO2 Max Calculator",
      href: "/",
      description: "Calculate VO2 Max estimates and training parameters",
      icon: Calculator,
      isCurrent: pathname === "/",
    },
    {
      title: "Metronome",
      href: "/metronome",
      description: "Digital metronome for training and rhythm",
      icon: Timer,
      isCurrent: pathname === "/metronome",
    },
  ];

  const handleAppClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <header className="hidden md:block fixed top-4 left-4 z-50">
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg backdrop-blur-sm">
          <div className="flex h-12 items-center px-4">
            {/* Logo/Brand and Apps Dropdown */}
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-sm">
                <Activity className="h-4 w-4 text-slate-900" />
              </div>
              <span className="font-semibold text-gray-900">Viviana Apps</span>
              
              {/* Apps Dropdown */}
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 shadow-sm">
                      Apps
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-2 p-4 w-80">
                        {apps.map((app) => (
                          <ListItem
                            key={app.title}
                            href={app.href}
                            title={app.title}
                            icon={app.icon}
                            isCurrent={app.isCurrent}
                          >
                            {app.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <header className="md:hidden fixed top-4 left-4 z-50">
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg backdrop-blur-sm">
          <div className="flex h-10 items-center px-3">
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-sm">
                <Activity className="h-3 w-3 text-slate-900" />
              </div>
              <span className="font-semibold text-gray-900 text-sm">Viviana Apps</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
              className="ml-3 h-8 w-8 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Full Screen Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-sm">
                <Activity className="h-4 w-4 text-slate-900" />
              </div>
              <span className="font-semibold text-gray-900 text-lg">Viviana Apps</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Menu Content */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose an App</h2>
            <div className="space-y-4">
              {apps.map((app) => (
                <a
                  key={app.title}
                  href={app.href}
                  onClick={handleAppClick}
                  className={cn(
                    "flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-200 active:scale-95",
                    app.isCurrent 
                      ? "border-blue-300 bg-blue-50 shadow-sm" 
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-xl",
                    app.isCurrent ? "bg-blue-100" : "bg-gray-100"
                  )}>
                    <app.icon className={cn(
                      "h-6 w-6",
                      app.isCurrent ? "text-blue-600" : "text-gray-600"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <h3 className="font-semibold text-gray-900">{app.title}</h3>
                      {app.isCurrent && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{app.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    isCurrent?: boolean;
  }
>(({ className, title, children, icon: Icon, isCurrent, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-lg p-3 md:p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-gray-50 hover:shadow-sm touch-manipulation",
            isCurrent && "ring-2 ring-blue-200 bg-blue-50/50",
            className
          )}
          {...props}
        >
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <div className="text-sm font-medium leading-none text-gray-900 min-w-0">
              {title}
              {isCurrent && (
                <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Current
                </span>
              )}
            </div>
          </div>
          <p className="line-clamp-2 text-xs leading-snug text-gray-600 mt-1">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem"; 