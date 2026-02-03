import React, { useState, useEffect } from "react";
import axios from "axios";

const ExpiredMembersModal = ({ isOpen, onClose, adminIdToken }) => {
  const [expiredMembers, setExpiredMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchExpiredMembers();
    }
  }, [isOpen]);

  const fetchExpiredMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/members`,
        {
          headers: {
            Authorization: `Bearer ${adminIdToken}`,
          },
        }
      );

      const allMembers = response.data.members || [];
      
      // Filter expired members
      const expired = allMembers.filter((member) => {
        if (!member.expiryDate) return false;
        const expiry = new Date(member.expiryDate);
        return expiry < new Date();
      });

      setExpiredMembers(expired);
    } catch (err) {
      console.error("Error fetching expired members:", err);
      setError("Failed to load expired members");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "30px",
          maxWidth: "900px",
          width: "95%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0 }}>Expired Memberships</h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666",
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#fee",
              color: "#c00",
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            Loading expired members...
          </div>
        ) : expiredMembers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
            No expired memberships found
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "20px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>
                    Member Name
                  </th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>
                    Email
                  </th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>
                    Package Type
                  </th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>
                    Expiry Date
                  </th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>
                    Days Expired
                  </th>
                </tr>
              </thead>
              <tbody>
                {expiredMembers.map((member) => {
                  const expiryDate = new Date(member.expiryDate);
                  const today = new Date();
                  const daysExpired = Math.floor(
                    (today - expiryDate) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <tr
                      key={member.uid}
                      style={{
                        borderBottom: "1px solid #eee",
                        backgroundColor: daysExpired > 30 ? "#ffe6e6" : "transparent",
                      }}
                    >
                      <td style={{ padding: "12px" }}>
                        <strong>{member.name}</strong>
                      </td>
                      <td style={{ padding: "12px", color: "#666" }}>
                        {member.email}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {member.packageType || "N/A"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {expiryDate.toLocaleDateString()}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            backgroundColor: daysExpired > 30 ? "#ffcccc" : "#fff9e6",
                            color: daysExpired > 30 ? "#cc0000" : "#996600",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            fontSize: "12px",
                          }}
                        >
                          {daysExpired} days ago
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ borderTop: "1px solid #eee", paddingTop: "15px", marginTop: "20px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpiredMembersModal;
