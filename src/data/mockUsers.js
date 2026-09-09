// Temporary hardcoded accounts for testing role-based access.
// Replace this entire file with a real API call once the backend exists —
// AuthContext.login() is written so only its internals change, not its interface.
const mockUsers = [
  { email: "admin@yanzee.com", password: "admin123", role: "admin", name: "Admin" },
  { email: "seller@yanzee.com", password: "seller123", role: "seller", name: "Test Seller" },
  { email: "user@yanzee.com", password: "user123", role: "user", name: "Test Customer" },
];

export default mockUsers;