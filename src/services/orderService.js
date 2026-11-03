
import { apiRequest } from "./api";

// Get orders
export const getOrders = ({
  storeId,
  page = 1,
  limit = 20,
  search = "",
  status = "",
  channel = "",
  from = "",
  to = "",
} = {}) => {
  if (!storeId) {
    throw new Error("Please select a store first.");
  }

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search.trim()) params.set("search", search.trim());
  if (status) params.set("status", status);
  if (channel) params.set("channel", channel);
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  return apiRequest(`/orders?${params.toString()}`, {
    method: "GET",
    headers: {
      "x-store-id": storeId,
    },
  });
};

// Get order details
export const getOrderById = (storeId, orderId) => {
  if (!storeId) {
    throw new Error("Please select a store first.");
  }

  if (!orderId) {
    throw new Error("Order ID is required.");
  }

  return apiRequest(`/orders/${orderId}`, {
    method: "GET",
    headers: {
      "x-store-id": storeId,
    },
  });
};

// Create order
export const createOrder = (storeId, body) => {
  if (!storeId) {
    throw new Error("Please select a store first.");
  }

  if (!body) {
    throw new Error("Order information is required.");
  }

  return apiRequest("/orders", {
    method: "POST",
    body,
    headers: {
      "x-store-id": storeId,
    },
  });
};

// Update order status
export const updateOrderStatus = (storeId, orderId, body) => {
  if (!storeId) {
    throw new Error("Please select a store first.");
  }

  if (!orderId) {
    throw new Error("Order ID is required.");
  }

  return apiRequest(`/orders/${orderId}/status`, {
    method: "PATCH",
    body,
    headers: {
      "x-store-id": storeId,
    },
  });
};
