"use client";

import { useVehicles } from "@/features/vehicles/hooks/useVehicles";
import { useInquiries } from "@/features/inquiries/hooks/useInquiries";
import type { InquirySummary } from "@/features/inquiries/types";
import { Car, LayoutDashboard, MessageSquare, AlertCircle } from "lucide-react";

function StatsCard({ title, value, subtitle, icon }: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-blanco rounded-card p-4 shadow-sm border border-gris-200">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-dorado/10 rounded-full text-dorado">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gris-600">{title}</p>
          <p className="text-2xl font-bold text-grafito">{value.toLocaleString()}</p>
          <p className="text-xs text-gris-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export default function PanelDashboard() {
  // GET /api/vehicles solo devuelve PUBLICADO (endpoint público)
  const { data: vehicles } = useVehicles();
  const { data: inquiriesData, isLoading: loadingInquiries } = useInquiries();

  const stats = {
    totalVehicles: vehicles?.length ?? 0,
    publishedVehicles: vehicles?.filter((v) => v.status === "PUBLICADO").length ?? 0,
    totalInquiries: inquiriesData?.total ?? 0,
    newInquiries: inquiriesData?.items?.filter((i) => i.status === "NUEVA").length ?? 0,
  };

  const recentInquiries: InquirySummary[] = inquiriesData?.items?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sora text-2xl font-bold text-grafito">Dashboard</h1>
        <p className="text-gris-600 mt-1">Vista general del inventario y consultas</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Vehículos"
          value={stats.totalVehicles}
          subtitle="Total"
          icon={<LayoutDashboard size={20} />}
        />
        <StatsCard
          title="Publicados"
          value={stats.publishedVehicles}
          subtitle="Disponibles"
          icon={<Car size={20} />}
        />
        <StatsCard
          title="Consultas"
          value={stats.totalInquiries}
          subtitle="Total"
          icon={<MessageSquare size={20} />}
        />
        <StatsCard
          title="Nuevas"
          value={stats.newInquiries}
          subtitle="Pendientes"
          icon={<AlertCircle size={20} />}
        />
      </div>

      {/* Recent inquiries table */}
      <section>
        <h2 className="font-sora text-lg font-semibold text-grafito mb-4">
          Consultas recientes
        </h2>

        {loadingInquiries || !inquiriesData ? (
          <div className="text-center py-8 text-gris-500">Cargando...</div>
        ) : recentInquiries.length === 0 ? (
          <div className="text-center py-8 text-gris-500">No hay consultas registradas</div>
        ) : (
          <div className="overflow-x-auto rounded-card border border-gris-200">
            <table className="w-full text-sm">
              <thead className="bg-gris-100">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-grafito">Nombre</th>
                  <th className="px-4 py-2 text-left font-medium text-grafito">Email</th>
                  <th className="px-4 py-2 text-left font-medium text-grafito">Estado</th>
                  <th className="px-4 py-2 text-left font-medium text-grafito">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentInquiries.map((inq) => (
                  <tr key={inq.id} className="border-b border-gris-200 last:border-0">
                    <td className="px-4 py-2">{inq.name}</td>
                    <td className="px-4 py-2">{inq.email}</td>
                    <td className="px-4 py-2">
                      <InquiryStatusBadge status={inq.status} />
                    </td>
                    <td className="px-4 py-2 text-gris-600">
                      {new Date(inq.createdAt).toLocaleDateString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function InquiryStatusBadge({ status }: { status: InquirySummary["status"] }) {
  const colors: Record<string, string> = {
    NUEVA: "bg-dorado text-grafito",
    EN_CONTACTO: "bg-azul-100 text-azul-800",
    EN_SEGUIMIENTO: "bg-pendiente text-grafito",
    VENDIDA: "bg-exito text-blanco",
    DESCARTADA: "bg-gris-500 text-blanco",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        colors[status] || "bg-gris-100 text-gris-800"
      }`}
    >
      {status}
    </span>
  );
}
