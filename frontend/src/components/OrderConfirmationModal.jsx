import React, { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import axios from "axios";

const OrderConfirmationModal = ({ onClose, onOrderPlaced }) => {
  const { cart, getTotalPrice, confirmOrder, clearCart, setShowConfirmationModal } =
    useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPrice = getTotalPrice();

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const uid = localStorage.getItem("uid");
      const idToken = localStorage.getItem("idToken");

      if (!uid || !idToken) {
        setError("User not authenticated");
        return;
      }

      const orderData = {
        memberId: uid,
        items: cart.map((item) => ({
          productId: item._id || item.id,
          name: item.name,
          price: item.price,
          description: item.description,
          imageUrl: item.imageUrl,
          quantity: item.quantity || 1,
          type: "supplement"
        })),
        totalPrice: totalPrice,
        status: "confirmed",
        placedAt: new Date().toISOString(),
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/orders/place-order`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        
        confirmOrder();
        clearCart();
        setShowConfirmationModal(false);
        onOrderPlaced && onOrderPlaced(response.data);
      }
    } catch (err) {
      console.error("Error placing order:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to place order"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6">Order Confirmation</h2>

        {}
        <div className="mb-6 max-h-64 overflow-y-auto">
          <h3 className="font-semibold mb-3">Items:</h3>
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex justify-between items-center mb-2 pb-2 border-b"
            >
              <span className="text-sm">{item.name}</span>
              <span className="font-semibold">₹{item.price}</span>
            </div>
          ))}
        </div>

        {}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">Total Price:</span>
            <span className="text-2xl font-bold text-blue-600">₹{totalPrice}</span>
          </div>
        </div>

        {}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span> Processing...
              </>
            ) : (
              "I Confirm Order"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationModal;
