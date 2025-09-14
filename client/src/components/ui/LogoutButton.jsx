export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch("http://localhost:5001/api/auth/logout", {
      method: "GET",
      credentials: "include",
    });
    window.location.reload(); // Refresh to clear UI
  };

  return (
    <button
      onClick={handleLogout}
      className="log-btn"
    >
      Logout
    </button>
  );
}