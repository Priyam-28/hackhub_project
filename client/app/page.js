"use client";
import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "../web3/client";
import { chain } from "../web3/chain";
import Overlay from "../components/ui/Overlay";

export default function Home() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const account = useActiveAccount();

  // Handle Registration
  const handleRegister = () => {
    setIsLoading(true);
    router.push("./mint");
  };

  return (
    <main className="w-full flex min-h-screen bg-[#0e0e10]">
      <Overlay show={isLoading} />

      <div className="w-full flex flex-1">
        {/* Left side content */}
        <div className="w-1/2 pt-6 py-8 px-8">
          {/* Main heading with vertical line */}
          <div className="flex mb-12">
            <div className="w-1 bg-purple-600 mr-6"></div>
            <h1 className="text-white text-5xl font-bold leading-tight">
              Welcome to Avax-Gods <br />a Web3 NFT Card Game
            </h1>
          </div>

          {/* Subtext */}
          <p className="text-[#4a9eff] text-xl mb-8">
            Connect your wallet to start playing <br /> the ultimate AI Agents
            Trading Clash
          </p>

          {/* Multi-step Form */}
          <div className="mt-auto">
            {account && (
              <>
                <h2 className="text-white text-xl mb-4">Name</h2>
                <Input
                  type="text"
                  placeholder="Enter Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#13131a] border-none text-gray-300 h-14 mb-6 w-full max-w-md"
                />
                <Button
                  className="bg-[#7F46F0] hover:bg-[#7F46F0]/90 text-white px-8 py-6 rounded-md text-lg cursor-pointer"
                  onClick={handleRegister}
                >
                  Register
                </Button>
              </>
            )}
            <ConnectButton client={client} chain={chain} />
          </div>
        </div>

        {/* Right side hero image */}
        <div className="w-1/2 flex items-center">
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
    </main>
  );
}
