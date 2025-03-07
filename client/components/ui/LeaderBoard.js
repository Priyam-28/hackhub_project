const Leaderboard = ({ data }) => {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-black p-6 rounded-2xl shadow-lg w-full h-full max-w-sm border border-gray-800">
      <div className="flex justify-center gap-2 mb-8">
        <span className="text-2xl ">🏆</span>
        <h2 className="text-2xl font-bold text-[#4CD1F7] text-center custom-text-shadow">
          Leaderboard
        </h2>
      </div>

      <ul className="space-y-3">
        {data.map((item, index) => (
          <li
            key={item.id}
            className="flex items-center justify-between bg-gray-800 p-3 rounded-lg shadow-md border border-gray-700"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg font-semibold text-neon-blue">
                {index + 1}.
              </span>
              <span className="text-white font-medium">{item.name}</span>
            </div>
            <span className="text-neon-green font-semibold">
              {item.score} pts
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
