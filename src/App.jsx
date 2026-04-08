import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";
import "./AppPage.css";

function App() {
  const navigate = useNavigate();

  const [productName, setProductName] = useState("");
  const [fixedCosts, setFixedCosts] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [variableCost, setVariableCost] = useState("");
  const [unitsSold, setUnitsSold] = useState("");

  const [error, setError] = useState("");

  const contributionMargin =
    sellingPrice && variableCost ? sellingPrice - variableCost : 0;

  const breakEvenUnits =
    contributionMargin > 0 ? fixedCosts / contributionMargin : 0;

  const breakEvenSales = breakEvenUnits * sellingPrice;
  const profitLoss = unitsSold * contributionMargin - fixedCosts;

  // VALIDATION + SAVE
  const saveToFirestore = async () => {
    // Clear previous error
    setError("");

    // validation
    if (
      !productName.trim() ||
      fixedCosts === "" ||
      sellingPrice === "" ||
      variableCost === "" ||
      unitsSold === ""
    ) {
      setError("Please fill in all fields before saving.");
      return;
    }

    if (sellingPrice <= variableCost) {
      setError("Selling price must be greater than variable cost.");
      return;
    }

    if (fixedCosts < 0 || sellingPrice < 0 || variableCost < 0 || unitsSold < 0) {
      setError("Values cannot be negative.");
      return;
    }

    try {
      await addDoc(collection(db, "breakEvenData"), {
        productName,
        fixedCosts: Number(fixedCosts),
        sellingPrice: Number(sellingPrice),
        variableCost: Number(variableCost),
        unitsSold: Number(unitsSold),
        contributionMargin,
        breakEvenUnits,
        breakEvenSales,
        profitLoss,
        createdAt: Timestamp.now(),
        likes: 0,
      });

      navigate("/dashboard");
    } catch (err) {
      setError("Something went wrong while saving. Please try again.");
    }
  };

  return (
    <div className="app-page">
      <div className="app-container">
        <header className="app-header">
          <h1>Break-Even Calculator</h1>
          <p>Analyze costs, pricing, and profitability instantly</p>
        </header>

        {/* INPUT CARD */}
        <section className="card">
          <h2>Input Details</h2>

          <div className="form-grid">
            <div>
              <label>Product Name</label>
              <input
                value={productName}
                placeholder="Eg. Product A"
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            <div>
              <label>Fixed Costs (₹)</label>
              <input
                type="number"
                value={fixedCosts}
                onChange={(e) => setFixedCosts(e.target.value)}
              />
            </div>

            <div>
              <label>Selling Price (₹)</label>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
              />
            </div>

            <div>
              <label>Variable Cost (₹)</label>
              <input
                type="number"
                value={variableCost}
                onChange={(e) => setVariableCost(e.target.value)}
              />
            </div>

            <div>
              <label>Units Sold</label>
              <input
                type="number"
                value={unitsSold}
                onChange={(e) => setUnitsSold(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* RESULT CARD */}
        <section className="card">
          <h2>Break-Even Analysis</h2>

          <div className="result-row">
            <span>Contribution Margin</span>
            <strong>₹{contributionMargin}</strong>
          </div>

          <div className="result-row">
            <span>Break-Even Units</span>
            <strong>{breakEvenUnits.toFixed(0)}</strong>
          </div>

          <div className="result-row">
            <span>Break-Even Sales</span>
            <strong>₹{breakEvenSales.toFixed(2)}</strong>
          </div>

          <div className="result-row">
            <span>Profit / Loss</span>
            <strong className={profitLoss >= 0 ? "profit" : "loss"}>
              ₹{profitLoss.toFixed(2)}
            </strong>
          </div>

          {/* ERROR MESSAGE */}
          {error && <div className="error-box">{error}</div>}

          <button className="primary-btn" onClick={saveToFirestore}>
            Save & View Dashboard
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate("/dashboard")}
          >
            View Dashboard
          </button>
        </section>
      </div>
    </div>
  );
}

export default App;
