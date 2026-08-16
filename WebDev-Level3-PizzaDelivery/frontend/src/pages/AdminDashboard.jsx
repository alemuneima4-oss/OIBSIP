import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
    const { token, socket, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inventory, setInventory] = useState([]);
    const [loadingInventory, setLoadingInventory] = useState(true);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get("/orders", { headers: { Authorization: `Bearer ${token}` } });
            setOrders(res.data.orders || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Fetch inventory for admin
    const fetchInventory = async () => {
        try {
            setLoadingInventory(true);
            const res = await api.get("/inventory", { headers: { Authorization: `Bearer ${token}` } });
            setInventory(res.data.items || []);
        } catch (err) {
            console.error("Failed to load inventory:", err);
        } finally {
            setLoadingInventory(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    useEffect(() => {
        if (!socket) return;
        const handler = (payload) => {
            // refresh list on updates
            fetchOrders();
        };

        socket.on("order:status", handler);
        socket.on("order:update", handler);

        return () => {
            socket.off("order:status", handler);
            socket.off("order:update", handler);
        };
    }, [socket]);

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/orders/${id}/status`, { orderStatus: status }, { headers: { Authorization: `Bearer ${token}` } });
            fetchOrders();
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/admin/login");
    };

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
                <button 
                    onClick={handleLogout}
                    style={{
                        padding: '10px 20px',
                        background: '#c62828',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 'bold'
                    }}
                >
                    Logout
                </button>
            </div>
            {loading && <p>Loading orders...</p>}
            {!loading && orders.length === 0 && <p>No orders</p>}
            {!loading && orders.map(o => (
                <div key={o._id} style={{ border: '1px solid #eee', padding: 12, marginBottom: 12, borderRadius: 8, background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div><strong>Order</strong>: {o._id}</div>
                            <div><strong>User</strong>: {o.user?.name || o.user?.email || 'Unknown'}</div>
                            <div><strong>Created</strong>: {new Date(o.createdAt).toLocaleString()}</div>
                            <div><strong>Payment</strong>: {o.paymentStatus}</div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 18, fontWeight: 'bold' }}>${o.totalPrice.toFixed(2)}</div>
                            <div>Qty: {o.quantity}</div>
                        </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <strong>Pizza:</strong> {o.pizza.base} / {o.pizza.sauce} / {o.pizza.cheese} {o.pizza.vegetables && o.pizza.vegetables.length > 0 ? ` / ${o.pizza.vegetables.join(', ')}` : ''}
                    </div>

                    {o.deliveryAddress && (
                        <div style={{ marginTop: 12, padding: 10, background: '#f5f5f5', borderRadius: 4, fontSize: 14 }}>
                            <strong>📍 Delivery Address:</strong>
                            <div style={{ marginTop: 6, color: '#333' }}>
                                <div>{o.deliveryAddress.address}</div>
                                <div>{o.deliveryAddress.city}</div>
                                <div>📱 Phone: {o.deliveryAddress.phoneNumber}</div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                        <label style={{ fontWeight: 'bold' }}>Order Status:</label>
                        <select defaultValue={o.orderStatus} onChange={(e) => updateStatus(o._id, e.target.value)}>
                            <option>Order Received</option>
                            <option>In Kitchen</option>
                            <option>Sent to Delivery</option>
                            <option>Delivered</option>
                            <option>Cancelled</option>
                        </select>
                        <button onClick={() => updateStatus(o._id, o.orderStatus)} style={{ marginLeft: 8 }}>Save</button>
                        <button onClick={() => { if (confirm('Cancel this order?')) updateStatus(o._id, 'Cancelled'); }} style={{ marginLeft: 8, background: '#c62828', color: 'white' }}>Cancel Order</button>
                    </div>
                </div>
            ))}
            
            <section style={{ marginTop: 24 }}>
                <h3>Inventory</h3>
                {loadingInventory && <p>Loading inventory...</p>}

                {!loadingInventory && inventory.length === 0 && <p>No inventory items</p>}

                {!loadingInventory && inventory.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
                        {['base','sauce','cheese','vegetable'].map(cat => (
                            <div key={cat} style={{ background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                                <h4 style={{ textTransform: 'capitalize' }}>{cat}s</h4>
                                {inventory.filter(i => i.category === cat).map(item => {
                                    const low = item.quantity < item.lowStockThreshold;
                                    return (
                                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                                        <div>
                                            <div><strong>{item.name}</strong></div>
                                            <div style={{ fontSize: 12, color: '#666' }}>Unit: {item.unit}</div>
                                            {low && <div style={{ fontSize: 12, color: '#c62828' }}>Low stock</div>}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <button onClick={() => {
                                                const el = document.getElementById(`qty-${item._id}`);
                                                el.value = Math.max(0, Number(el.value || 0) - 1);
                                            }}>-</button>
                                            <input type="number" defaultValue={item.quantity} min={0} id={`qty-${item._id}`} style={{ width: 80, padding: 6 }} />
                                            <button onClick={() => {
                                                const el = document.getElementById(`qty-${item._id}`);
                                                el.value = Number(el.value || 0) + 1;
                                            }}>+</button>
                                            <button onClick={async () => {
                                                const val = Number(document.getElementById(`qty-${item._id}`).value || 0);
                                                try {
                                                    await api.patch(`/inventory/${item._id}`, { quantity: val }, { headers: { Authorization: `Bearer ${token}` } });
                                                    fetchInventory();
                                                } catch (err) {
                                                    console.error(err);
                                                    alert('Failed to update quantity');
                                                }
                                            }}>Save</button>

                                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 8 }}>
                                                <input type="number" defaultValue={item.lowStockThreshold} min={0} id={`th-${item._id}`} style={{ width: 80, padding: 6 }} />
                                                <button onClick={async () => {
                                                    const th = Number(document.getElementById(`th-${item._id}`).value || 0);
                                                    try {
                                                        await api.patch(`/inventory/${item._id}`, { lowStockThreshold: th }, { headers: { Authorization: `Bearer ${token}` } });
                                                        fetchInventory();
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert('Failed to update threshold');
                                                    }
                                                }}>Save Threshold</button>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
};

export default AdminDashboard;
