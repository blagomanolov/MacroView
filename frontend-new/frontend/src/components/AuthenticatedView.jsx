import { useEffect, useState } from "react";
import Dashboard from "./Dashboard"; 

export default function AuthenticatedView({ user, onLogout }) {
  const [protectedData, setProtectedData] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8000/user/protected", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Not authorized");
        }
        return res.json();
      })
      .then((data) => setProtectedData(data))
      .catch((err) => {
        console.error(err);
        onLogout();
      });
  }, [onLogout]);

  if (showDashboard) {
    return <Dashboard onBack={() => setShowDashboard(false)} />;
  }

  return (
    <div>
      <h2>Welcome {user?.email || "user"}!</h2>
      {protectedData ? (
        <div>
          <p>Protected Data:</p>
          <pre>{JSON.stringify(protectedData, null, 2)}</pre>
        </div>
      ) : (
        <p>Loading data...</p>
      )}

      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => setShowDashboard(true)}>Create Dashboard</button>
        <button onClick={onLogout} style={{ marginLeft: "1rem" }}>
          Logout
        </button>
      </div>
    </div>
  );
}
