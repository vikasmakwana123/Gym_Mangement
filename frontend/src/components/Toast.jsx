import { useState, useEffect } from "react";

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success", duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  return { toast, showToast };
};

export const Toast = ({ toast }) => {
  if (!toast) return null;

  const bgColor =
    toast.type === "success"
      ? "bg-green-500"
      : toast.type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out z-50`}
    >
      {toast.message}
    </div>
  );
};
