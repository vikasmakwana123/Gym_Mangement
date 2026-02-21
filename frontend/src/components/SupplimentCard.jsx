import React, { useContext } from "react";
import { CartContext } from "../../context/CartContext";
import { useUser } from "../../context/UserContext";
import { useToast } from "./Toast";

const SupplementCard = ({
  item,
  imageUrl,
  name = "Product Name",
  description = "Description",
  price = 0,
  quantity,
  weight,
}) => {
  const { addToCart, cart, updateQuantity } = useContext(CartContext);
  const { isLoggedIn, role } = useUser();
  const { toast, showToast } = useToast();
  
  const productId = item?.id;
  
  console.log("Product ID:", productId, "Item Name:", item?.name);
  
  const cartItem = cart.find((c) => c?.id === productId);
  const cartQuantity = cartItem?.quantity || 0;
  
  const canAddToCart = isLoggedIn && role === "member";
  
  const handleAddToCart = () => {
    if (!isLoggedIn) {
      alert("Please login to add a product to cart");
      return;
    }
    if (role === "admin") {
      alert("Admins cannot add products to cart");
      return;
    }
    
    if (!productId) {
      alert("Error: Product ID not found");
      return;
    }
    addToCart(item);
    showToast("✅ Successfully added to cart!", "success", 3000);
  };

  return (
    <div className="relative w-full sm:w-[280px] rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">

      {}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 
        border-l-[14px] border-l-transparent
        border-r-[14px] border-r-transparent
        border-b-[14px] border-b-white">
      </div>

      {}
      <div className="bg-zinc-100 rounded-t-2xl p-4">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-[160px] object-contain"
        />
      </div>

      {}
      <div className="p-4 flex justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">
            {description}
          </p>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-lg font-bold text-gray-800">
            ₹{price}
          </span>

          {}
          <span className="text-xs text-gray-400">
            {weight || quantity} kg
          </span>

          {}
          {cartQuantity > 0 ? (
            <div className="mt-3 flex items-center gap-2 bg-gray-900 text-white px-2 py-1 rounded-full">
              <button
                onClick={() => updateQuantity(productId, cartQuantity - 1)}
                className="text-lg font-bold w-6 h-6 flex items-center justify-center hover:bg-gray-700 rounded"
              >
                −
              </button>
              <span className="text-sm font-semibold w-6 text-center">
                {cartQuantity}
              </span>
              <button
                onClick={() => updateQuantity(productId, cartQuantity + 1)}
                className="text-lg font-bold w-6 h-6 flex items-center justify-center hover:bg-gray-700 rounded"
              >
                +
              </button>
            </div>
          ) : (
            <button
              disabled={!canAddToCart}
              onClick={handleAddToCart}
              className={`mt-3 flex items-center gap-1 px-4 py-1.5 rounded-full text-sm transition
      ${!canAddToCart
                  ? "bg-gray-200 text-black cursor-not-allowed "
                  : "bg-gray-900 text-white hover:bg-gray-800"}`}
            >
              <span className="text-lg font-bold">+</span>
              Add
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default SupplementCard;
