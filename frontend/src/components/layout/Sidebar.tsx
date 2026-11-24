"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, ExternalLink, LayoutDashboard, LogOut, MessageSquare } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

interface SidebarProps {
  role: Role;
  onNavigate?: () => void;
  className?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/panel", icon: LayoutDashboard },
  { name: "Inventario", href: "/panel/inventario", icon: Car, adminOnly: true },
  { name: "Consultas", href: "/panel/consultas", icon: MessageSquare },
  { name: "Sitio web", href: "/", icon: ExternalLink },
];

export default function Sidebar({ role, onNavigate, className }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { confirm } = useConfirm();

  const handleLogout = async () => {
    const accepted = await confirm({
      title: "¿Cerrar sesión?",
      description: "Necesitarás volver a ingresar para acceder al panel.",
      confirmLabel: "Cerrar sesión",
    });
    if (accepted) await logout();
  };

  return (
    <div className={cn("flex h-full flex-col bg-grafito text-white", className)}>
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
        <span className="font-sora text-lg font-bold tracking-[0.16em]">MOVIA</span>
        <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/70">
          Panel
        </span>
      </div>

      <nav aria-label="Navegación del panel" className="flex-1 space-y-1 px-3 py-6">
        {navItems.map((item) => {
          if (item.adminOnly && role !== "ADMIN") return null;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              target={item.href === "/" ? "_blank" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-btn px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-dorado"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={19} aria-hidden="true" />
              {item.name}
              {active && <span className="ml-auto size-1.5 rounded-full bg-dorado" aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 px-1">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-dorado-300">
            {user?.name?.charAt(0).toUpperCase() ?? "M"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.name ?? "Usuario"}</p>
            <Badge tone="accent" className="mt-1 !px-2 !py-0.5 !text-[10px]">
              {role}
            </Badge>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-11 w-full items-center gap-3 rounded-btn px-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={19} aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
