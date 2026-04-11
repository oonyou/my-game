import { useState, useRef, useEffect } from "react";

const allBuildings = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Building ${i + 1}`,
  hint: `This is hint for building ${i + 1}`,
  description: `Detailed description of building ${i + 1}`,
  image: "https://via.placeholder.com/150",
  x: Math.random() * 90,
  y: Math.random() * 90,
}));

const difficultySettings = {
  easy: 10,
  medium: 25,
  hard: 50,
};

export default function App() {
  const [difficulty, setDifficulty] = useState("medium");
  const [activeHint, setActiveHint] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [found, setFound] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [gameClear, setGameClear] = useState(false);
  const [time, setTime] = useState(0);

  const buildings = allBuildings.slice(0, difficultySettings[difficulty]);

  // timer
  useEffect(() => {
    if (gameClear) return;
    const timer = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameClear]);

  // check clear
  useEffect(() => {
    if (found.length === buildings.length && buildings.length > 0) {
      setGameClear(true);
    }
  }, [found, buildings]);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setScale((prev) => Math.min(Math.max(0.5, prev + delta), 3));
  };

  const handleMouseDown = (e) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };

  const markAsFound = (b) => {
    if (!found.includes(b.id)) {
      setFound([...found, b.id]);
      setSelectedBuilding(b);
    }
  };

  const changeDifficulty = (level) => {
    setDifficulty(level);
    setFound([]);
    setActiveHint(null);
    setSelectedBuilding(null);
    setGameClear(false);
    setTime(0);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Difficulty</h2>
        <div className="mb-4 space-x-2">
          {Object.keys(difficultySettings).map((level) => (
            <button
              key={level}
              onClick={() => changeDifficulty(level)}
              className={`px-3 py-1 rounded ${
                difficulty === level
                  ? "bg-blue-500 text-white"
                  : "bg-white"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-4">Hints</h2>
        {buildings.map((b) => (
          <button
            key={b.id}
            className={`block w-full text-left p-2 mb-2 rounded shadow ${
              found.includes(b.id)
                ? "bg-green-200 line-through"
                : "bg-white hover:bg-gray-200"
            }`}
            onClick={() => setActiveHint(b.id)}
          >
            {b.id}번 힌트 보기 {found.includes(b.id) && "✔"}
          </button>
        ))}

        {activeHint && (
          <div className="mt-4 p-3 bg-yellow-100 rounded">
            {buildings.find((b) => b.id === activeHint)?.hint}
          </div>
        )}

        <div className="mt-6 text-sm">
          찾은 개수: {found.length} / {buildings.length}
        </div>

        <div className="mt-2 text-sm">⏱️ 시간: {time}s</div>
      </div>

      {/* Map Area */}
      <div
        className="relative w-3/4 bg-blue-200 overflow-hidden"
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          onMouseDown={handleMouseDown}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
            alt="world map"
            className="w-full h-full object-cover select-none pointer-events-none"
            draggable={false}
          />

          {buildings.map((b) => (
            <div
              key={b.id}
              className="absolute"
              style={{ left: `${b.x}%`, top: `${b.y}%` }}
              onMouseEnter={() => setHovered(b.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => markAsFound(b)}
            >
              <div className="w-6 h-6" />

              {hovered === b.id && !found.includes(b.id) && (
                <div className="absolute -top-8 -left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  📍 {b.name}
                </div>
              )}

              {found.includes(b.id) && (
                <div className="absolute -top-6 -left-2 text-green-600 font-bold">
                  ✔
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Popup */}
        {selectedBuilding && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-xl w-80 shadow-lg">
              <h2 className="text-lg font-bold mb-2">
                {selectedBuilding.name}
              </h2>
              <img
                src={selectedBuilding.image}
                alt="building"
                className="w-full h-40 object-cover rounded mb-2"
              />
              <p className="text-sm mb-3">
                {selectedBuilding.description}
              </p>
              <button
                className="w-full bg-blue-500 text-white py-1 rounded"
                onClick={() => setSelectedBuilding(null)}
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {/* Clear Screen */}
        {gameClear && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl text-center shadow-xl">
              <h1 className="text-2xl font-bold mb-4">🎉 YOU WIN!</h1>
              <p className="mb-2">총 시간: {time}초</p>
              <p className="mb-4">난이도: {difficulty}</p>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => changeDifficulty(difficulty)}
              >
                다시하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
