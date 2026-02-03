import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const { isLoggedIn, role } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [userInfo, setUserInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    fetchUserInfo();
    fetchOrders();
  }, [isLoggedIn]);

  const fetchUserInfo = async () => {
    try {
      const uid = localStorage.getItem("uid");
      const idToken = localStorage.getItem("idToken");

      if (!uid || !idToken) return;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/user/${uid}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      setUserInfo(response.data);
    } catch (err) {
      console.error("Error fetching user info:", err);
      setError("Failed to fetch user information");
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const uid = localStorage.getItem("uid");
      const idToken = localStorage.getItem("idToken");

      if (!uid || !idToken) return;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders/member/${uid}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      setOrders(response.data.orders || []);
      setError("");
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  // Only members can view full profile
  if (role !== "member") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          {role === "admin"
            ? "Admin users cannot access member profiles"
            : "Please log in as a member to view your profile"}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === "info"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Profile Info
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === "orders"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          My Orders
        </button>
      </div>

      {/* Profile Info Tab */}
      {activeTab === "info" && (
        <div className="bg-white rounded-lg shadow-md p-8">
          {userInfo ? (
            <div className="space-y-6">
              <div>
                <label className="text-gray-600 text-sm font-medium">Name</label>
                <p className="text-xl font-semibold text-gray-900">{userInfo.name || "N/A"}</p>
              </div>
              <div>
                <label className="text-gray-600 text-sm font-medium">Email</label>
                <p className="text-lg text-gray-700">{userInfo.email || "N/A"}</p>
              </div>
              <div>
                <label className="text-gray-600 text-sm font-medium">Member Since</label>
                <p className="text-lg text-gray-700">
                  {userInfo.joinDate || userInfo.createdAt 
                    ? new Date(userInfo.joinDate || userInfo.createdAt).toLocaleDateString('en-IN')
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-gray-600 text-sm font-medium">Current Package</label>
                <p className="text-lg font-semibold text-blue-600">
                  {userInfo.packageType ? userInfo.packageType.charAt(0).toUpperCase() + userInfo.packageType.slice(1) : "No Active Package"}
                </p>
              </div>
              {userInfo.expiryDate && (
                <div>
                  <label className="text-gray-600 text-sm font-medium">Membership Expiry Date</label>
                  <p className="text-lg font-semibold text-orange-600">
                    {new Date(userInfo.expiryDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}
              {userInfo.status && (
                <div>
                  <label className="text-gray-600 text-sm font-medium">Status</label>
                  <p className={`text-lg font-semibold ${
                    userInfo.status === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {userInfo.status.charAt(0).toUpperCase() + userInfo.status.slice(1)}
                  </p>
                </div>
              )}
              {userInfo.dietDetails && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="text-gray-600 text-sm font-medium block mb-2">Diet Plan Assigned by Admin</label>
                  <p className="text-gray-800 whitespace-pre-wrap">{userInfo.dietDetails}</p>
                  {userInfo.dietUpdatedAt && (
                    <p className="text-sm text-gray-500 mt-2">
                      Last updated: {new Date(userInfo.dietUpdatedAt).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
              )}
              {!userInfo.dietDetails && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">No diet plan assigned yet. Please contact your admin.</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">Loading profile information...</p>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-center text-gray-600">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 text-lg">No orders yet</p>
              <button
                onClick={() => navigate("/supplements")}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-gray-600 text-sm">Order ID</p>
                      <p className="font-semibold">{order._id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600 text-sm">Order Date</p>
                      <p className="font-semibold">
                        {new Date(order.placedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 text-sm">Status</p>
                      <p className="font-semibold text-green-600">
                        {order.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Total Price</p>
                      <p className="text-xl font-bold text-blue-600">
                        ₹{order.totalPrice}
                      </p>
                    </div>
                  </div>

                  {/* Expandable Items */}
                  <button
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order._id ? null : order._id
                      )
                    }
                    className="text-blue-600 hover:underline text-sm font-semibold"
                  >
                    {expandedOrder === order._id ? "Hide Items" : "Show Items"} (
                    {order.items.length})
                  </button>

                  {expandedOrder === order._id && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-start"
                        >
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              {item.description}
                            </p>
                          </div>
                          <p className="font-semibold">₹{item.price}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
