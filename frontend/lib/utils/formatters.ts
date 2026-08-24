export function formatRole(role: string): string {
  switch (role) {
    case "HOUSEHOLD":
      return "Household / Citizen";
    case "COLLECTOR":
      return "Collection Partner";
    case "RECYCLER":
      return "Recycling Facility";
    case "ENTERPRISE":
      return "Enterprise / Producer";
    case "ADMIN":
      return "Platform Admin";
    default:
      return role;
  }
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString?: string | Date): string {
  if (!dateString) return "N/A";
  const d = typeof dateString === "string" ? new Date(dateString) : dateString;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
