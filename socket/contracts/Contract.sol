// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BArena {
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
        
        arenas[arenaCounter] = Arena({
            id: arenaCounter,
            players: arenaPlayers,
            winner: address(0), // Initialize with no winner
            battleCompleted: false // Battle not completed initially
        });
        
        // Mark game as inactive since it's moved to arena phase
        game.isActive = false;
        
        // Remove from existing battles
        removeFromExistingBattles(game.name);
        
        emit ArenaCreated(arenaCounter, game.name, arenaPlayers);
    }
    
    // New function to declare a winner in an arena
    function declareWinner(uint256 arenaId, address winner) public {
        Arena storage arena = arenas[arenaId];
        
        // Only host can declare winner
        uint256 gameId = getGameIdForArena(arenaId);
        require(games[gameId].host == msg.sender, "Only the host can declare a winner");
        
        // Check if battle is still active
        require(!arena.battleCompleted, "Battle is already completed");
        
        // Check if winner is a player in the arena
        bool isPlayer = false;
        for (uint i = 0; i < 4; i++) {
            if (arena.players[i] == winner) {
                isPlayer = true;
                break;
            }
        }
        require(isPlayer, "Winner must be a player in this arena");
        
        // Set winner and mark battle as completed
        arena.winner = winner;
        arena.battleCompleted = true;
        
        emit BattleCompleted(arenaId, winner);
    }
    
    // Function to close a battle without declaring a winner
    function closeBattle(uint256 arenaId) public {
        Arena storage arena = arenas[arenaId];
        
        // Only host can close battle
        uint256 gameId = getGameIdForArena(arenaId);
        require(games[gameId].host == msg.sender, "Only the host can close a battle");
        
        // Check if battle is still active
        require(!arena.battleCompleted, "Battle is already completed");
        
        // Mark battle as completed with no winner
        arena.battleCompleted = true;
        
        emit BattleCompleted(arenaId, address(0));
    }
    
    // Helper function to get game ID for an arena
    function getGameIdForArena(uint256 arenaId) private view returns (uint256) {
        Arena storage arena = arenas[arenaId];
        for (uint i = 1; i <= gameCounter; i++) {
            Game storage game = games[i];
            if (game.players.length == 4) {
                bool allMatch = true;
                for (uint j = 0; j < 4; j++) {
                    if (game.players[j] != arena.players[j]) {
                        allMatch = false;
                        break;
                    }
                }
                if (allMatch) {
                    return i;
                }
            }
        }
        revert("Game not found for arena");
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