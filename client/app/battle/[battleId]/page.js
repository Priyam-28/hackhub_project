"use client";
import React, { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import Leaderboard from "../../../components/ui/LeaderBoard";
import AgentCard from "../../../components/ui/AgentCard";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../../components/ui/popover";
import toast from "react-hot-toast";
import ChangeBg from "../../../components/ui/ChangeBg";
import {
  readContract,
  getContract,
  createThirdwebClient,
  prepareContractCall,
} from "thirdweb";
import { gameLogicABI } from "../../../lib/gameLogicABI";
import { sepolia } from "thirdweb/chains";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/navigation";

const AgentCardWithPopover = ({ agent, otherAgents }) => {
  const [popoverContent, setPopoverContent] = useState("menu");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const zeroAddress = "0x0000000000000000000000000000000000000000";

  const transactionDetails = [
    "Transaction 1: +5 pts",
    "Transaction 2: -3 pts",
    "Transaction 3: +2 pts",
  ];

  const sabotageAgent = (targetAgent) => {
    toast.success(`Sabotaging ${targetAgent.name}!`);
    setOpen(false);
    setPopoverContent("menu");
  };

  const closePopover = () => {
    setOpen(false);
    setPopoverContent("menu");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) setPopoverContent("menu");
      }}
    >
      <PopoverTrigger asChild>
        <div className="cursor-pointer">
          <AgentCard
            card={agent.card}
            title={agent.name}
            cardRef={null}
            cardDef={agent.cardDef}
            image={agent.image}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="bg-gray-900 border border-blue-600 p-4 rounded-lg shadow-lg max-w-xs">
        {popoverContent === "menu" && (
          <div className="flex flex-col space-y-2">
            <Button
              variant="outline"
              className="cursor-pointer border border-green-500 text-black hover:bg-green-600 hover:text-white"
              onClick={() => setPopoverContent("details")}
            >
              Details
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer border border-red-500 text-black hover:bg-red-600 hover:text-white"
              onClick={() => setPopoverContent("sabotage")}
            >
              Sabotage
            </Button>
          </div>
        )}
        {popoverContent === "details" && (
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-bold text-[#4CD1F7]">
              Transaction Details
            </h3>
            <ul className="list-disc list-inside text-sm text-slate-100">
              {transactionDetails.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
            <div className="flex space-x-2 pt-2">
              <Button onClick={closePopover} className="cursor-pointer">
                Close
              </Button>
            </div>
          </div>
        )}
        {popoverContent === "sabotage" && (
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-bold text-[#4CD1F7]">Sabotage</h3>
            <p className="text-sm text-slate-100">
              Select an agent to sabotage:
            </p>
            <ul className="space-y-1">
              {otherAgents.map((other) => (
                <li key={other.id}>
                  <Button
                    variant="ghost"
                    className="w-full text-left text-slate-100"
                    onClick={() => sabotageAgent(other)}
                  >
                    {other.name}
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex space-x-2 pt-2">
              <Button onClick={closePopover} className="cursor-pointer">
                Close
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

const BattleArena = () => {
  const [showRulesOverlay, setShowRulesOverlay] = useState(false);
  const [showChangeBg, setShowChangeBg] = useState(false);
  const [selectedBg, setSelectedBg] = useState("/panight.jpg");
  const [addresses, setAddresses] = useState([]);
  const [winner, setWinner] = useState(true);

  const account = useActiveAccount();

  const client = createThirdwebClient({
    clientId: "b1a65889f5717828368b6a3046f24673",
  });

  const contract = getContract({
    client: client,
    chain: sepolia,
    address: "0x62A42Aee8f3610F606834f02fB3F9080B08EedA0",
    abi: gameLogicABI,
  });

  const arenaDetails = async () => {
    try {
      const data = await readContract({
        contract,
        method: "getArenaDetails",
        params: ["2"],
      });
      setWinner(data[3]);

      // Ensure data[1] is defined and then convert it to an array.
      if (data[1]) {
        setAddresses(Object.values(data[1]));
      }
    } catch (error) {
      console.error("Error fetching arena details:", error);
    }
  };

  useEffect(() => {
    arenaDetails();
  }, [account?.address]);

  // useEffect(() => {
  //   console.log(addresses[1]);
  //   console.log(typeof addresses);
  //   console.log(winner);
  // }, [addresses]);

  // Function to slice address to first 6 characters
  const slicedAddress = (addr) => {
    return addr ? addr.slice(0, 6) : "N/A";
  };

  // Create the agents array; check if the corresponding address exists
  const agents = [
    {
      id: 1,
      name: addresses[0] ? slicedAddress(addresses[0]) : "N/A",
      image: "/Dusk_Rigger.png",
      card: 10,
      cardDef: 8,
    },
    {
      id: 2,
      name: addresses[1] ? slicedAddress(addresses[1]) : "N/A",
      image: "/Geomancer.png",
      card: 9,
      cardDef: 7,
    },
    {
      id: 3,
      name: addresses[2] ? slicedAddress(addresses[2]) : "N/A",
      image: "/Coalfist.png",
      card: 11,
      cardDef: 9,
    },
    {
      id: 4,
      name: addresses[3] ? slicedAddress(addresses[3]) : "N/A",
      image: "/Desolator.png",
      card: 12,
      cardDef: 10,
    },
  ];

  // Fake leaderboard data
  const leaderboardData = [
    {
      id: 1,
      name: addresses[2] ? slicedAddress(addresses[2]) : "N/A",
      score: 120,
    },
    {
      id: 2,
      name: addresses[0] ? slicedAddress(addresses[0]) : "N/A",
      score: 110,
    },
    {
      id: 3,
      name: addresses[3] ? slicedAddress(addresses[2]) : "N/A",
      score: 95,
    },
    {
      id: 3,
      name: addresses[1] ? slicedAddress(addresses[1]) : "N/A",
      score: 82,
    },
  ];

  useEffect(() => {
    const storedBg = localStorage.getItem("selectedBg");
    if (storedBg) {
      try {
        setSelectedBg(JSON.parse(storedBg));
      } catch (error) {
        console.error("Error parsing selectedBg from localStorage", error);
      }
    }
  }, []);

  // Persist selected background to localStorage when it changes
  useEffect(() => {
    if (selectedBg) {
      localStorage.setItem("selectedBg", JSON.stringify(selectedBg));
    } else {
      localStorage.removeItem("selectedBg");
    }
  }, [selectedBg]);

  return (
    <div className="relative w-full h-screen">
      <Tabs defaultValue="arena" className="w-full h-full">
        {/* Tabs switcher in the top-left corner */}
        <TabsList className="absolute top-4 left-4 flex space-x-2 z-10 bg-black/70 rounded-lg p-2">
          <TabsTrigger value="arena" className="text-neutral-200">
            Arena
          </TabsTrigger>
          <TabsTrigger value="market" className="text-neutral-200">
            Market
          </TabsTrigger>
        </TabsList>

        {/* Arena Tab */}
        <TabsContent value="arena" className="w-full h-full p-0">
          <div
            className="relative w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${selectedBg})` }}
          >
            {showChangeBg && (
              <ChangeBg
                setSelectedBg={setSelectedBg}
                close={() => setShowChangeBg(false)}
              />
            )}

            {/* Show Rules button at top-right */}
            <div className="absolute top-4 right-4 z-20">
              <Button
                variant="outline"
                className="hover:bg-neutral-200 cursor-pointer"
                onClick={() => setShowRulesOverlay(true)}
              >
                Show Rules
              </Button>
            </div>

            {/* Central container */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[70%] h-[80%] bg-black/40 rounded-lg p-8 flex">
                {/* Left: Leaderboard (approx. 1/3 width) */}
                <div className="w-1/3 pr-4 border-r border-gray-600">
                  <Leaderboard data={leaderboardData} />
                </div>
                {/* Right: AI Agent Cards (approx. 2/3 width) */}
                <div className="w-2/3 pl-4">
                  <div className="grid grid-cols-2 gap-4">
                    {agents.map((agent) => (
                      <AgentCardWithPopover
                        key={agent.id}
                        agent={agent}
                        otherAgents={agents.filter((a) => a.id !== agent.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Rules Overlay (covers half of the screen on the right) */}
            {showRulesOverlay && (
              <div className="absolute top-0 right-0 w-1/2 h-full backdrop-blur-3xl p-8 z-20 flex flex-col justify-between">
                <div className="relative">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-3xl font-bold text-white">
                      Game Rules
                    </h2>
                    <Button
                      className="cursor-pointer"
                      onClick={() => setShowRulesOverlay(false)}
                    >
                      Close
                    </Button>
                  </div>
                  <ul className="list-disc list-inside text-white space-y-2">
                    <li>Rule 1: Each player must choose a unique AI agent.</li>
                    <li>
                      Rule 2: Agents have special abilities activated randomly.
                    </li>
                    <li>
                      Rule 3: The battle lasts for 10 minutes or until one agent
                      is defeated.
                    </li>
                    <li>
                      Rule 4: Strategy and quick decisions are the keys to
                      victory.
                    </li>
                    <li>Rule 5: Have fun and play fair!</li>
                  </ul>
                </div>
                <div className="flex gap-2">
                  {!showChangeBg && (
                    <Button
                      variant="primary"
                      onClick={() => setShowChangeBg(true)}
                      className="bg-purple-600 text-white cursor-pointer"
                    >
                      Change Battleground
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    className="hover:bg-red-500 cursor-pointer"
                    onClick={() => {
                      toast.success("Exiting Battle...");
                      setShowRulesOverlay(false);
                    }}
                  >
                    Exit Battle
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Market Tab */}
        <TabsContent value="market" className="w-full h-full p-0">
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            {/* <h1 className="text-white text-4xl">Market</h1> */}
            <iframe
              src="http://localhost:8501"
              width="100%"
              height="600"
              frameBorder="0"
              style={{ border: "none" }}
              allowFullScreen
            ></iframe>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BattleArena;
