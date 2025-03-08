import React from "react";

const ChangeBg = () => {
  return (
    <div
      className="absolute inset-0 p-8 z-30 flex flex-col items-center justify-center gap-8"
      style={{ backgroundImage: "url('/landing.jpg')" }}
    >
      <h1 className="text-white text-4xl font-bold leading-tight">
        Choose your <span className="text-purple-600">Battleground</span>
      </h1>
      <p className="text-white text-xl font-normal leading-tight">
        Please wait while we find a suitable opponent for you.
      </p>
    </div>
  );
};

export default ChangeBg;
