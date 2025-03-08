"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { Input } from "../../components/ui/input";
import { useRouter } from "next/navigation";
import AgentCard from "../../components/ui/AgentCard";
import { TransactionButton, useActiveAccount } from "thirdweb/react";
import {
  readContract,
  getContract,
  createThirdwebClient,
  prepareContractCall,
} from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { gameLogicABI } from "../../lib/gameLogicABI";
import toast from "react-hot-toast";

export default function JoinBattle() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [battles, setBattles] = useState([]);
  const [battleId, setBattleId] = useState(""); // for creating battle
  const [waiting, setWaiting] = useState(false);
  const [connectedPlayers, setConnectedPlayers] = useState([]); // connected players list
  const [pushVal, setPushVal] = useState(false); // is false

  const [uint, setUint] = useState(0); // uint is id of the battle

  const account = useActiveAccount();
  const router = useRouter();

  const zeroAddress = "0x0000000000000000000000000000000000000000";

  const client = createThirdwebClient({
    clientId: "b1a65889f5717828368b6a3046f24673",
  });

  const contract = getContract({
    client: client,
    chain: sepolia,
    address: "0x62A42Aee8f3610F606834f02fB3F9080B08EedA0",
    abi: gameLogicABI,
  });

  const JoinBattle = (battle) => {
    return prepareContractCall({
      contract,
      method: "joinGame",
      params: [battle],
    });
  };

  const handleCreateBattle = async (battleId) => {
    return prepareContractCall({
      contract,
      method: "createGame",
      params: [battleId],
    });
  };

  // Removed this function as it was causing the hardcoded battle ID issue
  // The navigation to battles is now managed directly in the transaction confirmations

  const fetchBattles = async () => {
    try {
      if (!account?.address) return;
      const battles = await readContract({
        contract,
        method: "getExistingBattles",
        params: [],
      });
      setBattles(battles);
    } catch (error) {
      console.error("Error fetching battles:", error);
    }
  };

  useEffect(() => {
    fetchBattles();
  }, [account?.address]);

  // Load localStorage states on mount
  useEffect(() => {
    const storedWaiting = localStorage.getItem("waiting");
    if (storedWaiting) {
      setWaiting(storedWaiting === "true");
    }
    const storedAgent = localStorage.getItem("selectedAgent");
    if (storedAgent) {
      try {
        setSelectedAgent(JSON.parse(storedAgent));
      } catch (error) {
        console.error("Error parsing selectedAgent from localStorage", error);
      }
    }
    const storedConfirmed = localStorage.getItem("confirmed");
    if (storedConfirmed) {
      setConfirmed(storedConfirmed === "true");
    }
  }, []);

  // Persist waiting state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("waiting", waiting ? "true" : "false");
  }, [waiting]);

  // Persist selectedAgent state to localStorage when it changes
  useEffect(() => {
    if (selectedAgent) {
      localStorage.setItem("selectedAgent", JSON.stringify(selectedAgent));
    } else {
      localStorage.removeItem("selectedAgent");
    }
  }, [selectedAgent]);

  useEffect(() => {
    localStorage.setItem("confirmed", confirmed ? "true" : "false");
  }, [confirmed]);

  const pushAfterCreation = async (battleId) => {
    try {
      // const idd = await readContract({
      //   contract,
      //   method: "gameIdByName",
      //   params: [battleId],
      // });

      router.push(`/battle/${battleId}`);
    } catch (error) {
      console.error("Error navigating to battle:", error);
      toast.error("Failed to navigate to battle");
    }
  };

  const joinBattleAndNavigate = async (battle) => {
    try {
      await JoinBattle(battle);
      router.push(`/battle/${battle}`);
    } catch (error) {
      console.error("Error joining battle:", error);
      toast.error("Failed to join battle");
    }
  };

  // Agents array with extra properties for the AgentCard
  const agents = [
    {
      id: 1,
      name: "Risky Ross",
      description: "Powerful AI with strategic insights.",
      image: "/Ace.png",
      card: 10,
      cardDef: 5,
    },
    {
      id: 2,
      name: "Speedy Furiosa",
      description: "Fast and agile for quick battles.",
      image: "/Furiosa.png",
      card: 9,
      cardDef: 6,
    },
    {
      id: 3,
      name: "Balanced Bob",
      description: "Balanced and resilient in tough fights.",
      image: "/Katara.png",
      card: 11,
      cardDef: 7,
    },
  ];

  // Agent selection view (before confirmation)
  if (!confirmed) {
    return (
      <main className="w-full flex min-h-[calc(100vh-4.5rem)] bg-[#0e0e10]">
        <div className="w-full flex flex-1">
          {/* Left side content */}
          <div className="w-3/5 pt-6 pb-6 px-8 flex flex-col gap-12">
            <div className="flex flex-col gap-2">
              <div className="flex">
                <div className="w-1 bg-purple-600 mr-6"></div>
                <h1 className="text-white text-4xl font-bold leading-tight">
                  Select Your AI Agent
                </h1>
              </div>
              <p className="text-[#4a9eff] text-xl">
                Choose one of the AI agents to join the battle.
              </p>
            </div>

            {/* AI Agent Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className="cursor-pointer w-fit h-fit"
                >
                  <AgentCard
                    card={agent.card}
                    title={agent.name}
                    restStyles={
                      selectedAgent?.id === agent.id
                        ? "border-2 border-purple-600 shadow-lg shadow-purple-600/30 z-10"
                        : "border border-[#2c2c35]"
                    }
                    cardRef={null}
                    cardDef={agent.cardDef}
                    image={agent.image}
                  />
                </div>
              ))}
            </div>

            {/* Confirm Selection Button */}
            {selectedAgent && (
              <div className="">
                <Button
                  className="bg-[#7F46F0] hover:bg-[#7F46F0]/90 text-white px-8 py-6 rounded-md text-lg cursor-pointer"
                  onClick={() => setConfirmed(true)}
                >
                  Confirm Selection
                </Button>
              </div>
            )}
          </div>

          {/* Right side hero image */}
          <div className="w-2/5 flex items-center h-full">
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

  // Once the selection is confirmed, show the Join a Battle component.
  return (
    <main className="relative w-full flex min-h-[calc(100vh-4.5rem)] bg-[#0e0e10]">
      {waiting && (
        <div className="absolute inset-0 backdrop-blur-lg p-8 z-30 flex flex-col items-center justify-center gap-8">
          <h1 className="text-white text-4xl font-bold leading-tight">
            Waiting for other players...
          </h1>
          <p className="text-white text-xl font-normal leading-tight">
            Please wait while we find a suitable opponent for you.
          </p>
        </div>
      )}
      {/* Main content container */}
      <div className="w-full flex flex-1">
        {/* Left side content */}
        <div className="w-1/2 py-14 px-8 flex flex-col gap-6">
          {/* Main heading with vertical line */}
          <div className="flex mb-4">
            <div className="w-1 bg-purple-600 mr-6"></div>
            <h1 className="text-white text-5xl font-bold leading-tight">
              Join a Battle
            </h1>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[#4a9eff] text-xl">
              You have selected:{" "}
              <span className="font-bold text-purple-600">
                {selectedAgent.name}
              </span>
            </p>

            <p className="text-[#4a9eff] text-xl">
              Join an existing battle and start playing
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-white text-xl">Available Battles:</h2>
            {battles.length > 0 ? (
              <div className="flex flex-col gap-4">
                {battles.map((battle) => (
                  <div
                    key={battle}
                    className="flex items-center gap-4 cursor-pointer w-full max-w-md justify-between"
                  >
                    <p className="text-lg font-light text-white">
                      Battle ID: {battle}
                    </p>
                    <TransactionButton
                      transaction={() => JoinBattle(battle)}
                      onTransactionConfirmed={() => {
                        toast.success("Battle Joined");
                        setWaiting(true);
                        router.push(`/battle/${battle}`);
                      }}
                    >
                      Join
                    </TransactionButton>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center">
                <p className="text-lg font-light text-white">
                  No Battles available: Reload page
                </p>
              </div>
            )}
            <Separator className="my-6 bg-gray-600 w-3" />
            <div className="flex flex-col items-start gap-4">
              <p className="!text-purple-600 text-lg no-underline hover:text-purple-500 font-semibold">
                Or Create a new Battle
              </p>
              <Input
                type="text"
                value={battleId}
                placeholder="Enter Battle Name"
                className="bg-[#13131a] text-gray-300 h-14 mb-3 w-full max-w-md"
                onChange={(e) => setBattleId(e.target.value)}
              />
              {battleId && (
                <TransactionButton
                  transaction={() => handleCreateBattle(battleId)}
                  onTransactionConfirmed={() => {
                    toast.success("Battle Created");
                    fetchBattles();
                    pushAfterCreation(battleId);
                    setBattleId("");
                  }}
                >
                  Create Battle
                </TransactionButton>
              )}
            </div>
          </div>
        </div>

        {/* Right side hero image */}
        <div className="w-1/2 flex items-center h-full">
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