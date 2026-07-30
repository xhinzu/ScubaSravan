/**
 * ScubaSravan Central Configuration
 */

export const APP_CONFIG = {
  // Sravan's FamPay UPI details
  famPayId: "6238753844@fam",
  famPayName: "Sravan R",
  qrImagePath: "/sravan-fam-qr.png",
  famPayLink: process.env.FAMPAY_LINK || "upi://pay?pa=6238753844@fam&pn=Sravan%20R&cu=INR",
  
  // Password to log in to the /admin dashboard
  adminPassword: process.env.ADMIN_PASSWORD || "scuba123",
  
  // Default items to seed into database if empty
  defaultItems: [
    { name: "Maths Assignment", price: 50, sortOrder: 1 },
    { name: "CS Assignment", price: 50, sortOrder: 2 },
    { name: "Hindi Assignment", price: 10, sortOrder: 3 },
    { name: "Biomaths Diagram (1)", price: 10, sortOrder: 4 },
    { name: "Record (per activity)", price: 15, sortOrder: 5 },
    { name: "Custom Drawings 😋", price: 150, sortOrder: 6 },
  ]
};
