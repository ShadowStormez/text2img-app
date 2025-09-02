import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [cfgScale, setCfgScale] = useState(7);
  const [steps, setSteps] = useState(30);
  const [size, setSize] = useState("1024");
  const [seed, setSeed] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchImages() {
    const res = await fetch(`${API_URL}/api/images`);
    const data = await res.json();
    setImages(data);
  }

  useEffect(() => { fetchImages(); }, []);

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const width = parseInt(size, 10);
      const height = width;
      const res = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          cfgScale: Number(cfgScale),
          steps: Number(steps),
          seed: seed === "" ? null : Number(seed),
          width,
          height,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setPrompt("");
      setSeed("");
      await fetchImages();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Text → Image (SDXL)</h1>

        <form onSubmit={handleGenerate} className="grid gap-4 bg-white p-4 rounded-2xl shadow">
          <input
            className="border rounded-xl p-3"
            placeholder="Describe the image you want..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="flex items-center gap-2">
              <span className="w-20">CFG</span>
              <input type="number" min="1" max="20" step="0.5" value={cfgScale}
                     onChange={(e) => setCfgScale(e.target.value)}
                     className="border rounded p-2 w-full" />
            </label>

            <label className="flex items-center gap-2">
              <span className="w-20">Steps</span>
              <input type="number" min="1" max="50" value={steps}
                     onChange={(e) => setSteps(e.target.value)}
                     className="border rounded p-2 w-full" />
            </label>

            <label className="flex items-center gap-2">
              <span className="w-20">Seed</span>
              <input type="number" value={seed} onChange={(e) => setSeed(e.target.value)}
                     placeholder="random" className="border rounded p-2 w-full" />
            </label>

            <label className="flex items-center gap-2">
              <span className="w-20">Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value)}
                      className="border rounded p-2 w-full">
                <option value="512">512×512</option>
                <option value="768">768×768</option>
                <option value="1024">1024×1024</option>
              </select>
            </label>
          </div>

          <button
            disabled={loading}
            className="bg-black text-white rounded-xl px-4 py-3 disabled:opacity-50">
            {loading ? "Generating…" : "Generate"}
          </button>
        </form>

        <h2 className="text-xl font-semibold mt-8 mb-3">Recent images</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="bg-white rounded-xl shadow overflow-hidden">
              <img src={`${API_URL}${img.url}`} alt={img.prompt} className="w-full h-64 object-cover" />
              <div className="p-3 text-sm">
                <div className="font-medium line-clamp-2">{img.prompt}</div>
                <div className="text-gray-500 mt-1">{new Date(img.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}