// src/components/LogoutButton.jsx
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function LogoutButton() {
  async function handleLogout() {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "GET",
      credentials: "include",
    });
    setUser(null); // Update state locally
    // Optionally: window.location.reload();
  }

  return (
    <button onClick={handleLogout} className="logout-btn">
      Logout
    </button>
  );
}
