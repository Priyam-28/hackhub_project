import discord
import asyncio
import json
import time
from collections import defaultdict

class MemeMonitor(discord.Client):
    def __init__(self, token, server_id, channels=None, update_interval=60):
        intents = discord.Intents.default()
        intents.message_content = True
        super().__init__(intents=intents)
        
        self.token = token
        self.server_id = server_id
        self.channels = channels or []  # List of channel IDs to monitor
        self.update_interval = update_interval  # seconds
        
        # Meme tracking data
        self.meme_scores = defaultdict(int)
        self.recent_messages = []
        self.max_recent_messages = 1000  # Keep track of last 1000 messages
        
        # Tracked meme coins
        self.meme_coins = {
            "DOGE": ["doge", "dogecoin", "moon", "shiba", "dog"],
            "PEPE": ["pepe", "frog", "rare pepe", "kek"],
            "SHIB": ["shiba", "shib", "shibainu", "doge killer"],
        }
        
        # Results storage
        self.results_file = "meme_trends.json"
        self.last_scan_time = time.time()
        
    async def setup_hook(self):
        """Sets up the bot's background tasks"""
        self.bg_task = self.loop.create_task(self.scan_meme_trends())
        
    async def on_ready(self):
        """Bot is ready to receive events"""
        print(f'Logged in as {self.user} (ID: {self.user.id})')
        print('------')
        
        # Load channels if none were specified
        if not self.channels:
            guild = self.get_guild(self.server_id)
            if guild:
                self.channels = [channel.id for channel in guild.text_channels]
                print(f"Monitoring {len(self.channels)} channels")
        
    async def on_message(self, message):
        """Process new messages as they come in"""
        # Ignore messages from the bot itself
        if message.author == self.user:
            return
            
        # Only process messages from monitored channels
        if message.channel.id not in self.channels:
            return
            
        # Add message to recent messages
        self.recent_messages.append({
            "content": message.content.lower(),
            "timestamp": time.time()
        })
        
        # Keep recent messages list at max size
        while len(self.recent_messages) > self.max_recent_messages:
            self.recent_messages.pop(0)
            
        # Process message immediately
        self._process_message(message.content)
        
    def _process_message(self, content):
        """Process a message to find meme references"""
        # Convert to lowercase for case-insensitive matching
        content = content.lower()
        
        # Check for each meme coin's keywords
        for coin, keywords in self.meme_coins.items():
            for keyword in keywords:
                if keyword in content:
                    # Increment score for this coin
                    self.meme_scores[coin] += 1
                    # Score emojis and strong reactions more
                    emoji_count = content.count("🚀") + content.count("🌙") + content.count("💰")
                    self.meme_scores[coin] += emoji_count * 2
        
    async def scan_meme_trends(self):
        """Background task to scan meme trends periodically"""
        await self.wait_until_ready()
        
        while not self.is_closed():
            # Calculate time since last scan
            current_time = time.time()
            elapsed = current_time - self.last_scan_time
            
            if elapsed >= self.update_interval:
                print(f"Scanning meme trends... ({len(self.recent_messages)} recent messages)")
                
                # Reset scores before new scan
                self.meme_scores = defaultdict(int)
                
                # Process only messages from the last interval period
                cutoff_time = current_time - self.update_interval
                recent_messages = [m for m in self.recent_messages if m["timestamp"] >= cutoff_time]
                
                # Process each message
                for message_data in recent_messages:
                    self._process_message(message_data["content"])
                
                # Calculate scores relative to maximum (normalize to 0-100 scale)
                normalized_scores = {}
                if self.meme_scores:
                    max_score = max(self.meme_scores.values())
                    if max_score > 0:
                        for coin, score in self.meme_scores.items():
                            normalized_scores[coin] = (score / max_score) * 100
                    else:
                        normalized_scores = {coin: 50 for coin in self.meme_scores.keys()}
                
                # Add baseline score of 50 for any tracked coins that weren't mentioned
                for coin in self.meme_coins.keys():
                    if coin not in normalized_scores:
                        normalized_scores[coin] = 50
                
                # Save results to file
                self.save_results(normalized_scores)
                
                # Update last scan time
                self.last_scan_time = current_time
                
                print(f"Meme trend results: {normalized_scores}")
            
            # Sleep before next check
            await asyncio.sleep(10)  # Check every 10 seconds
    
    def save_results(self, scores):
        """Save trend results to file for the market server to read"""
        try:
            # Create a timestamp
            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
            
            # Prepare data structure
            data = {
                "timestamp": timestamp,
                "scores": scores
            }
            
            # Write to file
            with open(self.results_file, 'w') as f:
                json.dump(data, f, indent=2)
                
            print(f"Saved trend results to {self.results_file}")
            
        except Exception as e:
            print(f"Error saving trend results: {e}")
    
    def run_bot(self):
        """Start the Discord bot"""
        print("Starting Discord meme monitor...")
        self.run(self.token)

if __name__ == "__main__":
    # Configuration (should be loaded from env vars or config file in production)
    DISCORD_TOKEN = "MTM0NjUwMTk4MzczNzA4NTk5Mw.G13qEN.VkCV4GgILcf6dkTCqOFw1qY6ubqV7nAyhNXAfE"
    SERVER_ID = 1346527621579800676  # Replace with your server ID
    
    # Create and start the meme monitor
    monitor = MemeMonitor(DISCORD_TOKEN, SERVER_ID)
    
    try:
        monitor.run_bot()
    except KeyboardInterrupt:
        print("Shutting down meme monitor...")