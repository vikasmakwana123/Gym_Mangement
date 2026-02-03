import React, { useState, useEffect } from "react";
import axios from "axios";

const DietManagementModal = ({ isOpen, onClose, adminIdToken }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [dietDetails, setDietDetails] = useState("");
  const [editingMemberId, setEditingMemberId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/diet/members`,
        {
          headers: {
            Authorization: `Bearer ${adminIdToken}`,
          },
        }
      );

      setMembers(response.data.members || []);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDiet = (memberId) => {
    const member = members.find((m) => m.uid === memberId);
    setEditingMemberId(memberId);
    setSelectedMemberId(memberId);
    setDietDetails(member?.dietDetails || "");
    setSuccess("");
    setError("");
  };

  const handleSaveDiet = async () => {
    if (!selectedMemberId || !dietDetails.trim()) {
      setError("Please enter diet details");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post(
        `${import.meta.env.VITE_API_URL}/diet/add`,
        {
          memberId: selectedMemberId,
          dietDetails: dietDetails,
        },
        {
          headers: {
            Authorization: `Bearer ${adminIdToken}`,
          },
        }
      );

      setSuccess("✅ Diet details saved successfully!");
      setDietDetails("");
      setEditingMemberId(null);
      setSelectedMemberId(null);

      // Refresh members list
      await fetchMembers();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error saving diet:", err);
      setError(err.response?.data?.error || "Failed to save diet details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingMemberId(null);
    setSelectedMemberId(null);
    setDietDetails("");
    setError("");
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
          <h2 style={{ margin: 0 }}>Manage Member Diet Plans</h2>
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

        {success && (
          <div
            style={{
              backgroundColor: "#efe",
              color: "#060",
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            {success}
          </div>
        )}

        {editingMemberId ? (
          // Diet editing form
          <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "8px" }}>
            <h3 style={{ marginTop: 0 }}>
              Edit Diet for{" "}
              <strong>{members.find((m) => m.uid === editingMemberId)?.name}</strong>
            </h3>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Diet Details:
              </label>
              <textarea
                value={dietDetails}
                onChange={(e) => setDietDetails(e.target.value)}
                placeholder="Enter diet details here... (e.g., Breakfast: Oats with fruits, Lunch: Grilled chicken with vegetables, etc.)"
                style={{
                  width: "100%",
                  padding: "10px",
                  minHeight: "150px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleSaveDiet}
                disabled={loading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: loading ? "#ccc" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {loading ? "Saving..." : "💾 Save Diet"}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          // Members list
          <div>
            {loading && members.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                Loading members...
              </div>
            ) : members.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                No members found
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
                        Diet Plan Status
                      </th>
                      <th style={{ padding: "12px", textAlign: "center", fontWeight: "bold" }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr
                        key={member.uid}
                        style={{
                          borderBottom: "1px solid #eee",
                          hover: { backgroundColor: "#f9f9f9" },
                        }}
                      >
                        <td style={{ padding: "12px" }}>
                          <strong>{member.name}</strong>
                        </td>
                        <td style={{ padding: "12px", color: "#666" }}>
                          {member.email}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {member.dietDetails ? (
                            <span
                              style={{
                                backgroundColor: "#d4edda",
                                color: "#155724",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            >
                              ✓ Plan Added
                            </span>
                          ) : (
                            <span
                              style={{
                                backgroundColor: "#fff3cd",
                                color: "#856404",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            >
                              ⚠ No Plan
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <button
                            onClick={() => handleAddDiet(member.uid)}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#007bff",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: "bold",
                            }}
                          >
                            🥗 Add Diet
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

export default DietManagementModal;
