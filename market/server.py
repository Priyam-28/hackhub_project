import asyncio
import json
import websockets
import random
import time
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MarketServer:
    def __init__(self, port=8765, trends_file="meme_trends.json"):
        self.port = port
        self.clients = set()
        self.assets = {}
        self.transaction_history = []
        self.last_update = time.time()
        self.update_interval = 1.0  # Update market every second
        self.trends_file = trends_file
        self.meme_trends = {}
        self.last_trends_check = 0
        self.trends_check_interval = 10  # Check for new trends every 10 seconds
        
    async def register(self, websocket):
        self.clients.add(websocket)
        logger.info(f"Client connected. Total clients: {len(self.clients)}")
        await self.send_market_state(websocket)
        
    async def unregister(self, websocket):
        self.clients.remove(websocket)
        logger.info(f"Client disconnected. Total clients: {len(self.clients)}")
        
    async def send_market_state(self, websocket):
        """Send current market state to a specific client"""
        await websocket.send(json.dumps({
            "type": "market_state",
            "data": self.assets,
            "timestamp": datetime.now().isoformat()
        }))
        
    async def broadcast_market_update(self):
        """Broadcast market updates to all connected clients"""
        if not self.clients:
            return
            
        message = json.dumps({
            "type": "market_update",
            "data": self.assets,
            "timestamp": datetime.now().isoformat()
        })
        
        await asyncio.gather(
            *[client.send(message) for client in self.clients]
        )
        
    async def handle_transaction(self, transaction):
        """Process a buy/sell transaction and update market accordingly"""
        asset_id = transaction["asset_id"]
        action = transaction["action"]  # "buy" or "sell"
        amount = transaction["amount"]
        price = self.assets[asset_id]["price"]
        
        # Record transaction
        transaction_record = {
            "timestamp": datetime.now().isoformat(),
            "asset_id": asset_id,
            "action": action,
            "amount": amount,
            "price": price,
            "total": amount * price
        }
        self.transaction_history.append(transaction_record)
        
        # Update asset price based on transaction
        price_impact = (amount / self.assets[asset_id]["market_cap"]) * 100
        if action == "buy":
            # Buy pressure increases price
            self.assets[asset_id]["price"] *= (1 + (price_impact * 0.01))
            self.assets[asset_id]["volume"] += amount * price
        else:
            # Sell pressure decreases price
            self.assets[asset_id]["price"] *= (1 - (price_impact * 0.01))
            self.assets[asset_id]["volume"] += amount * price
            
        # Update market cap
        self.assets[asset_id]["market_cap"] = self.assets[asset_id]["price"] * self.assets[asset_id]["supply"]
        
        # Update price history
        if "history" not in self.assets[asset_id]:
            self.assets[asset_id]["history"] = []
        
        self.assets[asset_id]["history"].append({
            "timestamp": datetime.now().isoformat(),
            "price": self.assets[asset_id]["price"]
        })
        
        logger.info(f"Transaction processed: {action} {amount} of {asset_id} at {price}")
        return transaction_record
        
    async def check_meme_trends(self):
        """Check for updated meme trends from Discord monitoring"""
        current_time = time.time()
        
        if current_time - self.last_trends_check < self.trends_check_interval:
            return
            
        try:
            # Check if trends file exists and has been updated
            if os.path.exists(self.trends_file):
                file_modified_time = os.path.getmtime(self.trends_file)
                
                # Only read if file has been modified since last check
                if file_modified_time > self.last_trends_check:
                    with open(self.trends_file, 'r') as f:
                        trend_data = json.load(f)
                    
                    # Update meme trends
                    self.meme_trends = trend_data.get("scores", {})
                    logger.info(f"Updated meme trends: {self.meme_trends}")
                    
                    # Update modifiers for each meme coin
                    for asset_id, score in self.meme_trends.items():
                        if asset_id in self.assets and self.assets[asset_id]["type"] == "meme_coin":
                            # Convert score (0-100) to impact factor (0.9-1.1)
                            impact = 0.9 + (score / 500)  # Score 0 -> 0.9, Score 100 -> 1.1
                            
                            # Update modifiers
                            for i, modifier in enumerate(self.assets[asset_id]["modifiers"]):
                                if modifier["type"] == "meme_trend":
                                    self.assets[asset_id]["modifiers"][i]["impact"] = impact
                                    break
                            else:
                                # Add new modifier if not found
                                self.assets[asset_id]["modifiers"].append({
                                    "type": "meme_trend",
                                    "impact": impact
                                })
                                
                            logger.info(f"Updated {asset_id} meme trend impact to {impact}")
                
                # Update last check time
                self.last_trends_check = current_time
                
        except Exception as e:
            logger.error(f"Error checking meme trends: {e}")
        
    async def update_market(self):
        """Update market prices based on time, random factors and meme trends"""
        current_time = time.time()
        elapsed = current_time - self.last_update
        
        if elapsed < self.update_interval:
            return
            
        # Check for meme trends updates
        await self.check_meme_trends()
            
        for asset_id, asset_data in self.assets.items():
            # Apply natural market movement
            if asset_data["type"] == "meme_coin":
                # Meme coins have higher volatility
                volatility = random.uniform(0.95, 1.05)
            elif asset_data["type"] == "stable_coin":
                # Stable coins have very low volatility
                volatility = random.uniform(0.998, 1.002)
            else:  # stocks
                # Stocks have medium volatility
                volatility = random.uniform(0.99, 1.01)
                
            # Apply custom asset modifiers (like meme trends)
            if "modifiers" in asset_data:
                for modifier in asset_data["modifiers"]:
                    if modifier["type"] == "meme_trend":
                        # Apply meme trend impact
                        trend_impact = modifier["impact"]
                        volatility *= trend_impact
            
            # Update price
            self.assets[asset_id]["price"] *= volatility
            self.assets[asset_id]["market_cap"] = self.assets[asset_id]["price"] * self.assets[asset_id]["supply"]
            
            # Add some random trading volume
            self.assets[asset_id]["volume"] += random.uniform(0, self.assets[asset_id]["market_cap"] * 0.001)
            
            # Update price history
            if "history" not in self.assets[asset_id]:
                self.assets[asset_id]["history"] = []
            
            self.assets[asset_id]["history"].append({
                "timestamp": datetime.now().isoformat(),
                "price": self.assets[asset_id]["price"]
            })
            
            # Limit history size to prevent memory issues
            if len(self.assets[asset_id]["history"]) > 100:
                self.assets[asset_id]["history"] = self.assets[asset_id]["history"][-100:]
        
        self.last_update = current_time
        await self.broadcast_market_update()
        
    async def handle_message(self, websocket, message):
        """Handle incoming client messages"""
        data = json.loads(message)
        response = {"status": "error", "message": "Unknown command"}
        
        if data.get("action") == "buy" or data.get("action") == "sell":
            if data["asset_id"] in self.assets:
                transaction = await self.handle_transaction({
                    "asset_id": data["asset_id"],
                    "action": data["action"],
                    "amount": float(data["amount"])
                })
                response = {"status": "success", "data": transaction}
                # Broadcast update to all clients after a transaction
                await self.broadcast_market_update()
            else:
                response = {"status": "error", "message": "Asset not found"}
        
        elif data.get("action") == "get_assets":
            response = {"status": "success", "data": self.assets}
            
        elif data.get("action") == "get_transactions":
            response = {"status": "success", "data": self.transaction_history}
            
        elif data.get("action") == "get_meme_trends":
            response = {"status": "success", "data": self.meme_trends}
        
        await websocket.send(json.dumps(response))

    # New endpoint to receive meme trends via HTTP
    async def handle_meme_trends_update(self, request):
        """Handle meme trend updates from HTTP API"""
        if request.method == 'POST':
            try:
                trend_data = await request.json()
                self.meme_trends = trend_data.get("scores", {})
                logger.info(f"Received meme trends via API: {self.meme_trends}")
                
                # Update modifiers for each meme coin
                for asset_id, score in self.meme_trends.items():
                    if asset_id in self.assets and self.assets[asset_id]["type"] == "meme_coin":
                        # Convert score (0-100) to impact factor (0.9-1.1)
                        impact = 0.9 + (score / 500)  # Score 0 -> 0.9, Score 100 -> 1.1
                        
                        # Update modifiers
                        for i, modifier in enumerate(self.assets[asset_id]["modifiers"]):
                            if modifier["type"] == "meme_trend":
                                self.assets[asset_id]["modifiers"][i]["impact"] = impact
                                break
                        else:
                            # Add new modifier if not found
                            self.assets[asset_id]["modifiers"].append({
                                "type": "meme_trend",
                                "impact": impact
                            })
                            
                        logger.info(f"Updated {asset_id} meme trend impact to {impact}")
                
                return {'status': 'success', 'message': 'Trends updated'}
            except Exception as e:
                logger.error(f"Error processing meme trends update: {e}")
                return {'status': 'error', 'message': str(e)}
        
        return {'status': 'error', 'message': 'Method not allowed'}
        
    async def load_initial_assets(self):
        """Load initial assets into the market"""
        # These would typically come from a database
        self.assets = {
            "DOGE": {
                "type": "meme_coin",
                "name": "Dogecoin",
                "symbol": "DOGE",
                "price": 0.12,
                "supply": 150000000000,
                "market_cap": 18000000000,
                "volume": 1000000,
                "history": [],
                "modifiers": [
                    {"type": "meme_trend", "impact": 1.0}
                ]
            },
            "PEPE": {
                "type": "meme_coin",
                "name": "Pepe Coin",
                "symbol": "PEPE",
                "price": 0.000001,
                "supply": 42000000000000,
                "market_cap": 42000000,
                "volume": 500000,
                "history": [],
                "modifiers": [
                    {"type": "meme_trend", "impact": 1.0}
                ]
            },
            "SHIB": {
                "type": "meme_coin",
                "name": "Shiba Inu",
                "symbol": "SHIB",
                "price": 0.000015,
                "supply": 589000000000000,
                "market_cap": 8835000000,
                "volume": 750000,
                "history": [],
                "modifiers": [
                    {"type": "meme_trend", "impact": 1.0}
                ]
            },
            "USDT": {
                "type": "stable_coin",
                "name": "Tether",
                "symbol": "USDT",
                "price": 1.0,
                "supply": 100000000000,
                "market_cap": 100000000000,
                "volume": 50000000000,
                "history": []
            },
            "AAPL": {
                "type": "stock",
                "name": "Apple Inc.",
                "symbol": "AAPL",
                "price": 185.92,
                "supply": 15000000000,
                "market_cap": 2788800000000,
                "volume": 10000000000,
                "history": []
            },
            "MSFT": {
                "type": "stock",
                "name": "Microsoft Corporation",
                "symbol": "MSFT",
                "price": 403.78,
                "supply": 7420000000,
                "market_cap": 2996047600000,
                "volume": 8000000000,
                "history": []
            }
        }
        
        # Initialize history for each asset
        for asset_id in self.assets:
            self.assets[asset_id]["history"] = [{
                "timestamp": datetime.now().isoformat(),
                "price": self.assets[asset_id]["price"]
            }]
            
        logger.info("Initial assets loaded")
        
    # Modified handler method to handle both path and no-path versions of websocket
    async def handler(self, websocket, path=None):
        """Main handler for WebSocket connections"""
        await self.register(websocket)
        try:
            async for message in websocket:
                await self.handle_message(websocket, message)
        except Exception as e:
            logger.error(f"Error handling message: {e}")
        finally:
            await self.unregister(websocket)
            
    async def run(self):
        """Start the market server"""
        await self.load_initial_assets()
        
        # Start the WebSocket server with a callback that works for newer versions of websockets
        server = await websockets.serve(
            lambda ws, path=None: self.handler(ws, path), 
            "localhost", 
            self.port
        )
        logger.info(f"Market server started on port {self.port}")
        
        # If we want to add HTTP endpoint for trend updates, we could use aiohttp here
        
        # Keep the server running
        while True:
            await self.update_market()
            await asyncio.sleep(0.1)  # Small sleep to prevent CPU hogging

if __name__ == "__main__":
    # Run the server in the main thread
    asyncio.run(MarketServer().run())