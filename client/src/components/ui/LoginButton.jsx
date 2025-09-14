export default function LoginButton() {
  return (
    <button
      onClick={() => (window.location.href = "http://localhost:5001/api/auth/google")}
      className="log-btn"
    >
      Login with Google
    </button>
  );
}