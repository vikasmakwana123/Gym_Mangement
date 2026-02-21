import React, { useState, useEffect } from "react";
import axios from "axios";

const MemberManagement = ({ adminIdToken }) => {
  const [members, setMembers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    packageType: "basic",
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/members`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminIdToken}`,
          },
        }
      );
      setMembers(response.data.members);
      setError("");
    } catch (err) {
      setError("Failed to fetch members: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email || !formData.password || !formData.name) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/members/add`,
        {
          idToken: adminIdToken,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          packageType: formData.packageType,
        }
      );

      setSuccess(`Member "${formData.name}" added successfully!`);
      setFormData({ email: "", password: "", name: "", packageType: "basic" });
      setShowAddForm(false);

      await fetchMembers();
    } catch (err) {
      setError("Failed to add member: " + err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to delete this member?")) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/members/${memberId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminIdToken}`,
          },
        }
      );

      setSuccess("Member deleted successfully!");
      await fetchMembers();
    } catch (err) {
      setError("Failed to delete member: " + err.message);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <h1>Member Management</h1>

      {error && (
        <div style={{
          backgroundColor: "#fee",
          color: "#c00",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "4px"
        }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: "#efe",
          color: "#060",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "4px"
        }}>
          ✅ {success}
        </div>
      )}

      { }
      <div style={{ marginBottom: "30px" }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {showAddForm ? "Cancel" : "+ Add New Member"}
        </button>

        {showAddForm && (
          <form onSubmit={handleAddMember} style={{
            marginTop: "20px",
            backgroundColor: "#f5f5f5",
            padding: "20px",
            borderRadius: "4px"
          }}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Email:
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                placeholder="member@example.com"
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Password:
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleFormChange}
                placeholder="Enter password"
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Full Name:
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="John Doe"
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Package Type:
              </label>
              <select
                name="packageType"
                value={formData.packageType}
                onChange={handleFormChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  boxSizing: "border-box",
                }}
              >
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 20px",
                backgroundColor: loading ? "#ccc" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "16px",
              }}
            >
              {loading ? "Adding..." : "Add Member"}
            </button>
          </form>
        )}
      </div>

      { }
      <div>
        <h2>All Members ({members.length})</h2>

        {loading && <p>Loading members...</p>}

        {members.length === 0 && !loading && (
          <p style={{ color: "#666" }}>No members found. Add your first member!</p>
        )}

        {members.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
            }}>
              <thead>
                <tr style={{ backgroundColor: "#f0f0f0", borderBottom: "2px solid #ddd" }}>
                  <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Package</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Join Date</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr
                    key={member.uid}
                    style={{ borderBottom: "1px solid #eee" }}
                  >
                    <td style={{ padding: "12px" }}>{member.name}</td>
                    <td style={{ padding: "12px" }}>{member.email}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{
                        backgroundColor: member.packageType === "premium" ? "#ffd700" : "#ddd",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}>
                        {member.packageType}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{
                        backgroundColor: member.status === "active" ? "#d4edda" : "#f8d7da",
                        color: member.status === "active" ? "#155724" : "#856404",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}>
                        {member.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      {new Date(member.joinDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button
                        onClick={() => handleDeleteMember(member.uid)}
                        disabled={loading}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: loading ? "not-allowed" : "pointer",
                          fontSize: "14px",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberManagement;
