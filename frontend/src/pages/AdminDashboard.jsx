import React, { useState, useEffect } from "react";
import axios from "axios";
import PackageSelection from "../components/PackageSelection";
import OrdersManagement from "../components/OrdersManagement";
import MemberRenewalModal from "../components/MemberRenewalModal";
import PrintReportModal from "../components/PrintReportModal";
import ExpiredMembersModal from "../components/ExpiredMembersModal";

const AdminDashboard = ({ adminIdToken, onLogout }) => {
  const [activeTab, setActiveTab] = useState("members"); // "members", "supplements", "orders" or "subscriptions"
  const [members, setMembers] = useState([]);
  const [supplements, setSupplements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [renewalModalMember, setRenewalModalMember] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showExpiredMembersModal, setShowExpiredMembersModal] = useState(false);
  const [dietMembers, setDietMembers] = useState([]);
  const [dietLoading, setDietLoading] = useState(false);
  const [selectedDietMemberId, setSelectedDietMemberId] = useState(null);
  const [dietDetails, setDietDetails] = useState("");
  const [editingDietMemberId, setEditingDietMemberId] = useState(null);

  const [memberFormData, setMemberFormData] = useState({
    email: "",
    password: "",
    name: "",
    packageType: "basic",
  });

  const [supplementFormData, setSupplementFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
  });

  const [notificationFormData, setNotificationFormData] = useState({
    title: "",
    description: "",
  });

  // Fetch all members on mount
  useEffect(() => {
    if (activeTab === "members") {
      fetchMembers();
    } else {
      fetchSupplements();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "notifications" && adminIdToken) {
      fetchNotifications();
    }
  }, [activeTab, adminIdToken]);


  // ============ MEMBERS FUNCTIONS ============

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3000/admin/members",
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminIdToken}`,
          },
        }
      );
      setMembers(response.data.members || []);
      setError("");
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!memberFormData.email || !memberFormData.password || !memberFormData.name) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3000/admin/members/add",
        {
          idToken: adminIdToken,
          email: memberFormData.email,
          password: memberFormData.password,
          name: memberFormData.name,
          packageType: memberFormData.packageType,
        }
      );

      setSuccess(`✅ Member "${memberFormData.name}" added successfully!`);
      setMemberFormData({ email: "", password: "", name: "", packageType: "basic" });
      setShowAddForm(false);

      // Refresh member list
      await fetchMembers();
    } catch (err) {
      setError("❌ Failed to add member: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberId, memberName) => {
    if (!window.confirm(`Delete member "${memberName}"? This cannot be undone!`)) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:3000/admin/members/${memberId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminIdToken}`,
          },
        }
      );

      setSuccess(`✅ Member deleted successfully!`);
      await fetchMembers();
    } catch (err) {
      setError("❌ Failed to delete member: " + err.message);
    }
  };

  const handleMemberFormChange = (e) => {
    const { name, value } = e.target;
    setMemberFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============ SUPPLEMENTS FUNCTIONS ============

  const fetchSupplements = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3000/admin/supplements",
        {
          headers: {
            "Authorization": `Bearer ${adminIdToken}`,
          },
        }
      );
      setSupplements(response.data || []);
      console.log("Fetched Supplements:", response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching supplements:", err);

      setSupplements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplement = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!supplementFormData.name || !supplementFormData.description || !supplementFormData.price || !supplementFormData.image || !supplementFormData.weight) {
      setError("Please fill all required fields including image");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", supplementFormData.name);
      formData.append("description", supplementFormData.description);
      formData.append("price", supplementFormData.price);
      formData.append("weight", supplementFormData.weight);
      formData.append("image", supplementFormData.image);

      const response = await axios.post(
        "http://localhost:3000/admin/add-supplement",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${adminIdToken}`,
          },
        }
      );

      setSuccess(`✅ Supplement "${supplementFormData.name}" added successfully!`);
      setSupplementFormData({ name: "", description: "", price: "", image: null });
      setShowAddForm(false);

      // Refresh supplement list
      await fetchSupplements();
    } catch (err) {
      setError("❌ Failed to add supplement: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSupplementFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setSupplementFormData((prev) => ({
        ...prev,
        image: files[0],
      }));
    } else {
      setSupplementFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // ============ NOTIFICATIONS FUNCTIONS ============


  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3000/notifications",
        {
          headers: {
            "Authorization": `Bearer ${adminIdToken}`,
          },
        }
      );
      setNotifications(response.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNotification = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!notificationFormData.title || !notificationFormData.description) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3000/notifications/add",
        {
          title: notificationFormData.title,
          description: notificationFormData.description,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminIdToken}`,
          },
        }
      );

      setSuccess(`✅ Notification "${notificationFormData.title}" sent successfully!`);
      setNotificationFormData({ title: "", description: "" });
      setShowAddForm(false);

      // Refresh notification list
      await fetchNotifications();
    } catch (err) {
      setError("❌ Failed to add notification: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm("Delete this notification?")) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:3000/notifications/${notificationId}`,
        {
          headers: {
            "Authorization": `Bearer ${adminIdToken}`,
          },
        }
      );

      setSuccess(`✅ Notification deleted successfully!`);
      await fetchNotifications();
    } catch (err) {
      setError("❌ Failed to delete notification: " + err.message);
    }
  };

  // ============ DIET FUNCTIONS ============
  const fetchDietMembers = async () => {
    try {
      setDietLoading(true);
      setError("");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/diet/members`,
        {
          headers: {
            Authorization: `Bearer ${adminIdToken}`,
          },
        }
      );
      setDietMembers(response.data.members || []);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("Failed to load members");
    } finally {
      setDietLoading(false);
    }
  };

  const handleAddDiet = (memberId) => {
    const member = dietMembers.find((m) => m.uid === memberId);
    setEditingDietMemberId(memberId);
    setSelectedDietMemberId(memberId);
    setDietDetails(member?.dietDetails || "");
    setSuccess("");
    setError("");
  };

  const handleSaveDiet = async () => {
    if (!selectedDietMemberId || !dietDetails.trim()) {
      setError("Please enter diet details");
      return;
    }

    try {
      setDietLoading(true);
      setError("");

      await axios.post(
        `${import.meta.env.VITE_API_URL}/diet/add`,
        {
          memberId: selectedDietMemberId,
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
      setEditingDietMemberId(null);
      setSelectedDietMemberId(null);

      // Refresh members list
      await fetchDietMembers();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error saving diet:", err);
      setError(err.response?.data?.error || "Failed to save diet details");
    } finally {
      setDietLoading(false);
    }
  };

  const handleCancelDiet = () => {
    setEditingDietMemberId(null);
    setSelectedDietMemberId(null);
    setDietDetails("");
    setError("");
  };

  // Fetch diet members when diet tab is opened
  useEffect(() => {
    if (activeTab === "diet") {
      fetchDietMembers();
    }
  }, [activeTab]);

  const handleNotificationFormChange = (e) => {
    const { name, value } = e.target;
    setNotificationFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "20px" }}>
      {/* Header */}
      <div style={{
        backgroundColor: "#333",
        color: "white",
        padding: "20px",
        marginBottom: "30px",
        borderRadius: "8px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px",
        flexWrap: "wrap"
      }}>
        <h1 style={{ margin: 0 }}>🏋️ Admin Dashboard</h1>
        <div style={{ display: "flex", gap: "10px" }}>

          <button
            onClick={onLogout}
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-[1000px] mx-auto mb-[30px]">
        <div className="flex flex-col sm:flex-row flex-wrap gap-[10px] border-b-2 border-[#ddd]">
          <button
            onClick={() => { setActiveTab("members"); setShowAddForm(false); }}
            className={`px-[30px] py-[15px] font-bold text-[16px] rounded-t-md cursor-pointer 
        ${activeTab === "members" ? "bg-[#007bff] text-white" : "bg-[#ddd] text-black"}`}
          >
            👥 Members
          </button>
          <button
            onClick={() => { setActiveTab("diet"); setShowAddForm(false); }}
            className={`px-[30px] py-[15px] font-bold text-[16px] rounded-t-md cursor-pointer 
        ${activeTab === "diet" ? "bg-[#007bff] text-white" : "bg-[#ddd] text-black"}`}
          >
            🥗 Diet Management
          </button>
          <button
            onClick={() => { setActiveTab("supplements"); setShowAddForm(false); }}
            className={`px-[30px] py-[15px] font-bold text-[16px] rounded-t-md cursor-pointer 
        ${activeTab === "supplements" ? "bg-[#007bff] text-white" : "bg-[#ddd] text-black"}`}
          >
            💊 Supplements
          </button>
          <button
            onClick={() => { setActiveTab("subscriptions"); setShowAddForm(false); }}
            className={`px-[30px] py-[15px] font-bold text-[16px] rounded-t-md cursor-pointer 
        ${activeTab === "subscriptions" ? "bg-[#007bff] text-white" : "bg-[#ddd] text-black"}`}
          >
            📊 Subscriptions
          </button>
          <button
            onClick={() => { setActiveTab("orders"); setShowAddForm(false); }}
            className={`px-[30px] py-[15px] font-bold text-[16px] rounded-t-md cursor-pointer 
        ${activeTab === "orders" ? "bg-[#007bff] text-white" : "bg-[#ddd] text-black"}`}
          >
            🛒 Orders
          </button>
          <button
            onClick={() => { setActiveTab("notifications"); setShowAddForm(false); }}
            className={`px-[30px] py-[15px] font-bold text-[16px] rounded-t-md cursor-pointer 
        ${activeTab === "notifications" ? "bg-[#007bff] text-white" : "bg-[#ddd] text-black"}`}
          >
            📢 Notifications
          </button>
        </div>
      </div>


      {/* Messages */}
      {error && (
        <div style={{
          backgroundColor: "#fee",
          color: "#c00",
          padding: "12px",
          marginBottom: "15px",
          borderRadius: "4px",
          maxWidth: "1000px",
          margin: "0 auto 15px"
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: "#efe",
          color: "#060",
          padding: "12px",
          marginBottom: "15px",
          borderRadius: "4px",
          maxWidth: "1000px",
          margin: "0 auto 15px"
        }}>
          {success}
        </div>
      )}

      {/* Main Container */}
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* ====== MEMBERS TAB ====== */}
        {activeTab === "members" && (
          <>
            {/* Add Member Button & Print Report Button */}
            <div style={{ marginBottom: "30px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                {showAddForm ? "❌ Cancel" : "➕ Add New Member"}
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                📊 Print Report
              </button>

              <button
                onClick={() => setShowExpiredMembersModal(true)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                ⏰ View Expired
              </button>

              {showAddForm && (
                <div style={{
                  marginTop: "20px",
                  backgroundColor: "white",
                  padding: "25px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                  <h3 style={{ marginTop: 0 }}>Add New Member</h3>
                  <form onSubmit={handleAddMember}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                          Email:
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={memberFormData.email}
                          onChange={handleMemberFormChange}
                          placeholder="member@example.com"
                          required
                          style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            boxSizing: "border-box"
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                          Password:
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={memberFormData.password}
                          onChange={handleMemberFormChange}
                          placeholder="Min 6 characters"
                          required
                          style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            boxSizing: "border-box"
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                          Full Name:
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={memberFormData.name}
                          onChange={handleMemberFormChange}
                          placeholder="John Doe"
                          required
                          style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            boxSizing: "border-box"
                          }}
                        />
                      </div>

                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", marginBottom: "15px", fontWeight: "bold" }}>
                          📦 Select Membership Package:
                        </label>
                        <PackageSelection
                          onPackageSelect={(packageId) =>
                            setMemberFormData((prev) => ({ ...prev, packageType: packageId }))
                          }
                          selectedPackage={memberFormData.packageType}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        marginTop: "20px",
                        padding: "10px 20px",
                        backgroundColor: loading ? "#ccc" : "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "16px",
                        fontWeight: "bold"
                      }}
                    >
                      {loading ? "Adding..." : "✅ Add Member"}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Members List */}
            <div style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <h2 style={{ marginTop: 0 }}>Members ({members.length})</h2>

              {loading && <p style={{ color: "#666" }}>Loading members...</p>}

              {members.length === 0 && !loading && (
                <p style={{ color: "#666" }}>No members yet. Add your first member!</p>
              )}

              {members.length > 0 && (
                <div style={{ overflowX: "auto" }}>
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "20px"
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f0f0f0", borderBottom: "2px solid #ddd" }}>
                        <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
                        <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
                        <th style={{ padding: "12px", textAlign: "left" }}>Package</th>
                        <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
                        <th style={{ padding: "12px", textAlign: "center" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.uid} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "12px" }}>{member.name}</td>
                          <td style={{ padding: "12px" }}>{member.email}</td>
                          <td style={{ padding: "12px" }}>
                            <span style={{
                              backgroundColor: member.packageType === "premium" ? "#ffc107" : "#e0e0e0",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "bold"
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
                              fontSize: "12px",
                              fontWeight: "bold"
                            }}>
                              {member.status}
                            </span>
                          </td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                              <button
                                onClick={() => setRenewalModalMember(member)}
                                disabled={loading}
                                style={{
                                  padding: "6px 10px",
                                  backgroundColor: "#28a745",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: loading ? "not-allowed" : "pointer",
                                  fontSize: "12px",
                                  whiteSpace: "nowrap"
                                }}
                              >
                                🔄 Renew
                              </button>
                              <button
                                onClick={() => handleDeleteMember(member.uid, member.name)}
                                disabled={loading}
                                style={{
                                  padding: "6px 10px",
                                  backgroundColor: "#dc3545",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: loading ? "not-allowed" : "pointer",
                                  fontSize: "12px"
                                }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ====== SUPPLEMENTS TAB ====== */}
        {activeTab === "supplements" && (
          <>
            {/* Add Supplement Button */}
            <div style={{ marginBottom: "30px" }}>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                {showAddForm ? "❌ Cancel" : "➕ Add New Supplement"}
              </button>

              {showAddForm && (
                <div style={{
                  marginTop: "20px",
                  backgroundColor: "white",
                  padding: "25px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                  <h3 style={{ marginTop: 0 }}>Add New Supplement/Product</h3>
                  <form onSubmit={handleAddSupplement}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                          Product Name:
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={supplementFormData.name}
                          onChange={handleSupplementFormChange}
                          placeholder="e.g., Whey Protein"
                          required
                          style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            boxSizing: "border-box"
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                          Price (₹):
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={supplementFormData.price}
                          onChange={handleSupplementFormChange}
                          placeholder="1999"
                          required
                          min="0"
                          step="0.01"
                          style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            boxSizing: "border-box"
                          }}
                        />
                      </div>

                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                          Description:
                        </label>
                        <textarea
                          name="description"
                          value={supplementFormData.description}
                          onChange={handleSupplementFormChange}
                          placeholder="Product details, ingredients, benefits..."
                          required
                          rows="4"
                          style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            boxSizing: "border-box",
                            fontFamily: "Arial"
                          }}
                        />
                      </div>

                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                          Product Image:
                        </label>
                        <input
                          type="file"
                          name="image"
                          onChange={handleSupplementFormChange}
                          accept="image/*"
                          required
                          style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            boxSizing: "border-box"
                          }}
                        />
                        {supplementFormData.image && (
                          <p style={{ color: "#666", marginTop: "8px" }}>
                            ✓ Selected: {supplementFormData.image.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                          Suppliment Weight (in Kgs):
                        </label>
                        <input
                          type="text"
                          name="weight"
                          value={supplementFormData.weight}
                          onChange={handleSupplementFormChange}
                          placeholder="e.g., 1 kg"
                          required
                          style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            boxSizing: "border-box"
                          }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        marginTop: "20px",
                        padding: "10px 20px",
                        backgroundColor: loading ? "#ccc" : "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "16px",
                        fontWeight: "bold"
                      }}
                    >
                      {loading ? "Adding..." : "✅ Add Supplement"}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Supplements List */}
            <div style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <h2 style={{ marginTop: 0 }}>Supplements & Products ({supplements.length})</h2>

              {loading && <p style={{ color: "#666" }}>Loading supplements...</p>}

              {supplements.length === 0 && !loading && (
                <p style={{ color: "#666" }}>No supplements added yet. Add your first supplement!</p>
              )}

              {supplements.length > 0 && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "20px",
                  marginTop: "20px"
                }}>
                  {supplements.map((supplement) => (
                    <div
                      key={supplement.id}
                      style={{
                        backgroundColor: "#f9f9f9",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        overflow: "hidden",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                      }}
                    >
                      {supplement.imageUrl && (
                        <img
                          src={supplement.imageUrl}
                          alt={supplement.name}
                          className="bg-conic-330"
                          style={{
                            width: "100%",
                            height: "200px",
                            objectFit: "contain",

                          }}
                        />
                      )}
                      <div style={{ padding: "15px", borderTop: "1px solid #ddd" }}>
                        <h4 style={{ margin: "0 0 10px 0" }}>{supplement.name}</h4>
                        <p style={{ color: "#666", fontSize: "14px", margin: "0 0 10px 0", lineHeight: "1.4" }}>
                          {supplement.description.substring(0, 100)}...
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{
                            fontSize: "18px",
                            fontWeight: "bold",
                            color: "#28a745"
                          }}>
                            ₹{supplement.price}
                          </span>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${supplement.name}"?`)) {
                                // Delete functionality can be added here
                              }
                            }}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ====== SUBSCRIPTIONS TAB ====== */}
        {activeTab === "subscriptions" && (
          <div style={{
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ marginTop: 0, marginBottom: "30px" }}>📊 Subscription Management</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
              {/* Process Expired Memberships */}
              <div style={{
                backgroundColor: "#f8f9fa",
                padding: "20px",
                borderRadius: "8px",
                border: "2px solid #dc3545"
              }}>
                <h3 style={{ marginTop: 0, color: "#dc3545" }}>🔴 Process Expired Memberships</h3>
                <p style={{ color: "#666", marginBottom: "15px" }}>Archive expired members and send notification emails</p>
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const response = await axios.post(
                        "http://localhost:3000/subscription/process-expired",
                        { adminIdToken },
                        {
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${adminIdToken}`,
                          },
                        }
                      );
                      setSuccess(`✅ ${response.data.message}`);
                    } catch (err) {
                      setError("❌ Error: " + (err.response?.data?.error || err.message));
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: loading ? "#ccc" : "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    fontSize: "14px"
                  }}
                >
                  {loading ? "Processing..." : "🚀 Process Now"}
                </button>
              </div>

              {/* Send Reminder Emails */}
              <div style={{
                backgroundColor: "#f8f9fa",
                padding: "20px",
                borderRadius: "8px",
                border: "2px solid #ffc107"
              }}>
                <h3 style={{ marginTop: 0, color: "#ffc107" }}>⚠️ Send Reminder Emails</h3>
                <p style={{ color: "#666", marginBottom: "15px" }}>Send expiry reminders to members (7 days left)</p>
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const response = await axios.post(
                        "http://localhost:3000/subscription/send-reminders",
                        { adminIdToken },
                        {
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${adminIdToken}`,
                          },
                        }
                      );
                      setSuccess(`✅ ${response.data.message}`);
                    } catch (err) {
                      setError("❌ Error: " + (err.response?.data?.error || err.message));
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: loading ? "#ccc" : "#ffc107",
                    color: "black",
                    border: "none",
                    borderRadius: "4px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    fontSize: "14px"
                  }}
                >
                  {loading ? "Sending..." : "📧 Send Reminders"}
                </button>
              </div>

            </div>

            {/* Info Panel */}
            <div style={{
              backgroundColor: "#e7f3ff",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #b3d9ff",
              marginTop: "20px"
            }}>
              <h4 style={{ marginTop: 0, color: "#004085" }}>ℹ️ Subscription Management Info</h4>
              <ul style={{ margin: "10px 0", color: "#004085", lineHeight: "1.8" }}>
                <li><strong>Process Expired:</strong> Runs automatically every day at 2:00 AM. Manual trigger available here.</li>
                <li><strong>Send Reminders:</strong> Notifies members 7 days before expiry. Runs automatically at 9:00 AM daily.</li>
                <li><strong>Expired Members:</strong> Automatically moved to a separate collection after expiry.</li>
                <li><strong>Email Configuration:</strong> Requires Gmail SMTP setup in .env file.</li>
                <li><strong>Test Package:</strong> 3-minute package available for testing renewal logic.</li>
              </ul>
            </div>
          </div>
        )}

        {/* ====== NOTIFICATIONS TAB ====== */}
        {activeTab === "notifications" && (
          <>
            {/* Add Notification Button */}
            <div style={{ marginBottom: "30px" }}>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#17a2b8",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                {showAddForm ? "❌ Cancel" : "➕ Add New Notification"}
              </button>

              {showAddForm && (
                <div style={{
                  marginTop: "20px",
                  backgroundColor: "white",
                  padding: "25px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                  <h3 style={{ marginTop: 0 }}>📢 Create Notification</h3>
                  <form onSubmit={handleAddNotification}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                          Notification Title:
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={notificationFormData.title}
                          onChange={handleNotificationFormChange}
                          placeholder="e.g., New Supplement Arrived"
                          required
                          style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            boxSizing: "border-box"
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                          Description:
                        </label>
                        <textarea
                          name="description"
                          value={notificationFormData.description}
                          onChange={handleNotificationFormChange}
                          placeholder="Detailed description for the notification..."
                          required
                          rows="5"
                          style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            boxSizing: "border-box",
                            fontFamily: "Arial"
                          }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        marginTop: "20px",
                        padding: "10px 20px",
                        backgroundColor: loading ? "#ccc" : "#17a2b8",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "16px",
                        fontWeight: "bold"
                      }}
                    >
                      {loading ? "Sending..." : "✅ Send Notification"}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <h2 style={{ marginTop: 0 }}>📢 All Notifications ({notifications.length})</h2>

              {loading && <p style={{ color: "#666" }}>Loading notifications...</p>}

              {notifications.length === 0 && !loading && (
                <p style={{ color: "#666" }}>No notifications yet. Create your first notification!</p>
              )}

              {notifications.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      style={{
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #dee2e6",
                        borderRadius: "8px",
                        padding: "20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: "0 0 8px 0", color: "#333" }}>
                          📌 {notification.title}
                        </h4>
                        <p style={{ color: "#666", fontSize: "14px", margin: "0 0 8px 0", lineHeight: "1.5" }}>
                          {notification.description.substring(0, 150)}
                          {notification.description.length > 150 ? "..." : ""}
                        </p>
                        <span style={{ fontSize: "12px", color: "#999" }}>
                          {new Date(notification.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        disabled={loading}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: loading ? "not-allowed" : "pointer",
                          fontSize: "14px",
                          fontWeight: "bold",
                          marginLeft: "15px",
                          whiteSpace: "nowrap"
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ====== DIET TAB ====== */}
        {activeTab === "diet" && (
          <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <h2 style={{ marginTop: 0, marginBottom: "30px" }}>🥗 Manage Member Diet Plans</h2>

            {error && (
              <div style={{
                backgroundColor: "#fee",
                color: "#c00",
                padding: "12px",
                marginBottom: "15px",
                borderRadius: "4px",
                fontSize: "14px",
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                backgroundColor: "#efe",
                color: "#060",
                padding: "12px",
                marginBottom: "15px",
                borderRadius: "4px",
                fontSize: "14px",
              }}>
                {success}
              </div>
            )}

            {editingDietMemberId ? (
              // Diet editing form
              <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "8px" }}>
                <h3 style={{ marginTop: 0 }}>
                  Edit Diet for{" "}
                  <strong>{dietMembers.find((m) => m.uid === editingDietMemberId)?.name}</strong>
                </h3>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                    color: "#333",
                  }}>
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
                    disabled={dietLoading}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: dietLoading ? "#ccc" : "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: dietLoading ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    {dietLoading ? "Saving..." : "💾 Save Diet"}
                  </button>
                  <button
                    onClick={handleCancelDiet}
                    disabled={dietLoading}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: dietLoading ? "not-allowed" : "pointer",
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
                {dietLoading && dietMembers.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                    Loading members...
                  </div>
                ) : dietMembers.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                    No members found
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      marginBottom: "20px",
                    }}>
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
                        {dietMembers.map((member) => (
                          <tr
                            key={member.uid}
                            style={{
                              borderBottom: "1px solid #eee",
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
                                <span style={{
                                  backgroundColor: "#d4edda",
                                  color: "#155724",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                }}>
                                  ✓ Plan Added
                                </span>
                              ) : (
                                <span style={{
                                  backgroundColor: "#fff3cd",
                                  color: "#856404",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                }}>
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
          </div>
        )}

        {/* ====== ORDERS TAB ====== */}
        {activeTab === "orders" && (
          <OrdersManagement adminIdToken={adminIdToken} />
        )}
      </div>

      {/* Renewal Modal */}
      {renewalModalMember && (
        <MemberRenewalModal
          member={renewalModalMember}
          onClose={() => setRenewalModalMember(null)}
          onRenewalSuccess={() => {
            setSuccess("✅ Membership renewed successfully!");
            fetchMembers();
          }}
          adminIdToken={adminIdToken}
        />
      )}

      {/* Print Report Modal */}
      <PrintReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        adminIdToken={adminIdToken}
      />

      {/* Expired Members Modal */}
      <ExpiredMembersModal
        isOpen={showExpiredMembersModal}
        onClose={() => setShowExpiredMembersModal(false)}
        adminIdToken={adminIdToken}
      />
    </div>
  );
};

export default AdminDashboard;
