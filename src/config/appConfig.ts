/**
 * ScubaSravan Central Configuration
 * Easy location to edit FamPay redirect URL and Admin Password.
 */

export const APP_CONFIG = {
  // FamPay link redirected to after submitting order
  famPayLink: process.env.FAMPAY_LINK || "https://fam.app/pay/scubasravan",
  
  // Password to log in to the /admin dashboard
  adminPassword: process.env.ADMIN_PASSWORD || "scuba123",
  
  // Default items to seed into database if empty
  defaultItems: [
    { name: "Maths Assignment", price: 50, sortOrder: 1 },
    { name: "CS Assignment", price: 50, sortOrder: 2 },
    { name: "Hindi Assignment", price: 10, sortOrder: 3 },
    { name: "Biomaths Diagram (1)", price: 10, sortOrder: 4 },
    { name: "Record (per page)", price: 15, sortOrder: 5 },
    { name: "Custom Drawings 😋", price: 150, sortOrder: 6 },
  ]
};
