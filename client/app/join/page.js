"use client";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { Input } from "../../components/ui/input";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import AgentCard from "../../components/ui/AgentCard";

export default function JoinBattle() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [battles, setBattles] = useState([]);
  const [battleId, setBattleId] = useState("");
  const [waiting, setWaiting] = useState(false);

  const router = useRouter();

  // Agents array with extra properties for the AgentCard
  const agents = [
    {
      id: 1,
      name: "Agent Alpha",
      description: "Powerful AI with strategic insights.",
      image: "/Ace.png",
      card: 10,
      cardDef: 5,
    },
    {
      id: 2,
      name: "Agent Beta",
      description: "Fast and agile for quick battles.",
      image: "/Furiosa.png",
      card: 9,
      cardDef: 6,
    },
    {
      id: 3,
      name: "Agent Gamma",
      description: "Balanced and resilient in tough fights.",
      image: "/Katara.png",
      card: 11,
      cardDef: 7,
    },
  ];

  const handleCreateBattle = () => {
    if (battleId && battleId > 999 && battleId < 9999) {
      setWaiting(true);
      setTimeout(() => {
        router.push("/battle");
      }, 3000);
    } else {
      toast.error("Please enter a valid battle ID");
    }
  };

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
    <main className="w-full flex min-h-[calc(100vh-4.5rem)] bg-[#0e0e10]">
      {waiting && (
        <div className="absolute top-0 right-0 w-full h-full backdrop-blur-md p-8 z-30 flex flex-col items-center justify-center gap-8">
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
              <span className="font-bold">{selectedAgent.name}</span>
            </p>

            <p className="text-[#4a9eff] text-xl">
              Join an existing battle and start playing
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-white text-xl">Available Battles:</h2>
            {battles.length > 0 ? (
              <div className="flex items-center">
                <p className="text-lg font-light text-white">Battles:</p>
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
              <p className="!text-purple-600 text-lg no-underline hover:text-purple-500">
                Or Create a new Battle
              </p>
              <Input
                type="number"
                value={battleId}
                placeholder="Enter Battle ID (eg. 5124)"
                className="bg-[#13131a] text-gray-300 h-14 mb-3 w-full max-w-md"
                onChange={(e) => setBattleId(e.target.value)}
              />
              {battleId && !isNaN(battleId) && (
                <Button
                  className="bg-[#7F46F0] hover:bg-[#7F46F0]/90 text-white px-8 py-6 rounded-md text-lg cursor-pointer"
                  onClick={handleCreateBattle}
                >
                  Create Battle
                </Button>
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
