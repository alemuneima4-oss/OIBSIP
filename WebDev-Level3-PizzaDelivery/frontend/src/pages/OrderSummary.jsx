import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const OrderSummary = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showTestModal, setShowTestModal] = useState(false);
    const [testOrder, setTestOrder] = useState(null);
    const [deliveryAddress, setDeliveryAddress] = useState({
        address: "",
        city: "",
        phoneNumber: "",
    });

    if (!state || !state.pizza) {
        return <div>No order to review.</div>;
    }

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setDeliveryAddress(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateAddress = () => {
        const { address, city, phoneNumber } = deliveryAddress;
        if (!address || !city || !phoneNumber) {
            setError("Please fill in all delivery address fields");
            return false;
        }
        if (!/^\d{10,}$/.test(phoneNumber)) {
            setError("Please enter a valid phone number (minimum 10 digits)");
            return false;
        }
        return true;
    };

    const handleCheckout = async () => {
        if (!validateAddress()) return;

        try {
            setLoading(true);
            setError("");

            const payload = {
                pizza: state.pizza,
                quantity: state.quantity,
                totalPrice: state.totalPrice,
                deliveryAddress,
            };

            const res = await api.post("/orders/create", payload, { headers: { Authorization: `Bearer ${token}` } });

            const { order, razorpayOrder, testMode } = res.data;

            if (testMode) {
                // In test mode (no Razorpay keys), show a simple test checkout modal
                setTestOrder({ order, razorpayOrder });
                setShowTestModal(true);
                return;
            }

            // Use Razorpay Checkout when keys are present
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "PizzaHub",
                description: `Order ${order._id}`,
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    // Send verification to backend
                    await api.post(
                        "/orders/verify",
                        {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: order._id,
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    alert("Payment success — order placed!");
                    navigate("/dashboard");
                },
                prefill: {},
                notes: {},
                theme: { color: "#F37254" },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error("Checkout error:", err);
            setError(err.response?.data?.message || "Checkout failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="order-summary-page">
            <h2>Order Summary</h2>

            <div className="order-details">
                <p><strong>Base:</strong> {state.pizza.base}</p>
                <p><strong>Sauce:</strong> {state.pizza.sauce}</p>
                <p><strong>Cheese:</strong> {state.pizza.cheese}</p>
                <p><strong>Vegetables:</strong> {state.pizza.vegetables.join(", ") || "None"}</p>
                <p><strong>Quantity:</strong> {state.quantity}</p>
                <p><strong>Total:</strong> ${state.totalPrice.toFixed(2)}</p>
            </div>

            <div style={{ marginTop: 24, marginBottom: 24 }}>
                <h3 style={{ marginBottom: 16 }}>Delivery Address</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    <input
                        type="text"
                        name="address"
                        placeholder="Street Address"
                        value={deliveryAddress.address}
                        onChange={handleAddressChange}
                        style={{ padding: 10, border: '1px solid #ddd', borderRadius: 4 }}
                    />
                    <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={deliveryAddress.city}
                        onChange={handleAddressChange}
                        style={{ padding: 10, border: '1px solid #ddd', borderRadius: 4 }}
                    />
                    <input
                        type="tel"
                        name="phoneNumber"
                        placeholder="Phone Number"
                        value={deliveryAddress.phoneNumber}
                        onChange={handleAddressChange}
                        style={{ padding: 10, border: '1px solid #ddd', borderRadius: 4 }}
                    />
                </div>
            </div>

            {error && <p className="error" style={{ color: '#c62828', marginBottom: 12 }}>{error}</p>}

            <div className="order-actions">
                <button className="primary-button" onClick={handleCheckout} disabled={loading}>Pay & Place Order</button>
                <button className="secondary-button" onClick={() => navigate(-1)}>Back</button>
            </div>

            {showTestModal && testOrder && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: 'white', padding: 20, borderRadius: 8, width: 360 }}>
                        <h3>Test Checkout</h3>
                        <p>Order: {testOrder.order._id}</p>
                        <p>Amount: ${(testOrder.razorpayOrder.amount / 100).toFixed(2)}</p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                            <button onClick={async () => {
                                try {
                                    setLoading(true);
                                    await api.post(
                                        "/orders/verify",
                                        {
                                            razorpay_order_id: testOrder.razorpayOrder.id,
                                            razorpay_payment_id: `test_payment_${testOrder.order._id}`,
                                            razorpay_signature: `test_signature_${testOrder.order._id}`,
                                            orderId: testOrder.order._id,
                                        },
                                        { headers: { Authorization: `Bearer ${token}` } }
                                    );

                                    alert("Test payment accepted — order placed!");
                                    setShowTestModal(false);
                                    navigate("/dashboard");
                                } catch (err) {
                                    console.error(err);
                                    alert("Test verification failed");
                                } finally {
                                    setLoading(false);
                                }
                            }} className="primary-button">Success</button>

                            <button onClick={() => { setShowTestModal(false); alert('Test payment cancelled'); }} className="secondary-button">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderSummary;
