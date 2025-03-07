"use client";
import React, { useEffect, useState } from "react";
import { MoveRight, Coins } from "lucide-react";
import { Button } from "../../components/ui/button";
import Image from "next/image";
import { useActiveAccount, TransactionButton } from "thirdweb/react";
import { getContract, createThirdwebClient, toEther, toWei, prepareContractCall, readContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { testABI } from "../../lib/contractABI";
import { useRouter } from "next/navigation";

const Mint = () => {
  const [balance, setBalance] = useState("0");
  const account = useActiveAccount();
  const router=useRouter();

  const client = createThirdwebClient({
    clientId: "b1a65889f5717828368b6a3046f24673",
  });

  const contract = getContract({
    client: client,
    chain: sepolia,
    address: "0x3d6e3378b6Fd0A004409E2b7f07d2596a174A624",
    abi: testABI,
  });

  const buyToken = () => {
    return prepareContractCall({
      contract: contract,
      method: "buyTokens",
      params: [],
      value: toWei("0.1"), // Sending 0.1 ETH
    });
  };

  const getBalance = async () => {
    try {
      if (!account?.address) return;
      
      const balance = await readContract({
        contract,
        method: "balanceOf",
        params: [account.address],
      });

      setBalance(toEther(BigInt(balance.toString())));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  useEffect(() => {
    getBalance();
  }, [account?.address]);

  return (
    <>
      <main className="w-full flex min-h-screen bg-[#0e0e10]">
        <div className="w-full container mx-auto flex flex-col">
          <div className="w-full flex flex-1">
            <div className="w-1/2 pt-6 pb-8 pr-8">
              <div className="flex items-center mb-24">
                <Image src="/logo.svg" alt="AvaxGods Logo" width={150} height={150} />
              </div>

              <h1 className="text-white text-5xl font-bold leading-tight">
                Welcome to Avax-Gods <br /> a Web3 NFT Card Game
              </h1>
              <p className="text-[#4a9eff] text-xl mb-12">Convert your ETH to Billu Coins</p>

              <h3 className="text-2xl font-semibold text-white">Billu Coins: {balance}</h3>

              <div className="flex justify-between items-center mt-6">
                <TransactionButton
                  transaction={() => buyToken()} // Wrapped inside an arrow function
                  onTransactionConfirmed={() => {
                    alert("Tokens Purchased!");
                    getBalance(); // Refresh balance after purchase
                  }}
                >
                  Buy Tokens
                </TransactionButton>
                <span className="text-white text-xl">Or</span>
                <Button
                  className="bg-[#7F46F0] hover:bg-[#7F46F0]/90 text-white px-8 py-6 rounded-md text-lg cursor-pointer"
                  onClick={()=>router.push('/join')}
                >
                  Join Battle
                </Button>
              </div>
            </div>

            <div className="w-1/2 flex items-center min-h-screen">
              <Image src="/bg-normal.webp" alt="Hero" className="object-cover min-h-full w-auto" width={600} height={800} priority />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Mint;
