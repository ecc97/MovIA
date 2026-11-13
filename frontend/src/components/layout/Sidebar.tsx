"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  MessageSquare,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Role } from "@/types";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  isDefault?: boolean;
  adminOnly?: boolean;
}

interface SidebarProps {
  role: Role;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/panel", icon: LayoutDashboard, isDefault: true },
    { name: "Inventario", href: "/panel/inventario", icon: Car, adminOnly: true },
    { name: "Consultas", href: "/panel/consultas", icon: MessageSquare },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-btn bg-grafito text-blanco hover:bg-gris-700 focus:outline-none focus:ring-2 focus:ring-dorado"
          aria-label="Abrir menú"
        >
          {mobileOpen ? (
            <ChevronDown size={20} className="rotate-180" />
          ) : (
            <ChevronDown size={20} className="" />
          )}
        </button>
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute left-0 top-0 h-full w-64 bg-grafito shadow-xl p-4">
            <MobileNav role={role} onLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-grafito rounded-card p-4 shadow-sm h-fit">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <SidebarLink
              key={item.name}
              item={item}
              isActive={isActive(item.href)}
              role={role}
            />
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-3 py-2 rounded-md text-sm font-medium text-blanco hover:bg-gris-700 transition-colors"
          >
            <LogOut size={20} />
            Cerrar sesión
          </button>
        </nav>
      </aside>
    </>
  );
}

interface SidebarLinkProps {
  item: NavItem;
  isActive: boolean;
  role: Role;
}

function SidebarLink({ item, isActive, role }: SidebarLinkProps) {
  // El inventario es solo ADMIN (protegido además por el layout (admin))
  if (item.adminOnly && role !== "ADMIN") {
    return null;
  }

  return (
    <Link
      href={item.href}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
        ${isActive
          ? "bg-dorado text-grafito"
          : "text-blanco hover:bg-gris-700"
        }
      `}
    >
      <item.icon size={20} />
      {item.name}
    </Link>
  );
}

interface MobileNavProps {
  role: Role;
  onLogout: () => void;
}

function MobileNav({ role, onLogout }: MobileNavProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/panel", icon: LayoutDashboard },
    { name: "Inventario", href: "/panel/inventario", icon: Car, adminOnly: true },
    { name: "Consultas", href: "/panel/consultas", icon: MessageSquare },
  ];

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          // El inventario es solo ADMIN (protegido además por el layout (admin))
          if (item.adminOnly && role !== "ADMIN") {
            return null;
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive
                  ? "bg-dorado text-grafito"
                  : "text-blanco hover:bg-gris-700"
                }
              `}
              onClick={() => {}}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={onLogout}
        className="mt-4 flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-blanco hover:bg-gris-700 w-full"
      >
        <LogOut size={20} />
        Cerrar sesión
      </button>
    </div>
  );
}
