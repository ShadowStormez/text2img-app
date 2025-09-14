import { useEffect, useState } from "react";
import { ReactTyped } from "react-typed";
import "./style.css"
import sendIcon from "./assets/top.png";
import downloadIcon from "./assets/download (1).png";
import googleIcon from "./assets/google.png";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import LoginButton from "./components/ui/LoginButton";
import LogoutButton from "./components/ui/LogoutButton";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false); // 👈 NEW


  async function fetchImages() {
  const res = await fetch(`${API_URL}/api/images`, {
    credentials: "include", // 👈 THIS WAS MISSING!
  });
  const data = await res.json();
  setImages(data); // Now data will be an array if successful
}

useEffect(() => {
  async function checkAuth() {
    setLoadingAuth(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include", // 👈 CRITICAL: sends cookies
      });
      const data = await res.json();

      if (data.authenticated) {
        setUser(data.user); // { id, name, email, picture }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setUser(null);
    } finally {
      setLoadingAuth(false);
    }
  }

  checkAuth();
}, []);

  useEffect(() => {
    fetchImages();
  }, []);

  async function handleGenerate(e) {
  e.preventDefault();
  setLoading(true);
  setGeneratedImage(null);

  try {
    const res = await fetch(`${API_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        cfgScale: 7,
        steps: 30,
        seed: null,
        width: 1024,
        height: 1024,
      }),
      credentials: "include", // 👈 ADD THIS!
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Generation failed");

    const newImageURL = `${API_URL}${data.url}`;
    setGeneratedImage(newImageURL);
    setPrompt("");
    await fetchImages(); // This will now work because we fixed credentials above
  } catch (err) {
    alert(err.message);
  } finally {
    setLoading(false);
  }
}
function ImageModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  async function handleDownload() {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "generated-image.png"; // You can customize the filename
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download image.");
      console.error(err);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Preview" className="modal-image" />
        <button onClick={handleDownload} className="download-btn"><img src={downloadIcon} alt="down" className="download-btn-img"/></button>
      </div>
    </div>
  );
}


  return (
    <div className="main">
      <div className="content">

        {!user && !loadingAuth && (
          <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Welcome dear</h2>
              <p>Please log in to generate art with Stable Diffusion.</p>
              <button
                onClick={() => (window.location.href = `${API_URL}/api/auth/google`)}
                className="log-btn"
              >
                <div className="login-text">
                  <img src={googleIcon} alt="google-icon" width={24}  height={24}/>
                  Login with Google
                </div>
                
              </button>
            </div>
          </div>
        )}
        {user ? (
            <nav className="navbar">
          <div className="nav-left">
            {user ? (
              <>
                <img src={user.picture} alt="Avatar" className="nav-avatar" />
                <span className="nav-username">{user.name}</span>
              </>
            ) : (
              null
            )}
          </div>
          <div className="nav-right">
            {user ? <LogoutButton /> : null}
          </div>
        </nav>
        ) : null}
        
        {/* Header */}
        <div className="big-three">
        <h1 className="header-title">
          <ReactTyped
          strings={[
            "Text to image conversion with stable diffusion"
          ]}
          typeSpeed={60}
          backSpeed={30}
        />
        </h1>

        {/* Intro Text — Only shown when NOT loading AND no image generated */}
        {!loading && !generatedImage && (
          <div className="intro-text">
            {user ? (
              <>
                <h2>Hey, <strong className="highlight">{user.name.split(" ")[0]}</strong> 👋🏻</h2>
                <p>This chatbot uses{' '}
                <span className="highlight">Stable Diffusion</span> to generate art-like images. 
                Just tell me what’s on your mind and I will paint it for you.</p>
              </>
            ) : (
              <>
                <h2>Hey there 👋🏻</h2> 
                <p>
                  This chatbot uses{' '}
                <span className="highlight">Stable Diffusion</span> to generate art-like images. 
                Log in to create your own masterpieces.
                </p>
              </>
            )}
          </div>
        )}

        {/* Generated Image Preview */}
        {loading ? (
          <div className="loading-container">
            <DotLottieReact
              src="https://lottie.host/a5df2229-45ad-4d9d-b0f6-6a52220bc56d/3nqLXHcTgD.lottie"
              loop
              autoplay
              style={{ width: "150px", height: "150px", margin: "auto" }}
            />
            <p>Workin' on it...</p>
          </div>
        ) : (
          generatedImage && (
            <div className="generated-image-container" onClick={() => setModalImage(generatedImage)}>
              <img src={generatedImage} alt="Generated" className="generated-image" />
            </div>
          )
        )}
        
        {/* Input Form */}
        <form onSubmit={handleGenerate} className="generation-form">
          <div className="chat-box">
          <input
            type="text"
            className="text-input"
            placeholder="Type anything..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="generate-btn" disabled={loading}>
          <img src={sendIcon} alt="send" className="send-icon" />
          </button>
        </div>
        </form>
        </div>

      {/* Recent Images Slider - Only show if there are images */}
{images.length > 0 && (
  <section className="recent-images-section">
    <h2 className="section-title">Recent images</h2>

    <Carousel
      opts={{ loop: true, align: "start" }}
      plugins={[
        Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: false })
      ]}
      className="carousel"
    >
      <CarouselContent className="carousel-content">
        {(() => {
          const recent = Array.isArray(images) ? images.slice(-10) : [];
          return recent.map((img, index) => (
            <CarouselItem
              key={`${img.id}-${index}`}
              className="pl-4 shrink-0 grow-0 basis-[320px]"
            >
              <div 
                className="slider-item" 
                data-tooltip={`${img.prompt} • ${new Date(img.createdAt).toLocaleDateString()}`}
                onClick={() => setModalImage(`${API_URL}${img.url}`)}
              >
                <img
                  src={`${API_URL}${img.url}`}
                  alt={img.prompt}
                  className="slider-image"
                />
              </div>
            </CarouselItem>
          ));
        })()}
      </CarouselContent>
    </Carousel>
  </section>
)}
<footer className="footer">
        <p className="footer-text">
          Designed and coded by{" "}
          <a 
            href="https://github.com/Shadowstormez" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-link"
          >
            Aria Tehrani
          </a>
        </p>
      </footer>

      </div>
      <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />
    </div>
    
  );
}