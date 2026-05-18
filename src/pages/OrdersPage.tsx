import React, { useEffect, useState } from "react";
import { useData } from "../context/DataContext";

const OrdersPage: React.FC = () => {
  const { orders, refreshData, completeOrder, markDelivered } = useData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => { setLoading(true); await refreshData(); setLoading(false); };
    load();
  }, [refreshData]);

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Orders</h2>
      <table className="w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th>Customer</th>
            <th>Type</th>
            <th>Total</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order: any) => (
            <tr key={order.id}>
              <td>{order.customerName}</td>
              <td>{order.type}</td>
              <td>{order.total}</td>
              <td>{order.status}</td>
              <td>{order.paymentStatus}</td>
              <td>
                {order.status !== "completed" ? (
                  <>
                    <button className="bg-green-500 text-white px-3 py-1 rounded mr-2" onClick={() => markDelivered(order.id)}>Deliver</button>
                    <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => completeOrder(order.id)}>Complete</button>
                  </>
                ) : (
                  <span className="text-gray-500">Completed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersPage;
