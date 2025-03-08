"use client";
import { useEffect, useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ConnectEmbed, TransactionButton, useActiveAccount } from "thirdweb/react";
import { chain } from "../web3/chain";
import Overlay from "../components/ui/Overlay";
import { createThirdwebClient, prepareContractCall, readContract, getContract } from "thirdweb";
import { namesABI } from "../lib/namesABI";
import { sepolia } from "thirdweb/chains";

export default function Home() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedName, setFetchedName] = useState("");

  const router = useRouter();
  const account = useActiveAccount();

  const client = createThirdwebClient({
    clientId: "b1a65889f5717828368b6a3046f24673",
  });

  const contract = getContract({
    client: client,
    chain: sepolia,
    address: "0xda7EaBe604F323987Dbc952BE403c57b16a8a73f",
    abi: namesABI,
  });

  // Function to fetch name from contract
  const fetchName = async () => {
    if (account?.address) {
      try {
        const data = await readContract({
          contract: contract,
          method: "getName",
          params: [account.address],
        });

        console.log("Fetched Name:", data);
        setFetchedName(data);

        if (data !== "") {
          router.push("/join");
        }
      } catch (error) {
        console.error("Error fetching name:", error);
      }
    }
  };

  useEffect(() => {
    if (account?.address) {
      fetchName();
    }
  }, [account?.address]);

  // Function to register name
  const registerAdd = async (name) => {
    if (!account?.address) {
      console.error("No account connected");
      return;
    }

    try {
      if (!fetchedName) {
        return prepareContractCall({
          contract,
          method: "setName",
          params: [name],
        });
      }
    } catch (error) {
      console.error("Error registering name:", error);
    }
  };

  return (
    <main className="w-full flex min-h-[calc(100vh-4.5rem)] bg-[#0e0e10]">
      <Overlay show={isLoading} />

      <div className="w-full flex flex-1">
        {/* Left side content */}
        <div className="w-1/2 py-14 px-8">
          {/* Main heading with vertical line */}
          <div className="flex mb-8">
            <div className="w-1 bg-purple-600 mr-6"></div>
            <h1 className="text-white text-5xl font-bold leading-tight">
              Welcome to Etherial Empire <br />{" "}
              <span className="text-2xl">a Web3 AI Agents Trading Game</span>
            </h1>
          </div>

          {/* Subtext */}
          <p className="text-[#4a9eff] text-xl mb-8">
            Connect your wallet to start playing <br /> the ultimate AI Agents Trading Clash
          </p>

          {/* Multi-step Form */}
          <div className="mt-auto">
            {typeof window !== "undefined" && account && (
              <>
                <h2 className="text-white text-xl mb-4">Name</h2>
                <Input
                  type="text"
                  placeholder="Enter Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#13131a] border-none text-gray-300 h-14 mb-6 w-full max-w-md"
                />
                <TransactionButton transaction={() => registerAdd(name)}>Register</TransactionButton>
              </>
            )}
            <div className="mt-auto flex justify-center">
              {typeof window !== "undefined" && <ConnectEmbed chain={chain} client={client} />}
            </div>
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
