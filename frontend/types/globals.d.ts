export {};

// Create a type for the Roles
export type Roles = "admin" | "ADMIN" | "HOUSEHOLD" | "COLLECTOR" | "RECYCLER" | "ENTERPRISE";
export type Portals = "INDIVIDUAL" | "BUSINESS";

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: Roles;
      portal?: Portals;
    };
  }
}
