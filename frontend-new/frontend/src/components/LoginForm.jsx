import { useState } from "react";

export default function LoginForm({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data in application/x-www-form-urlencoded format
    const formData = new URLSearchParams({
      username: email, // OAuth2PasswordRequestForm uses "username" field
      password: password,
    });

    try {
      const response = await fetch("http://localhost:8000/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      onLogin(data.user); // Pass user info back to the parent
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
      <p>
        Don’t have an account?{" "}
        <button type="button" onClick={onSwitchToRegister}>
          Register
        </button>
      </p>
    </form>
  );
}
