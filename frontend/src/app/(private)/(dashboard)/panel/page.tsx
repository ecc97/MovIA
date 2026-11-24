"use client";

import Link from "next/link";
import { Car, ClipboardList, MessageSquare, Sparkles } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useInventoryPage, useVehiclePage } from "@/features/vehicles/hooks/useVehicles";
import { useInquiries } from "@/features/inquiries/hooks/useInquiries";
import type { InquirySummary } from "@/features/inquiries/types";
import { INQUIRY_STATUS_CONFIG } from "@/features/inquiries/utils/status";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingBlock } from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils";

export default function PanelDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const publishedQuery = useVehiclePage({ limit: "1" });
  const inventoryQuery = useInventoryPage({ limit: 1 }, isAdmin);
  const inquiriesQuery = useInquiries();
  const newQuery = useInquiries({ status: "NUEVA", limit: 1 });
  const contactQuery = useInquiries({ status: "EN_CONTACTO", limit: 1 });
  const followQuery = useInquiries({ status: "EN_SEGUIMIENTO", limit: 1 });

  const loading =
    publishedQuery.isLoading || inquiriesQuery.isLoading || newQuery.isLoading;

  if (loading) return <LoadingBlock label="Preparando el panel…" />;

  const publishedTotal = publishedQuery.data?.pagination.total ?? 0;
  const inventoryTotal = inventoryQuery.data?.pagination.total ?? 0;
  const inquiryTotal = inquiriesQuery.data?.total ?? 0;
  const newTotal = newQuery.data?.total ?? 0;
  const recentInquiries: InquirySummary[] = inquiriesQuery.data?.items?.slice(0, 5) ?? [];

  const stats = isAdmin
    ? [
        { label: "Publicados", value: publishedTotal, hint: "Visibles en el catálogo", icon: <Car size={20} aria-hidden="true" />, href: "/panel/inventario" },
        { label: "Inventario", value: inventoryTotal, hint: "Todos los estados", icon: <ClipboardList size={20} aria-hidden="true" />, href: "/panel/inventario" },
        { label: "Consultas", value: inquiryTotal, hint: "Recibidas", icon: <MessageSquare size={20} aria-hidden="true" />, href: "/panel/consultas" },
        { label: "Nuevas", value: newTotal, hint: "Sin atender", icon: <Sparkles size={20} aria-hidden="true" />, href: "/panel/consultas" },
      ]
    : [
        { label: "Consultas", value: inquiryTotal, hint: "Recibidas", icon: <MessageSquare size={20} aria-hidden="true" />, href: "/panel/consultas" },
        { label: "Nuevas", value: newTotal, hint: "Sin atender", icon: <Sparkles size={20} aria-hidden="true" />, href: "/panel/consultas" },
        { label: "En contacto", value: contactQuery.data?.total ?? 0, hint: "En atención", icon: <MessageSquare size={20} aria-hidden="true" />, href: "/panel/consultas" },
        { label: "En seguimiento", value: followQuery.data?.total ?? 0, hint: "En evaluación", icon: <ClipboardList size={20} aria-hidden="true" />, href: "/panel/consultas" },
      ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`Bienvenido, ${user?.name?.split(" ")[0] ?? ""}`}
        title="Dashboard"
        description="Vista general del inventario y las consultas de MOVIA."
        actions={
          isAdmin ? (
            <Link href="/panel/inventario" className="btn-primary">
              Gestionar inventario
            </Link>
          ) : (
            <Link href="/panel/consultas" className="btn-primary">
              Ver consultas
            </Link>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-sora text-lg font-semibold text-foreground">Consultas recientes</h2>
            <p className="text-sm text-muted">Últimos mensajes recibidos en el panel.</p>
          </div>
          <Link href="/panel/consultas" className="text-sm font-semibold text-accent-text hover:underline">
            Ver todas
          </Link>
        </div>

        {recentInquiries.length === 0 ? (
          <EmptyState
            icon={<MessageSquare size={22} aria-hidden="true" />}
            title="Todavía no hay consultas"
            description="Cuando un visitante envíe una consulta, aparecerá aquí."
          />
        ) : (
          <>
            <div className="card hidden overflow-hidden md:block">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-surface-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Cliente</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Vehículo</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Estado</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentInquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="transition-colors hover:bg-surface-muted">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{inquiry.name}</p>
                        <p className="text-xs text-muted">{inquiry.email}</p>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {inquiry.vehicleMake
                          ? `${inquiry.vehicleMake} ${inquiry.vehicleModel ?? ""}`.trim()
                          : "General"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={INQUIRY_STATUS_CONFIG[inquiry.status].tone}>
                          {INQUIRY_STATUS_CONFIG[inquiry.status].label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted">{formatDate(inquiry.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {recentInquiries.map((inquiry) => (
                <div key={inquiry.id} className="card space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{inquiry.name}</p>
                      <p className="text-xs text-muted">{inquiry.email}</p>
                    </div>
                    <Badge tone={INQUIRY_STATUS_CONFIG[inquiry.status].tone}>
                      {INQUIRY_STATUS_CONFIG[inquiry.status].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted">
                    {inquiry.vehicleMake
                      ? `${inquiry.vehicleMake} ${inquiry.vehicleModel ?? ""}`.trim()
                      : "Consulta general"}
                  </p>
                  <p className="text-xs text-muted">{formatDate(inquiry.createdAt)}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
