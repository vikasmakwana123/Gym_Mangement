import React, { useState } from "react";
import axios from "axios";

const MemberRenewalModal = ({ member, onClose, onRenewalSuccess, adminIdToken }) => {
  const [selectedPackage, setSelectedPackage] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const packages = [
    { id: "test_3min", name: "Test Plan", duration: "3 minutes" },
    { id: "basic", name: "Basic Plan", duration: "3 months" },
    { id: "standard", name: "Standard Plan", duration: "6 months" },
    { id: "premium", name: "Premium Plan", duration: "12 months" },
  ];

  const handleRenew = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.put(
        `http://localhost:3000/admin/members/${member.uid}/renew`,
        { packageType: selectedPackage },
        {
          headers: {
            Authorization: `Bearer ${adminIdToken}`,
          },
        }
      );

      if (response.status === 200) {
        onRenewalSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Error renewing membership:", err);
      setError(
        err.response?.data?.error || "Failed to renew membership"
      );
    } finally {
      setLoading(false);
    }
  };

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
          padding: "20px",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, marginBottom: "15px", fontSize: "18px", wordBreak: "break-word" }}>
          Renew Membership - {member.name}
        </h2>

        <div style={{ marginBottom: "15px", padding: "12px", backgroundColor: "#f0f0f0", borderRadius: "4px", fontSize: "14px" }}>
          <p style={{ margin: "5px 0", wordBreak: "break-word" }}>
            <strong>Current Package:</strong> {member.packageType}
          </p>
          <p style={{ margin: "5px 0", wordBreak: "break-word" }}>
            <strong>Current Status:</strong> {member.status}
          </p>
          <p style={{ margin: "5px 0", wordBreak: "break-word" }}>
            <strong>Expiry Date:</strong>{" "}
            {member.expiryDate
              ? new Date(member.expiryDate).toLocaleDateString()
              : "N/A"}
          </p>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <h3 style={{ marginBottom: "12px", fontSize: "15px" }}>Select New Package:</h3>
          <div style={{ display: "grid", gap: "8px" }}>
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  padding: "10px",
                  border:
                    selectedPackage === pkg.id ? "2px solid #007bff" : "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                  backgroundColor:
                    selectedPackage === pkg.id ? "#f0f8ff" : "white",
                }}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                <input
                  type="radio"
                  name="package"
                  value={pkg.id}
                  checked={selectedPackage === pkg.id}
                  onChange={() => setSelectedPackage(pkg.id)}
                  style={{ marginRight: "10px", cursor: "pointer", marginTop: "2px", flexShrink: 0 }}
                />
                <div style={{ flex: 1, wordBreak: "break-word" }}>
                  <p style={{ margin: 0, fontWeight: "bold", fontSize: "13px" }}>{pkg.name}</p>
                  <p style={{ margin: "3px 0 0 0", fontSize: "12px", color: "#666" }}>
                    {pkg.duration}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#fee",
              color: "#c00",
              padding: "10px",
              marginBottom: "12px",
              borderRadius: "4px",
              fontSize: "13px",
              wordBreak: "break-word",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#ddd",
              color: "black",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: "bold",
              whiteSpace: "nowrap",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleRenew}
            disabled={loading}
            style={{
              padding: "8px 16px",
              backgroundColor: loading ? "#ccc" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: "bold",
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "Renewing..." : "✅ Renew"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberRenewalModal;
