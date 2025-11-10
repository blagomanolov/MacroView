import { useState } from "react";

export default function RegisterForm({ onRegister, onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Failed to register");
      }


      const data = await response.json();
      onRegister(data);

    } catch (error) {
      console.error(error);
      alert("Registration failed: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <input type="password" placeholder="Confirm Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
      <button type="submit">Register</button>
      <p>
        Already have an account?{" "}
        <button type="button" onClick={onSwitchToLogin}>Login</button>
      </p>
    </form>
  );
}
