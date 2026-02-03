import React, { useState, useEffect } from "react";
import axios from "axios";

const OrdersManagement = ({ adminIdToken }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3000/orders/all",
        {
          headers: {
            Authorization: `Bearer ${adminIdToken}`,
          },
        }
      );
      // Filter to show only supplement orders, exclude membership/subscription orders
      const supplementOrders = (response.data.orders || []).filter(order => {
        // Check if any item in the order is NOT a membership type
        return order.items.some(item => item.type !== "membership" && item.type !== "membership_renewal");
      });
      console.log("Fetched Supplement Orders:", supplementOrders);
      setOrders(supplementOrders);
      setError("");
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:3000/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${adminIdToken}`,
          },
        }
      );
      setError("");
      await fetchAllOrders();
    } catch (err) {
      setError("Failed to update order status");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      try {
        await axios.delete(
          `http://localhost:3000/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${adminIdToken}`,
            },
          }
        );
        setError("");
        await fetchAllOrders();

        setExpandedOrderId(null);
      } catch (err) {
        console.error("Error deleting order:", err);
        setError("Failed to delete order");
      }
    }
  };

  return (
    <div>
      {error && (
        <div
          style={{
            backgroundColor: "#fee",
            color: "#c00",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Orders ({orders.length})</h2>

        {loading && <p style={{ color: "#666" }}>Loading orders...</p>}

        {orders.length === 0 && !loading && (
          <p style={{ color: "#666" }}>No orders yet.</p>
        )}

        {orders.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "20px",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f0f0f0",
                    borderBottom: "2px solid #ddd",
                  }}
                >
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Member Name
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Total Price
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Items Count
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Order Date
                  </th>
                  <th style={{ padding: "12px", textAlign: "center" }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <React.Fragment key={order._id}>
                    <tr style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "12px" }}>
                        {order.memberName || "N/A"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {order.memberEmail || "N/A"}
                      </td>
                      <td style={{ padding: "12px", fontWeight: "bold" }}>
                        ₹{order.totalPrice}
                      </td>
                      <td style={{ padding: "12px" }}>{order.items.length}</td>
                      <td style={{ padding: "12px" }}>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateStatus(order._id, e.target.value)
                          }
                          style={{
                            padding: "6px 10px",
                            borderRadius: "4px",
                            border: "1px solid #ddd",
                            cursor: "pointer",
                            fontWeight: "bold",
                            backgroundColor: 
                              order.status === "confirmed" ? "#d4edda" :
                              order.status === "collected" ? "#cce5ff" :
                              order.status === "rejected" ? "#f8d7da" : "white",
                            color:
                              order.status === "confirmed" ? "#155724" :
                              order.status === "collected" ? "#004085" :
                              order.status === "rejected" ? "#721c24" : "black",
                          }}
                        >
                          <option value="confirmed">✓ Confirmed</option>
                          <option value="collected">📦 Collected</option>
                          <option value="rejected">✗ Rejected</option>
                        </select>
                      </td>
                      <td style={{ padding: "12px" }}>
                        {new Date(order.placedAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <button
                          onClick={() =>
                            setExpandedOrderId(
                              expandedOrderId === order._id ? null : order._id
                            )
                          }
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          {expandedOrderId === order._id
                            ? "Hide Order"
                            : "Show Order"}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Order Details */}
                    {expandedOrderId === order._id && (
                      <tr style={{ backgroundColor: "#f9f9f9" }}>
                        <td colSpan="7" style={{ padding: "20px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                            <h4 style={{ margin: 0 }}>Order Items:</h4>
                            <button
                              onClick={() => handleDeleteOrder(order._id)}
                              style={{
                                padding: "8px 16px",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "bold",
                              }}
                            >
                              🗑️ Delete Order
                            </button>
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fill, minmax(280px, 1fr))",
                              gap: "15px",
                            }}
                          >
                            {order.items.map((item, index) => (
                              <div
                                key={index}
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "15px",
                                  borderRadius: "8px",
                                  backgroundColor: "white",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  style={{
                                    width: "100%",
                                    height: "140px",
                                    objectFit: "contain",
                                    marginBottom: "12px",
                                    backgroundColor: "#f5f5f5",
                                    borderRadius: "4px",
                                  }}
                                />
                                <h5 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "bold", color: "#333" }}>
                                  {item.name}
                                </h5>
                                <p
                                  style={{
                                    margin: "0 0 8px 0",
                                    fontSize: "13px",
                                    color: "#666",
                                    lineHeight: "1.4",
                                  }}
                                >
                                  {item.description}
                                </p>
                                <div style={{ marginTop: "auto", borderTop: "1px solid #eee", paddingTop: "12px" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "14px", color: "#666" }}>Price:</span>
                                    <span style={{ fontSize: "16px", fontWeight: "bold", color: "#007bff" }}>
                                      ₹{item.price}
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "14px", color: "#666" }}>Quantity:</span>
                                    <span style={{ fontSize: "18px", fontWeight: "bold", backgroundColor: "#007bff", color: "white", padding: "4px 12px", borderRadius: "20px", minWidth: "40px", textAlign: "center" }}>
                                      {item.quantity || 1}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;
