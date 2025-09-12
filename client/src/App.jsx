import { useEffect, useState } from "react";
import { ReactTyped } from "react-typed";
import "./style.css"
import sendIcon from "./assets/top.png";
import downloadIcon from "./assets/download (1).png";
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


  async function fetchImages() {
    const res = await fetch(`${API_URL}/api/images`);
    const data = await res.json();
    setImages(data);
  }

useEffect(() => {
  async function checkAuth() {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include", // 👈 critical
      });
      const data = await res.json();
      setUser(data.authenticated ? data.user : null);
    } catch (err) {
      console.error("Auth check failed:", err);
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
    setGeneratedImage(null); // Reset previous result

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
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      const newImageURL = `${API_URL}${data.url}`; // assuming response has `.url`
      setGeneratedImage(newImageURL);
      setPrompt("");
      await fetchImages();
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
        {/* Header */}
        <h1 className="header-title">
          <ReactTyped
          strings={[
            "Text to image conversion with stable diffusion"
          ]}
          typeSpeed={60}
          backSpeed={30}
        />
        </h1>

        <div className="auth-section">
  {loadingAuth ? (
    <p>Loading...</p>
  ) : user ? (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <img src={user.picture} alt="Avatar" style={{ width: '32px', borderRadius: '50%' }} />
      <span>{user.name}</span>
      <LogoutButton />
    </div>
  ) : (
    <LoginButton />
  )}
</div>


        <p className="intro-text">
  Hey, this chatbot uses <span className="highlight">Stable Diffusion</span> to generate art-like images. 
  Just tell me what’s on your mind and I will paint it for you.
        </p>

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

        {/* Recent Images Slider */}
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
        const recent = images.slice(-10);
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