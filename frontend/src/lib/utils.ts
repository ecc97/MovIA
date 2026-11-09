export function formatPriceCOP(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getWhatsAppLink(number: string, message: string): string {
  const cleanNumber = number.replace(/[\s\-]/g, "");
  return `https://wa.me/57${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}