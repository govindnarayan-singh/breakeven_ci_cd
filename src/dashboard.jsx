import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  increment
} from "firebase/firestore";

import { auth, db } from "./firebase";
import "./DashboardPage.css";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = auth.currentUser;

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  //  Fetch data
  useEffect(() => {
    const fetchProjects = async () => {
      const q = query(
        collection(db, "breakEvenData"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(docSnap => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          likes: d.likes || 0,
          likedBy: d.likedBy || {},
          ...d
        };
      });

      setProjects(data);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  //  Like
  const handleLike = async (projectId) => {
    if (!user) return;

    const project = projects.find(p => p.id === projectId);
    if (project.likedBy?.[user.uid]) return;

    const ref = doc(db, "breakEvenData", projectId);

    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              likes: p.likes + 1,
              likedBy: { ...p.likedBy, [user.uid]: true }
            }
          : p
      )
    );

    await updateDoc(ref, {
      likes: increment(1),
      [`likedBy.${user.uid}`]: true
    });
  };

  //  Dislike
  const handleDislike = async (projectId) => {
    if (!user) return;

    const project = projects.find(p => p.id === projectId);
    if (!project.likedBy?.[user.uid]) return;

    const ref = doc(db, "breakEvenData", projectId);

    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              likes: Math.max(p.likes - 1, 0),
              likedBy: { ...p.likedBy, [user.uid]: false }
            }
          : p
      )
    );

    await updateDoc(ref, {
      likes: increment(-1),
      [`likedBy.${user.uid}`]: false
    });
  };

  if (loading) return <p className="loading">Loading dashboard…</p>;

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Break-Even Dashboard</h1>

      {/* Top actions */}
      <div className="dashboard-top-actions">
        <Link to="/" title="Back to Calculator">
          <button className="icon-btn blue">❮</button>
        </Link>

        <button className="icon-btn red" onClick={handleLogout}>
          ⏻
        </button>
      </div>

      <div className="dashboard-grid">
        {projects.map(p => {
          const liked = p.likedBy?.[user?.uid];

          return (
            <div className="dashboard-card" key={p.id}>
              <div className="dashboard-card-header">
                {p.productName}
              </div>

              <div className="dashboard-card-body">
                <p><strong>Fixed Costs:</strong> ₹{p.fixedCosts}</p>
                <p><strong>Selling Price:</strong> ₹{p.sellingPrice}</p>
                <p><strong>Variable Cost:</strong> ₹{p.variableCost}</p>
                <p><strong>Units Sold:</strong> {p.unitsSold}</p>

                <hr />

                <p><strong>Contribution Margin:</strong> ₹{p.contributionMargin}</p>
                <p><strong>Break-Even Units:</strong> {Math.round(p.breakEvenUnits)}</p>
                <p><strong>Break-Even Sales:</strong> ₹{p.breakEvenSales.toFixed(2)}</p>

                <p className={p.profitLoss >= 0 ? "profit" : "loss"}>
                  <strong>Profit / Loss:</strong> ₹{p.profitLoss.toFixed(2)}
                </p>

                {/* Like / Dislike */}
                <div className="like-section">
                  {!liked ? (
                    <button
                      className="like-btn"
                      onClick={() => handleLike(p.id)}
                    >
                      ♡ Like
                    </button>
                  ) : (
                    <button
                      className="dislike-btn"
                      onClick={() => handleDislike(p.id)}
                    >
                      👎 Dislike
                    </button>
                  )}
                  <span>{p.likes}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
