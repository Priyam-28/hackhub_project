// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BattleArena {
    uint256 public gameIdCounter = 1;
    uint256 public arenaIdCounter = 1;

    struct Game {
        uint256 gameId;
        address host;
        address[] players;
        bool isActive;
    }

    struct Arena {
        uint256 arenaId;
        address[4] players;
        address winner;
        bool battleStarted;
        bool battleCompleted;
    }

    mapping(uint256 => Game) public games;
    mapping(uint256 => Arena) public arenas;

    event GameCreated(uint256 gameId, address host);
    event PlayerJoined(uint256 gameId, address player);
    event ArenaCreated(uint256 arenaId, address[4] players);
    event BattleStarted(uint256 arenaId);
    event BattleCompleted(uint256 arenaId, address winner);

    modifier gameExists(uint256 _gameId) {
        require(games[_gameId].gameId == _gameId, "Game does not exist");
        _;
    }

    modifier canJoin(uint256 _gameId) {
        require(games[_gameId].isActive, "Game is not active");
        require(games[_gameId].players.length < 4, "Game is full");
        _;
    }

    function createGame() external {
        Game storage newGame = games[gameIdCounter];
        newGame.gameId = gameIdCounter;
        newGame.host = msg.sender;
        newGame.players.push(msg.sender);
        newGame.isActive = true;

        emit GameCreated(gameIdCounter, msg.sender);
        gameIdCounter++;
    }

    function joinGame(uint256 _gameId) external gameExists(_gameId) canJoin(_gameId) {
        Game storage game = games[_gameId];
        game.players.push(msg.sender);

        if (game.players.length == 4) {
            game.isActive = false; // Auto-start when full
            _createArena(game.players);
        }

        emit PlayerJoined(_gameId, msg.sender);
    }

    function _createArena(address[] storage _players) internal {
        require(_players.length == 4, "Arena requires exactly 4 players");

        arenas[arenaIdCounter] = Arena({
            arenaId: arenaIdCounter,
            players: [_players[0], _players[1], _players[2], _players[3]],
            winner: address(0),
            battleStarted: false,
            battleCompleted: false
        });

        emit ArenaCreated(arenaIdCounter, [_players[0], _players[1], _players[2], _players[3]]);

        arenaIdCounter++;
    }

    function startBattle(uint256 _arenaId) external {
        require(!arenas[_arenaId].battleStarted, "Battle already started");
        arenas[_arenaId].battleStarted = true;

        emit BattleStarted(_arenaId);
    }

    function declareWinner(uint256 _arenaId, address _winner) external {
        require(arenas[_arenaId].battleStarted, "Battle has not started");
        require(!arenas[_arenaId].battleCompleted, "Battle already finished");

        arenas[_arenaId].winner = _winner;
        arenas[_arenaId].battleCompleted = true;

        emit BattleCompleted(_arenaId, _winner);
    }

    function getArenaDetails(uint256 _arenaId) external view returns (Arena memory) {
        return arenas[_arenaId];
    }
}
