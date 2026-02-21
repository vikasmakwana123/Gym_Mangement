import { db } from "../firebase.js";

export const placeOrder = async (req, res) => {
  try {
    const { memberId, items, totalPrice, status } = req.body;

    if (!memberId || !items || items.length === 0 || !totalPrice) {
      return res.status(400).json({
        error: "Missing required fields: memberId, items, totalPrice",
      });
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const orderData = {
      _id: orderId,
      memberId,
      items,
      totalPrice,
      status: status || "confirmed",
      placedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection("orders").doc(orderId).set(orderData);

    res.status(201).json({
      message: "Order placed successfully",
      order: orderData,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getOrdersByMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required" });
    }

    const ordersSnapshot = await db
      .collection("orders")
      .where("memberId", "==", memberId)
      .get();

    const orders = [];
    ordersSnapshot.forEach((doc) => {
      orders.push({
        _id: doc.id,
        ...doc.data(),
      });
    });

    orders.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));

    res.status(200).json({
      message: "Orders retrieved successfully",
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const ordersSnapshot = await db.collection("orders").get();

    const orders = [];
    for (const doc of ordersSnapshot.docs) {
      const order = {
        _id: doc.id,
        ...doc.data(),
      };

      if (!order.memberName || !order.memberEmail) {
        try {
          const memberDoc = await db.collection("members").doc(order.memberId).get();
          if (memberDoc.exists) {
            const memberData = memberDoc.data();
            order.memberName = memberData.name || "N/A";
            order.memberEmail = memberData.email || "N/A";
          } else {
            order.memberName = "N/A";
            order.memberEmail = "N/A";
          }
        } catch (err) {
          console.error("Error fetching member details for:", order.memberId, err);
          order.memberName = "N/A";
          order.memberEmail = "N/A";
        }
      }

      orders.push(order);
    }

    orders.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));

    res.status(200).json({
      message: "All orders retrieved successfully",
      orders,
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const orderDoc = await db.collection("orders").doc(orderId).get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = {
      _id: orderDoc.id,
      ...orderDoc.data(),
    };

    if (!order.memberName || !order.memberEmail) {
      try {
        const memberDoc = await db.collection("members").doc(order.memberId).get();
        if (memberDoc.exists) {
          const memberData = memberDoc.data();
          order.memberName = memberData.name || "N/A";
          order.memberEmail = memberData.email || "N/A";
        } else {
          order.memberName = "N/A";
          order.memberEmail = "N/A";
        }
      } catch (err) {
        console.error("Error fetching member details:", err);
        order.memberName = "N/A";
        order.memberEmail = "N/A";
      }
    }

    res.status(200).json({
      message: "Order retrieved successfully",
      order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ error: "Order ID and status are required" });
    }

    await db.collection("orders").doc(orderId).update({
      status,
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({
      message: "Order status updated successfully",
      orderId,
      status,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const orderDoc = await db.collection("orders").doc(orderId).get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: "Order not found" });
    }

    await db.collection("orders").doc(orderId).delete();

    res.status(200).json({
      message: "Order deleted successfully",
      orderId,
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: error.message });
  }
};
