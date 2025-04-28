import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ListChecks, 
  Users, 
  BarChart, 
  Menu, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem = ({ href, icon, title, isActive, onClick }: NavItemProps) => (
  <Link href={href}>
    <a
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-muted"
      )}
      onClick={onClick}
    >
      {icon}
      {title}
    </a>
  </Link>
);

export function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const closeSheet = () => setOpen(false);
  
  const navItems = [
    { 
      href: "/", 
      icon: <LayoutDashboard className="h-4 w-4" />, 
      title: "Dashboard" 
    },
    { 
      href: "/tasks", 
      icon: <ListChecks className="h-4 w-4" />, 
      title: "Tasks" 
    },
    { 
      href: "/employees", 
      icon: <Users className="h-4 w-4" />, 
      title: "Employees" 
    },
    { 
      href: "/analytics", 
      icon: <BarChart className="h-4 w-4" />, 
      title: "Analytics" 
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center gap-2 md:mr-6">
          <span className="hidden font-bold md:inline-block">
            AI Task Optimizer
          </span>
        </div>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              isActive={location === item.href}
            />
          ))}
        </nav>
        
        {/* Mobile navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex items-center gap-2 py-4">
              <span className="font-bold">AI Task Optimizer</span>
            </div>
            <nav className="flex flex-col gap-2 py-4">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  title={item.title}
                  isActive={location === item.href}
                  onClick={closeSheet}
                />
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Additional header items could go here */}
        </div>
      </div>
    </header>
  );
}
