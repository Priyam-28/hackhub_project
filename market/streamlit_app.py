import streamlit as st
import asyncio
import websockets
import json
import pandas as pd
import plotly.express as px
import time
import threading
from websockets.exceptions import ConnectionClosedError

# WebSocket connection details
WS_URI = "ws://localhost:8765"

# Function to connect to WebSocket and fetch data
async def fetch_market_data():
    try:
        async with websockets.connect(WS_URI, ping_interval=None) as websocket:
            await websocket.send(json.dumps({"action": "get_assets"}))
            response = await websocket.recv()
            return json.loads(response)["data"]
    except Exception as e:
        st.error(f"Error connecting to market server: {e}")
        return {}

# Function to send buy/sell orders
async def send_transaction(action, asset_id, amount):
    try:
        async with websockets.connect(WS_URI, ping_interval=None) as websocket:
            await websocket.send(json.dumps({
                "action": action,
                "asset_id": asset_id,
                "amount": float(amount)
            }))
            response = await websocket.recv()
            return json.loads(response)
    except Exception as e:
        st.error(f"Error sending transaction: {e}")
        return {"status": "error", "message": str(e)}

# Function to subscribe to real-time updates
async def subscribe_to_updates():
    while True:
        try:
            async with websockets.connect(WS_URI, ping_interval=None) as websocket:
                st.session_state.connected = True
                while True:
                    message = await websocket.recv()
                    data = json.loads(message)
                    if data.get("type") == "market_update":
                        st.session_state.market_data = data["data"]
                        st.session_state.last_update = time.time()
        except ConnectionClosedError:
            st.session_state.connected = False
            await asyncio.sleep(1)  # Wait before reconnecting
        except Exception as e:
            st.session_state.connected = False
            await asyncio.sleep(3)  # Wait longer for other errors

# Initialize session state
if 'market_data' not in st.session_state:
    st.session_state.market_data = {}
if 'last_update' not in st.session_state:
    st.session_state.last_update = 0
if 'connected' not in st.session_state:
    st.session_state.connected = False
if 'transaction_history' not in st.session_state:
    st.session_state.transaction_history = []

# Start subscription in a background thread if not already running
if 'websocket_thread' not in st.session_state:
    def run_async_subscriptions():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(subscribe_to_updates())

    st.session_state.websocket_thread = threading.Thread(target=run_async_subscriptions)
    st.session_state.websocket_thread.daemon = True
    st.session_state.websocket_thread.start()

# Streamlit app
st.title("Real-Time Market Dashboard")

# Connection status
connection_status = st.empty()
if st.session_state.connected:
    connection_status.success("Connected to market server")
else:
    connection_status.warning("Connecting to market server...")

# Fetch initial market data if needed
if not st.session_state.market_data:
    with st.spinner("Fetching market data..."):
        market_data = asyncio.run(fetch_market_data())
        if market_data:
            st.session_state.market_data = market_data
            st.session_state.last_update = time.time()

# Refresh data button
if st.button("Refresh Data"):
    with st.spinner("Refreshing market data..."):
        market_data = asyncio.run(fetch_market_data())
        if market_data:
            st.session_state.market_data = market_data
            st.session_state.last_update = time.time()

# Display market data
st.subheader("Market Data")
if st.session_state.market_data:
    # Create a more readable DataFrame
    data_for_display = []
    for asset_id, asset_data in st.session_state.market_data.items():
        data_for_display.append({
            "Symbol": asset_id,
            "Name": asset_data.get("name", ""),
            "Type": asset_data.get("type", ""),
            "Price": f"${asset_data.get('price', 0):.6f}",
            "24h Volume": f"${asset_data.get('volume', 0)/1000000:.2f}M",
            "Market Cap": f"${asset_data.get('market_cap', 0)/1000000000:.2f}B"
        })
    
    df_display = pd.DataFrame(data_for_display)
    st.dataframe(df_display, use_container_width=True)
else:
    st.info("No market data available. Make sure the server is running.")

# Plot price trends
if st.session_state.market_data:
    st.subheader("Price Trends")
    asset_options = list(st.session_state.market_data.keys())
    if asset_options:
        selected_asset = st.selectbox("Select Asset", asset_options)
        
        if selected_asset in st.session_state.market_data:
            price_history = st.session_state.market_data[selected_asset].get("history", [])
            
            if price_history:
                df_history = pd.DataFrame(price_history)
                fig = px.line(df_history, x="timestamp", y="price", 
                             title=f"{selected_asset} Price History")
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.info("No price history available for this asset yet.")

# Buy/Sell Interface
if st.session_state.market_data:
    st.subheader("Buy/Sell Assets")
    
    col1, col2 = st.columns(2)
    
    with col1:
        asset_id = st.selectbox("Asset", list(st.session_state.market_data.keys()))
        action = st.radio("Action", ["buy", "sell"])
    
    with col2:
        # Show current price
        if asset_id in st.session_state.market_data:
            current_price = st.session_state.market_data[asset_id]["price"]
            st.metric("Current Price", f"${current_price:.6f}")
            
        amount = st.number_input("Amount", min_value=0.01, value=1.0, step=0.01)
        total_cost = amount * st.session_state.market_data[asset_id]["price"] if asset_id in st.session_state.market_data else 0
        st.write(f"Total: ${total_cost:.2f}")
    
    if st.button("Submit Transaction"):
        with st.spinner(f"{action.capitalize()}ing {amount} {asset_id}..."):
            result = asyncio.run(send_transaction(action, asset_id, amount))
            
            if result.get("status") == "success":
                st.success(f"Transaction complete: {action} {amount} {asset_id}")
                # Add to transaction history
                st.session_state.transaction_history.append({
                    "timestamp": result["data"]["timestamp"],
                    "action": action,
                    "asset": asset_id,
                    "amount": amount,
                    "price": result["data"]["price"],
                    "total": result["data"]["total"]
                })
            else:
                st.error(f"Transaction failed: {result.get('message', 'Unknown error')}")

# Transaction History
if st.session_state.transaction_history:
    st.subheader("Your Transaction History")
    df_transactions = pd.DataFrame(st.session_state.transaction_history)
    st.dataframe(df_transactions, use_container_width=True)

# Last updated timestamp
if st.session_state.last_update > 0:
    st.caption(f"Last updated: {time.strftime('%H:%M:%S', time.localtime(st.session_state.last_update))}")