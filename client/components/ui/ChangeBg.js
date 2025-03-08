import React from "react";
import Image from "next/image";

const battlegrounds = [
  { id: 1, name: "Panight", image: "/panight.jpg" },
  { id: 2, name: "Astral", image: "/astral.jpg" },
  { id: 3, name: "Saiman", image: "/saiman.jpg" },
  { id: 4, name: "Eoaalien", image: "/eoaalien.jpg" },
];

const ChangeBg = ({ setSelectedBg, close }) => {
  return (
    <div
      className="absolute inset-0 p-8 z-30 flex flex-col items-center justify-center gap-8"
      style={{ backgroundImage: "url('/landing.jpg')" }}
    >
      <h1 className="text-white text-4xl font-bold leading-tight">
        Choose your <span className="text-purple-600">Battleground</span>
      </h1>

      <div className="grid grid-cols-2 gap-4">
        {battlegrounds.map((bg) => (
          <button
            key={bg.id}
            className="relative rounded-lg overflow-hidden border-4 border-transparent transition-all hover:border-purple-500"
            onClick={() => {
              setSelectedBg(bg.image);
              close();
            }}
          >
            <Image
              src={bg.image}
              alt={bg.name}
              width={300}
              height={150}
              className="w-full h-auto"
            />
            <span className="absolute inset-0 flex items-center justify-center text-white text-xl font-semibold bg-black/40">
              {bg.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChangeBg;
