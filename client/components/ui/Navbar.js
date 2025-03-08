"use client";
import { useActiveAccount } from "thirdweb/react";
import Image from "next/image";
import Link from "next/link";
<ConnectButton client={client} chain={chain} />;
import { ConnectButton, TransactionButton } from "thirdweb/react";
import { client } from "../../web3/client";
import { chain } from "../../web3/chain";
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  toWei,
  readContract,
  toEther,
} from "thirdweb";
import { useState, useEffect } from "react";
import { sepolia } from "thirdweb/chains";
import { testABI } from "../../lib/contractABI";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [balance, setBalance] = useState("0");
  const account = useActiveAccount();
  const pathname = usePathname();
  if (pathname.startsWith("/battle")) {
    console.log("Battle page");
  }

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
    <nav className="flex items-center justify-between h-18 px-8 bg-black shadow-md">
      <div className="flex items-center">
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={150} height={120} priority />
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {account && (
          <div className="flex items-center gap-4 text-sm font-bold">
            <h3 className="text-white text-xl">
              Billu Coins:{" "}
              <span className="text-purple-500">
                {Number(balance).toFixed(2)}
              </span>
            </h3>
            <TransactionButton
              transaction={() => buyToken()}
              onTransactionConfirmed={() => {
                toast.success("Tokens Purchased!");
                getBalance();
              }}
            >
              Buy Tokens
            </TransactionButton>
          </div>
        )}
        <div
          className={
            pathname.startsWith("/battle")
              ? "pointer-events-none opacity-50"
              : ""
          }
        >
          <ConnectButton client={client} chain={chain} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
