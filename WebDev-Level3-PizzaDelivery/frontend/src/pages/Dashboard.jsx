import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Dashboard = () => {
    const navigate = useNavigate();

    const {
        user,
        logout,
        socket,
    } = useAuth();

    const [pizzas, setPizzas] = useState([]);
    const [loadingPizzas, setLoadingPizzas] = useState(true);
    const [pizzaError, setPizzaError] = useState("");
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [ordersError, setOrdersError] = useState("");

    // ==========================================
    // GET PIZZAS
    // ==========================================

    const fetchPizzas = async () => {
        try {
            setLoadingPizzas(true);
            setPizzaError("");

            const response = await api.get("/pizzas");

            setPizzas(response.data.pizzas);

        } catch (error) {
            console.error("Failed to fetch pizzas:", error);

            setPizzaError(
                error.response?.data?.message ||
                "Unable to load pizzas."
            );

        } finally {
            setLoadingPizzas(false);
        }
    };


    // ==========================================
    // FETCH PIZZAS WHEN PAGE LOADS
    // ==========================================

    useEffect(() => {
        fetchPizzas();
    }, []);

    // Fetch user orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoadingOrders(true);
                const token = localStorage.getItem("token");
                const res = await api.get("/orders/me", { headers: { Authorization: `Bearer ${token}` } });
                setOrders(res.data.orders || []);
            } catch (err) {
                console.error("Failed to load user orders:", err);
                setOrdersError("Unable to load your orders.");
            } finally {
                setLoadingOrders(false);
            }
        };

        fetchOrders();
    }, []);

    // Poll orders every 10s as a fallback when sockets are unavailable
    useEffect(() => {
        if (socket) return; // socket will push updates

        let stopped = false;
        const interval = setInterval(async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await api.get("/orders/me", { headers: { Authorization: `Bearer ${token}` } });
                if (stopped) return;
                setOrders(res.data.orders || []);
            } catch (err) {
                console.error("Polling orders failed:", err);
            }
        }, 10000);

        return () => {
            stopped = true;
            clearInterval(interval);
        };
    }, [socket]);

    // Listen for socket order updates and update local orders list
    useEffect(() => {
        if (!socket) return;

        const handler = (payload) => {
            setOrders(prev => prev.map(o => o._id === payload.orderId ? { ...o, orderStatus: payload.orderStatus } : o));
        };

        socket.on("order:status", handler);
        socket.on("order:update", handler);

        return () => {
            socket.off("order:status", handler);
            socket.off("order:update", handler);
        };
    }, [socket]);

    // Helper: render order progress
    const OrderProgress = ({ status }) => {
        const steps = ["Order Received", "In Kitchen", "Sent to Delivery", "Delivered"];
        const idx = steps.indexOf(status);

        return (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {steps.map((s, i) => {
                    const active = i <= idx;
                    return (
                        <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: 18, height: 18, borderRadius: 9, background: active ? '#e63946' : '#eee', border: '2px solid #fff', boxShadow: active ? '0 0 0 3px rgba(230,57,70,0.08)' : 'none' }} />
                            <div style={{ fontSize: 12, marginTop: 6 }}>{s}</div>
                        </div>
                    );
                })}
            </div>
        );
    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {
        logout();
        navigate("/login");
    };


    return (
        <div className="dashboard-page">

            {/* ==================================
                HEADER
            ================================== */}

            <header className="dashboard-header">

                <div className="dashboard-logo">
                    🍕 PizzaHub
                </div>

                <div className="dashboard-user">

                    <span>
                        Hello, {user?.name}
                    </span>

                    <button
                        onClick={handleLogout}
                        className="logout-button"
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* ==================================
                MAIN CONTENT
            ================================== */}

            <main className="dashboard-content">

                {/* Welcome */}

                <section className="welcome-section">

                    <h1>
                        Welcome, {user?.name}! 👋
                    </h1>

                    <p>
                        Choose your favorite pizza and
                        enjoy a delicious meal.
                    </p>

                </section>


                {/* ==================================
                    USER INFORMATION
                ================================== */}

                <section className="user-card">

                    <h2>
                        Your Account
                    </h2>

                    <div className="user-info">

                        <p>
                            <strong>Name:</strong>{" "}
                            {user?.name}
                        </p>

                        <p>
                            <strong>Email:</strong>{" "}
                            {user?.email}
                        </p>

                        <p>
                            <strong>Role:</strong>{" "}
                            {user?.role}
                        </p>

                    </div>

                </section>


                {/* ==================================
                    PIZZA MENU
                ================================== */}

                <section className="user-card">
                    <h2>Your Orders</h2>

                    {loadingOrders && <p>Loading orders...</p>}
                    {ordersError && <p>{ordersError}</p>}

                    {!loadingOrders && orders.length === 0 && <p>No orders yet.</p>}

                    {!loadingOrders && orders.length > 0 && (
                        <div>
                            {orders.map(o => (
                                <div key={o._id} style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, marginBottom: 8, background: '#fafafa' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div><strong>Order:</strong> {o._id}</div>
                                        <div><strong>Total:</strong> ${o.totalPrice.toFixed(2)}</div>
                                    </div>
                                    <div style={{ marginTop: 8 }}>
                                        <OrderProgress status={o.orderStatus} />
                                    </div>
                                    {o.deliveryAddress && (
                                        <div style={{ marginTop: 12, padding: 10, background: '#fff', borderRadius: 4, fontSize: 14 }}>
                                            <strong>📍 Delivery Address:</strong>
                                            <div style={{ marginTop: 6, color: '#666' }}>
                                                <div>{o.deliveryAddress.address}</div>
                                                <div>{o.deliveryAddress.city}</div>
                                                <div>📱 {o.deliveryAddress.phoneNumber}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                </section>

                <section className="pizza-section">

                    <div className="pizza-section-header">

                        <div>

                            <h2>
                                🍕 Our Pizza Menu
                            </h2>

                            <p>
                                Choose from our delicious
                                selection.
                            </p>

                        </div>

                    </div>


                    {/* Loading */}

                    {loadingPizzas && (
                        <div className="pizza-loading">
                            <div className="spinner"></div>

                            <p>
                                Loading delicious pizzas...
                            </p>
                        </div>
                    )}


                    {/* Error */}

                    {!loadingPizzas && pizzaError && (
                        <div className="pizza-error">

                            <p>
                                {pizzaError}
                            </p>

                            <button
                                onClick={fetchPizzas}
                                className="retry-button"
                            >
                                Try Again
                            </button>

                        </div>
                    )}


                    {/* Pizza Cards */}

                    {!loadingPizzas &&
                        !pizzaError &&
                        pizzas.length > 0 && (

                        <div className="pizza-grid">

                            {pizzas.map((pizza) => (

                                <div
                                    className="pizza-card"
                                    key={pizza._id}
                                >

                                    {/* Image */}

                                    <div className="pizza-image-container">

                                        <img
                                            src={pizza.image}
                                            alt={pizza.name}
                                            className="pizza-image"
                                        />

                                        <span className="pizza-category">
                                            {pizza.category}
                                        </span>

                                    </div>


                                    {/* Content */}

                                    <div className="pizza-card-content">

                                        <h3>
                                            {pizza.name}
                                        </h3>

                                        <p className="pizza-description">
                                            {pizza.description}
                                        </p>


                                        <div className="pizza-card-bottom">

                                            <span className="pizza-price">
                                                ${pizza.price.toFixed(2)}
                                            </span>

                                            <button
                                                className="order-button"
                                                onClick={() => {
                                                    const pizzaOrder = {
                                                        base: pizza.name,
                                                        sauce: "Tomato Sauce",
                                                        cheese: "Mozzarella",
                                                        vegetables: [],
                                                    };

                                                    const totalPrice = pizza.price;

                                                    navigate("/order-summary", { state: { pizza: pizzaOrder, quantity: 1, totalPrice } });
                                                }
                                                }
                                            >
                                                Order
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>
                    )}


                    {/* No pizzas */}

                    {!loadingPizzas &&
                        !pizzaError &&
                        pizzas.length === 0 && (

                        <div className="pizza-error">

                            <p>
                                No pizzas are currently
                                available.
                            </p>

                        </div>
                    )}

                </section>


                {/* ==================================
                    CUSTOM PIZZA
                ================================== */}

                <section className="custom-pizza-card">

                    <div>

                        <h2>
                            🍕 Build Your Own Pizza
                        </h2>

                        <p>
                            Choose your base, sauce,
                            cheese, and vegetables.
                        </p>

                    </div>

                    <button
                        onClick={() =>
                            navigate("/custom-pizza")
                        }
                        className="primary-button"
                    >
                        Build Your Pizza
                    </button>

                </section>

            </main>

        </div>
    );
};

export default Dashboard;