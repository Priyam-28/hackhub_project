export const gameLogicABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "arenaId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "gameName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "address[4]",
          "name": "players",
          "type": "address[4]"
        }
      ],
      "name": "ArenaCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "arenaId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "winner",
          "type": "address"
        }
      ],
      "name": "BattleCompleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "gameId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "gameName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "host",
          "type": "address"
        }
      ],
      "name": "GameCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "gameName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "address[4]",
          "name": "players",
          "type": "address[4]"
        }
      ],
      "name": "GameFull",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "gameName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "PlayerJoined",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "arenaCounter",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "arenas",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "winner",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "battleCompleted",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "gameName",
          "type": "string"
        }
      ],
      "name": "createGame",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "gameCounter",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "gameIdByName",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "games",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "host",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "arenaId",
          "type": "uint256"
        }
      ],
      "name": "getArenaDetails",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address[4]",
          "name": "",
          "type": "address[4]"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getExistingBattles",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "gameName",
          "type": "string"
        }
      ],
      "name": "joinGame",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]