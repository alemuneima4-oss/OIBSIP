import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const CustomPizza = () => {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [options, setOptions] = useState({ bases: [], sauces: [], cheeses: [], vegetables: [] });
    const [selected, setSelected] = useState({ base: "", sauce: "", cheese: "", vegetables: [], quantity: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setLoading(true);
                const res = await api.get("/inventory/available");
                const items = res.data.items;

                const bases = items.filter(i => i.category === "base");
                const sauces = items.filter(i => i.category === "sauce");
                const cheeses = items.filter(i => i.category === "cheese");
                const vegetables = items.filter(i => i.category === "vegetable");

                setOptions({ bases, sauces, cheeses, vegetables });

                // Auto-select first available options for better UX
                setSelected((s) => ({
                    ...s,
                    base: s.base || (bases[0] && bases[0].name) || "",
                    sauce: s.sauce || (sauces[0] && sauces[0].name) || "",
                    cheese: s.cheese || (cheeses[0] && cheeses[0].name) || "",
                }));

            } catch (err) {
                console.error("Failed to load inventory:", err);
                setError("Unable to load builder options.");
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, []);

    const toggleVegetable = (name) => {
        setSelected((s) => {
            const exists = s.vegetables.includes(name);
            return {
                ...s,
                vegetables: exists ? s.vegetables.filter(v => v !== name) : [...s.vegetables, name],
            };
        });
    };

    const estimatePrice = () => {
        // simple price model
        let price = 5.0; // base
        if (selected.sauce) price += 1.0;
        if (selected.cheese) price += 1.5;
        price += selected.vegetables.length * 0.75;
        return price * selected.quantity;
    };

    const handleProceed = () => {
        // validate selections
        if (!selected.base || !selected.sauce || !selected.cheese) {
            setError("Please choose base, sauce, and cheese before proceeding.");
            return;
        }

        const pizza = {
            base: selected.base,
            sauce: selected.sauce,
            cheese: selected.cheese,
            vegetables: selected.vegetables,
        };

        navigate("/order-summary", { state: { pizza, quantity: selected.quantity, totalPrice: estimatePrice() } });
    };

    return (
        <div className="custom-pizza-page">
            <header>
                <h2>Build Your Own Pizza</h2>
            </header>

            {loading && <p>Loading options...</p>}
            {error && <p>{error}</p>}

            {!loading && !error && (
                <div className="builder-grid">
                    <div className="builder-column">
                        <h3>Bases</h3>
                        {options.bases.map(b => (
                                <label key={b._id} className={selected.base === b.name ? 'selected' : ''} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                    <input style={{ marginRight: 8, width: 16, height: 16, WebkitAppearance: 'radio', MozAppearance: 'radio', appearance: 'radio', accentColor: '#e63946' }} type="radio" name="base" value={b.name} checked={selected.base === b.name} onChange={() => setSelected(s => ({ ...s, base: b.name }))} />
                                    <span>{b.name} ({b.quantity} {b.unit})</span>
                                </label>
                            ))}
                    </div>

                    <div className="builder-column">
                        <h3>Sauces</h3>
                        {options.sauces.map(s => (
                            <label key={s._id} className={selected.sauce === s.name ? 'selected' : ''} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <input style={{ marginRight: 8, width: 16, height: 16, WebkitAppearance: 'radio', MozAppearance: 'radio', appearance: 'radio', accentColor: '#e63946' }} type="radio" name="sauce" value={s.name} checked={selected.sauce === s.name} onChange={() => setSelected(s2 => ({ ...s2, sauce: s.name }))} />
                                <span>{s.name} ({s.quantity} {s.unit})</span>
                            </label>
                        ))}
                    </div>

                    <div className="builder-column">
                        <h3>Cheeses</h3>
                        {options.cheeses.map(c => (
                            <label key={c._id} className={selected.cheese === c.name ? 'selected' : ''} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <input style={{ marginRight: 8, width: 16, height: 16, WebkitAppearance: 'radio', MozAppearance: 'radio', appearance: 'radio', accentColor: '#e63946' }} type="radio" name="cheese" value={c.name} checked={selected.cheese === c.name} onChange={() => setSelected(s => ({ ...s, cheese: c.name }))} />
                                <span>{c.name} ({c.quantity} {c.unit})</span>
                            </label>
                        ))}
                    </div>

                    <div className="builder-column">
                        <h3>Vegetables</h3>
                        {options.vegetables.map(v => (
                            <label key={v._id} className={selected.vegetables.includes(v.name) ? 'selected' : ''} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <input style={{ marginRight: 8, width: 16, height: 16, WebkitAppearance: 'checkbox', MozAppearance: 'checkbox', appearance: 'checkbox', accentColor: '#e63946' }} type="checkbox" name="veg" value={v.name} checked={selected.vegetables.includes(v.name)} onChange={() => toggleVegetable(v.name)} />
                                <span>{v.name} ({v.quantity} {v.unit})</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <div className="builder-actions">
                <label>
                    Quantity:
                    <input type="number" min={1} value={selected.quantity} onChange={(e) => setSelected(s => ({ ...s, quantity: Math.max(1, Number(e.target.value) || 1) }))} />
                </label>

                <div className="price-estimate">Estimated: ${estimatePrice().toFixed(2)}</div>

                <button className="primary-button" onClick={handleProceed}>Proceed to Checkout</button>

                <button className="secondary-button" onClick={() => navigate(-1)}>Cancel</button>
            </div>

        </div>
    );
};

export default CustomPizza;
