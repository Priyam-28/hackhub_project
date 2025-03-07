"use client";
import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "../web3/client";
import { chain } from "../web3/chain";

export default function Home() {
  const [name, setName] = useState("");
  const router = useRouter();

  const account = useActiveAccount();

  // Handle Registration
  const handleRegister = () => {
    router.push("./mint");
  };

  return (
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
                Welcome to Avax-Gods <br />a Web3 NFT Card Game
              </h1>
            </div>

            {/* Subtext */}
            <p className="text-[#4a9eff] text-xl mb-12">
              Connect your wallet to start playing the ultimate AI Agents
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
  );
}
