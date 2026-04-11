import { useState, useRef, useEffect, useMemo } from "react";

const difficultySettings = {
  easy: 10,
  medium: 25,
  hard: 50,
};

// 🌍 lat/lng → %
const toXY = (lat, lng) => ({
  x: (lng + 180) / 360 * 100,
  y: (90 - lat) / 180 * 100,
});

export default function App() {
  // =========================
  // STATE
  // =========================
  const [screen, setScreen] = useState("menu");
  const [difficulty, setDifficulty] = useState("medium");
  const [found, setFound] = useState([]);
  const [gameClear, setGameClear] = useState(false);
  const [time, setTime] = useState(0);

  // 🔥 스캐너 (고정)
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const mapRef = useRef(null);

  // =========================
  // BUILDINGS (실제 위치)
  // =========================
  const allBuildings = useMemo(() => [
    { id: 1, name: "Sagrada Familia", year: 1882, lat: 41.4036, lng: 2.1744 },
    { id: 2, name: "Parthenon", year: -447, lat: 37.9715, lng: 23.7267 },
    { id: 3, name: "Taj Mahal", year: 1632, lat: 27.1751, lng: 78.0421 },
    { id: 4, name: "Eiffel Tower", year: 1887, lat: 48.8584, lng: 2.2945 },
    { id: 5, name: "Sydney Opera House", year: 1959, lat: -33.8568, lng: 151.2153 },
    { id: 6, name: "Louvre Pyramid", year: 1985, lat: 48.8606, lng: 2.3376 },
    { id: 7, name: "Water Cube", year: 2003, lat: 39.9928, lng: 116.3906 },
    { id: 8, name: "Burj Khalifa Area", year: 2010, lat: 25.1972, lng: 55.2744 },
    { id: 9, name: "Statue of Liberty", year: 1886, lat: 40.6892, lng: -74.0445 },
    { id: 10, name: "Colosseum", year: 80, lat: 41.8902, lng: 12.4922 },
  ], []);

  const buildings = allBuildings.slice(0, difficultySettings[difficulty]);

  // =========================
  // TIMER
  // =========================
  useEffect(() => {
    if (screen !== "game" || gameClear) return;
    const t = setInterval(() => setTime((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, [screen, gameClear]);

  // =========================
  // WIN
  // =========================
  useEffect(() => {
    if (found.length === buildings.length && buildings.length > 0) {
      setGameClear(true);
    }
  }, [found, buildings]);

  // =========================
  // DISTANCE (SCAN)
  // =========================
  const getDistance = (b) => {
    const pos = toXY(b.lat, b.lng);

    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return 999;

    const mx = ((mouse.x - rect.left) / rect.width) * 100;
    const my = ((mouse.y - rect.top) / rect.height) * 100;

    const dx = pos.x - mx;
    const dy = pos.y - my;

    return Math.sqrt(dx * dx + dy * dy);
  };

  const isInScan = (b) => getDistance(b) < 1.2;
  const isNearScan = (b) => getDistance(b) < 4;

  // =========================
  // ACTIONS
  // =========================
  const markAsFound = (b) => {
    if (isInScan(b) && !found.includes(b.id)) {
      setFound((p) => [...p, b.id]);
    }
  };

  const changeDifficulty = (level) => {
    setDifficulty(level);
    setFound([]);
    setGameClear(false);
    setTime(0);
  };

  // =========================
  // MENU
  // =========================
  if (screen === "menu") {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#0b0b10] text-white">
        <div className="text-center space-y-6">
          <div className="text-3xl font-black">SELECT MODE</div>

          <div className="flex gap-4">
            <div
              onClick={() => setScreen("difficulty")}
              className="px-6 py-3 bg-pink-500 rounded-xl cursor-pointer"
            >
              GAME MODE
            </div>

            <a href="https://my-game-five-topaz.vercel.app/">
              <div className="px-6 py-3 bg-gray-800 rounded-xl">
                VIEW MODE
              </div>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // DIFFICULTY
  // =========================
  if (screen === "difficulty") {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white flex-col gap-6">
        <div className="text-xl font-bold">SELECT DIFFICULTY</div>

        {Object.keys(difficultySettings).map((l) => (
          <div
            key={l}
            onClick={() => {
              changeDifficulty(l);
              setScreen("game");
            }}
            className="px-6 py-3 bg-pink-500 rounded-xl cursor-pointer"
          >
            {l.toUpperCase()}
          </div>
        ))}
      </div>
    );
  }

  // =========================
  // GAME
  // =========================
  return (
    <div className="w-screen h-screen relative">

      {/* MAP FULL SCREEN */}
      <div
        ref={mapRef}
        className="w-full h-full overflow-hidden bg-blue-200 relative"
        onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
          className="w-full h-full object-cover"
        />

        {/* BUILDINGS */}
        {buildings.map((b) => {
          const pos = toXY(b.lat, b.lng);

          const inScan = isInScan(b);
          const near = isNearScan(b);

          return (
            <div
              key={b.id}
              className="absolute"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              onClick={() => markAsFound(b)}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: "white",
                  opacity: inScan ? 1 : near ? 0.4 : 0.1,
                  boxShadow: inScan
                    ? "0 0 16px #ff4fa3"
                    : near
                    ? "0 0 8px rgba(255,79,163,0.4)"
                    : "none",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* 🔥 SCANNER (항상 보임) */}
      <div
        style={{
          position: "fixed",
          left: mouse.x - 9.4,
          top: mouse.y - 9.4,
          width: 18.8,
          height: 18.8,
          border: "2px solid #ff4fa3",
          background: "rgba(255,79,163,0.08)",
          boxShadow: "0 0 25px rgba(255,79,163,1)",
          pointerEvents: "none",
          zIndex: 999999999,
        }}
      />

      {/* HUD */}
      <div className="absolute top-0 left-0 bg-black/70 text-white p-3 text-xs">
        FOUND {found.length}/{buildings.length}
        <br />
        TIME {time}s
      </div>

      {/* WIN */}
      {gameClear && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white text-black p-6 rounded-xl text-center">
            <div className="text-xl font-bold">YOU WIN 🎉</div>
            <div>TIME: {time}s</div>

            <button
              onClick={() => changeDifficulty(difficulty)}
              className="mt-4 px-4 py-2 bg-pink-500 text-white rounded"
            >
              RESTART
            </button>
          </div>
        </div>
      )}
    </div>
  );
}