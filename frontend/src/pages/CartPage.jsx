import React, { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import OrderConfirmationModal from "../components/OrderConfirmationModal";
import { useToast, Toast } from "../components/Toast";

const CartPage = () => {
  const {
    cart,
    removeFromCart,
    clearCart,
    getTotalPrice,
    showConfirmationModal,
    setShowConfirmationModal,
    updateQuantity,
  } = useContext(CartContext);
  const { isLoggedIn, role } = useUser();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  // Redirect if not a member
  if (!isLoggedIn || role !== "member") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">Only members can access the cart</p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const totalPrice = getTotalPrice();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-6">Your cart is empty</p>
          <button
            onClick={() => navigate("/supplements")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                Items ({cart.length})
              </h2>

              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 pb-4 border-b last:border-b-0"
                  >
                    {/* Product Image */}
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 object-contain rounded-lg bg-gray-100"
                    />

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {item.description}
                      </p>
                      <p className="text-lg font-bold text-gray-800 mt-1">
                        ₹{item.price} x {item.quantity || 1} = ₹{(item.price || 0) * (item.quantity || 1)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Continue Shopping Button */}
              <button
                onClick={() => navigate("/supplements")}
                className="mt-6 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setShowConfirmationModal(true)}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Confirm Order
                </button>
                <button
                  onClick={clearCart}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {showConfirmationModal && (
        <OrderConfirmationModal
          onClose={() => setShowConfirmationModal(false)}
          onOrderPlaced={() => navigate("/profile")}
        />
      )}

      {/* Toast Notification */}
      <Toast toast={toast} />
    </div>
  );
};

export default CartPage;
