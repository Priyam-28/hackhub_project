"use client";
import React, { useEffect } from "react";
import { MoveRight } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useState } from "react";
import Image from "next/image";
import { Coins } from "lucide-react";
import { sendTransaction } from "thirdweb";
import { claimTo } from "thirdweb/extensions/erc20";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/navigation";

const Mint = () => {
  const [amount, setAmount] = useState("");
  const [avaxPrice, setAvaxPrice] = useState(0);
  const account = useActiveAccount();
  const router = useRouter();

  const handleConvert = (value) => {
    const ethPrice = 2288.92;
    setAvaxPrice((value * ethPrice).toFixed(2));
  };

  const handleContinue = () => {
    console.log(account, avaxPrice);
  };

  return (
    <>
      <main className="w-full flex min-h-screen bg-[#0e0e10]">
        <div className="w-full container mx-auto flex flex-col">
          <div className="w-full flex flex-1">
            {/* Left side content */}
            <div className="w-1/2 pt-6 pb-8 pr-8">
              {/* Logo */}
              <div className="flex items-center mb-24">
                <Image
                  src="/logo.png"
                  alt="AvaxGods Logo"
                  width={195}
                  height={170}
                />
              </div>

              {/* Main heading with vertical line */}
              <div className="flex mb-12">
                <div className="w-1 bg-purple-600 mr-6"></div>
                <h1 className="text-white text-5xl font-bold leading-tight">
                  Welcome to Avax-Gods <br /> a Web3 NFT Card Game
                </h1>
              </div>

              {/* Subtext */}
              <p className="text-[#4a9eff] text-xl mb-12">
                Convert your ETH to Tan Coins
              </p>

              {/* Multi-step Form */}
              <div className="mt-auto">
                <div className="flex gap-4">
                  <h2 className="text-white text-xl mb-4">ETH Amount</h2>
                  <MoveRight className="text-white" />
                  <h2 className="text-white text-xl mb-4 flex">
                    Billu Coins
                    <span className="ml-1 mt-1">
                      <Coins size={20} />
                    </span>
                  </h2>
                </div>
                <Input
                  type="number"
                  placeholder="Enter ETH Amount"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (e.target.value && !isNaN(Number(e.target.value))) {
                      handleConvert(Number(e.target.value));
                    } else {
                      setAvaxPrice(0);
                    }
                  }}
                  className="bg-[#13131a] text-gray-300 h-14 mb-6 w-full max-w-md"
                  autoFocus
                />
                <div className="mb-4">
                  <h3 className="text-2xl font-semibold text-white">
                    Billu Coin: {avaxPrice}
                  </h3>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    className="bg-[#7F46F0] hover:bg-[#7F46F0]/90 text-white px-8 py-6 rounded-md text-lg cursor-pointer"
                    onClick={handleContinue}
                  >
                    Convert
                  </Button>
                  <span className="text-white text-xl italic">Or</span>
                  <Button
                    className="bg-[#7F46F0] hover:bg-[#7F46F0]/90 text-white px-8 py-6 rounded-md text-lg cursor-pointer"
                    onClick={() => {
                      router.push("/join");
                    }}
                  >
                    Join Battle
                  </Button>
                </div>
              </div>
            </div>

            {/* Right side hero image */}
            <div className="w-1/2 flex items-center min-h-screen">
              <Image
                src="/bg-normal.webp"
                alt="Hero"
                className="object-cover min-h-full w-auto"
                width={600}
                height={800}
                priority
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Mint;
