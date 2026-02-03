import React, { useState, useEffect } from "react";
import "../styles/MembershipStatus.css";

/**
 * MembershipStatus Component
 * Displays user's current membership details, expiry status, and renewal options
 */
const MembershipStatus = ({ memberId }) => {
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMembershipStatus();
  }, [memberId]);

  const fetchMembershipStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/subscription/status/${memberId}`
      );

      if (!response.ok) throw new Error("Failed to fetch membership status");

      const data = await response.json();
      setMembership(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching membership:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="membership-status loading">Loading...</div>;
  }

  if (error) {
    return <div className="membership-status error">Error: {error}</div>;
  }

  if (!membership) {
    return <div className="membership-status error">No membership data found</div>;
  }

  const getStatusBadgeClass = () => {
    if (membership.isExpired) return "expired";
    if (membership.daysRemaining <= 7) return "expiring-soon";
    return "active";
  };

  const getStatusMessage = () => {
    if (membership.isExpired) {
      return "Your membership has expired. Renew now to regain access.";
    }
    if (membership.daysRemaining <= 7) {
      return `Your membership expires in ${membership.daysRemaining} day${
        membership.daysRemaining !== 1 ? "s" : ""
      }. Renew soon!`;
    }
    return `Your membership is active for ${membership.daysRemaining} more days.`;
  };

  return (
    <div className="membership-status-container">
      <div className={`membership-card ${getStatusBadgeClass()}`}>
        <div className="membership-header">
          <h2>Your Membership</h2>
          <span className={`status-badge ${getStatusBadgeClass()}`}>
            {membership.status.toUpperCase()}
          </span>
        </div>

        <div className="membership-details">
          <div className="detail-item">
            <span className="label">Member Name:</span>
            <span className="value">{membership.name}</span>
          </div>

          <div className="detail-item">
            <span className="label">Package Type:</span>
            <span className="value package-badge">{membership.packageType}</span>
          </div>

          <div className="detail-item">
            <span className="label">Expiry Date:</span>
            <span className="value">
              {new Date(membership.expiryDate).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="detail-item">
            <span className="label">Days Remaining:</span>
            <span className={`value days-remaining ${getStatusBadgeClass()}`}>
              {membership.daysRemaining > 0
                ? `${membership.daysRemaining} days`
                : "Expired"}
            </span>
          </div>
        </div>

        <div className={`status-message ${getStatusBadgeClass()}`}>
          {getStatusMessage()}
        </div>

        <div style={{
          backgroundColor: "#e3f2fd",
          padding: "12px",
          borderRadius: "4px",
          marginTop: "15px",
          fontSize: "14px",
          color: "#1565c0",
          textAlign: "center"
        }}>
          💡 <strong>Renewal:</strong> Please contact your gym admin to renew your membership.
        </div>
      </div>
    </div>
  );
};

export default MembershipStatus;
