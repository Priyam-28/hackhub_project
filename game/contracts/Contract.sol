// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BattleArena {
    struct Game {
        uint256 id;
        string name;
        address host;
        address[] players;
        bool isActive;
    }

    struct Arena {
        uint256 id;
        address[4] players;
        address winner;
        bool battleCompleted;
    }

    mapping(uint256 => Game) public games;
    mapping(string => uint256) public gameIdByName;
    mapping(uint256 => Arena) public arenas;
    uint256 public gameCounter;
    uint256 public arenaCounter;

    string[] private existingBattles;

    // Events
    event GameCreated(uint256 gameId, string gameName, address host);
    event PlayerJoined(string gameName, address player);
    event GameFull(string gameName, address[4] players);
    event ArenaCreated(uint256 arenaId, string gameName, address[4] players);
    event BattleCompleted(uint256 arenaId, address winner);

    function createGame(string memory gameName) public {
        // Ensure game name doesn't already exist
        require(gameIdByName[gameName] == 0, "Game with this name already exists");
        
        gameCounter++;
        
        address[] memory initialPlayers = new address[](1);
        initialPlayers[0] = msg.sender;
        
        games[gameCounter] = Game({
            id: gameCounter,
            name: gameName,
            host: msg.sender,
            players: initialPlayers,
            isActive: true
        });
        
        // Map game name to game ID for easier lookup
        gameIdByName[gameName] = gameCounter;
        
        // Add to existing battles list
        existingBattles.push(gameName);
        
        emit GameCreated(gameCounter, gameName, msg.sender);
    }
    
    function joinGame(string memory gameName) public {
        uint256 gameId = gameIdByName[gameName];
        
        // Check if game exists
        require(gameId > 0, "Game does not exist");
        
        Game storage game = games[gameId];
        
        // Check if game is active
        require(game.isActive, "Game is not active");
        
        // Check if player is already in the game
        for (uint i = 0; i < game.players.length; i++) {
            require(game.players[i] != msg.sender, "Player already in game");
        }
        
        // Add player to the game
        game.players.push(msg.sender);
        
        emit PlayerJoined(gameName, msg.sender);
        
        // Check if game is now full (4 players)
        if (game.players.length == 4) {
            // Mark game as inactive
            game.isActive = false;
            
            // Remove from existing battles
            removeFromExistingBattles(gameName);
            
            // Create arena
            createArena(gameId);
            
            // Convert player array to fixed size array for the event
            address[4] memory playerArray;
            for (uint i = 0; i < 4; i++) {
                playerArray[i] = game.players[i];
            }
            
            emit GameFull(gameName, playerArray);
        }
    }
    
    function createArena(uint256 gameId) private {
        Game storage game = games[gameId];
        require(game.players.length == 4, "Not enough players");
        
        arenaCounter++;
        
        // Convert dynamic array to fixed size array
        address[4] memory arenaPlayers;
        for (uint i = 0; i < 4; i++) {
            arenaPlayers[i] = game.players[i];
        }
        
        // For demo purposes, we'll randomly select a winner
        // Using block.prevrandao instead of the deprecated block.difficulty
        address winner = arenaPlayers[uint(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) % 4];
        
        arenas[arenaCounter] = Arena({
            id: arenaCounter,
            players: arenaPlayers,
            winner: winner,
            battleCompleted: true
        });
        
        emit ArenaCreated(arenaCounter, game.name, arenaPlayers);
        emit BattleCompleted(arenaCounter, winner);
    }
    
    function getExistingBattles() public view returns (string[] memory) {
        return existingBattles;
    }
    
    function getArenaDetails(uint256 arenaId) public view returns (uint256, address[4] memory, address, bool) {
        Arena storage arena = arenas[arenaId];
        return (arena.id, arena.players, arena.winner, arena.battleCompleted);
    }
    
    function removeFromExistingBattles(string memory gameName) private {
        for (uint i = 0; i < existingBattles.length; i++) {
            if (keccak256(bytes(existingBattles[i])) == keccak256(bytes(gameName))) {
                // Replace with the last element and pop
                existingBattles[i] = existingBattles[existingBattles.length - 1];
                existingBattles.pop();
                break;
            }
        }
    }
}