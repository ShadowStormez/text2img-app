import { useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function LoginButton() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleLogin,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: "outline", size: "large" }
      );
    };

    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) existingScript.remove();
    };
  }, []);

  function handleLogin(response) {
    fetch(`${API_URL}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: response.credential }),
    })
      .then((res) => res.json())
      .then((data) => {
        window.location.reload(); // Trigger re-render after login
      })
      .catch((err) => {
        console.error("Login failed:", err);
        alert("Login failed. Check console.");
      });
  }

  return <div id="googleBtn"></div>;
}