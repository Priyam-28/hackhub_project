import Image from "next/image";

const AgentCard = ({ card, title, cardRef, restStyles, cardDef, image }) => {
  const tie = (title || "").toUpperCase();

  return (
    <div>
      <div
        ref={cardRef}
        className={`relative sm:w-[260px] w-[220px] sm:h-fit h-fit z-0 transition-all 
        bg-transparent border-[#2c2c35] 
        hover:bg-[#25252e] hover:shadow-xl hover:shadow-purple-600/20 
        cursor-pointer p-1 ${restStyles}`}
      >
        <Image
          src={image}
          alt="Card Image"
          className="w-full h-[230px] object-contain transition-transform duration-300"
          width={260}
          height={200}
        />

        {/* Left point value */}
        <div className="absolute sm:w-[40px] w-[32px] sm:h-[40px] h-[32px] rounded-[25px] bottom-[29.2%] sm:left-[27.5%] left-[12%] flex items-center justify-center">
          <p className="font-rajdhani text-[14px] font-bold text-yellow-400">
            {card}
          </p>
        </div>

        {/* Right point value */}
        <div className="absolute sm:w-[40px] w-[32px] sm:h-[40px] h-[32px] rounded-[25px] bottom-[29.2%] sm:right-[23%] right-[12%] flex items-center justify-center">
          <p className="font-rajdhani text-[14px] font-bold text-red-700">
            {cardDef}
          </p>
        </div>

        {/* Title text */}
        <div className="absolute w-full bottom-9 left-3 flex items-center justify-center">
          <p className="font-rajdhani text-[14px] font-bold text-white mr-3">
            {tie}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
