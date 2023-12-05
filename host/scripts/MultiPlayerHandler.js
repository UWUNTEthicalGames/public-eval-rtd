import { generateUniqueRandomRoomCode } from "./main.js";
import { Player } from "./Player.js";
import { Game } from "./Game.js";
import  Globals  from "./globals.js";

const PLAYER_DATA = "__player_data";
const TAG_REQUEST_DATA = "__request_data";
const TAG_DATA = "data";
const CONNECTION_DATA = "__connection_data";

export class MultiPlayerHandler {

    constructor (runtime) {
        
		this.runtime = runtime;
        this.multiPlayer = this.runtime.objects.Multiplayer;
		this.signallingStatus = "";
		
		this.connectionUrl = "wss://multiplayer.scirra.com";
		this.playerAlias = this.playerAlias = (
		typeof this.runtime.globalVars.PLAYER_ALIAS === "undefined" ) 
		? "game-host"
		: this.runtime.globalVars.PLAYER_ALIAS;
		
		this.numOfPlayers =   this.runtime.globalVars.NUM_PLAYERS;
		this.gameDataJson = {
			"playerList": [],
			"players":  {},
			"roles": {},
			"outstandingRequests": {},
			"receivedData": {},
			"receivedRequests": []
		};
		
		
		// login using multiplayer
        this.ConnectToSignalling();
		
		
		// event binding
		// //multiplayer events
		this.multiPlayer.addEventListener("peerconnect", 
		 (e) => this.onPeerConnected(e));
		 
		this.multiPlayer.addEventListener("message", (e) => this.onReceive(e));
		 
		this.multiPlayer.addEventListener("peerdisconnect", 
		(e) => this.leaveRoom(e));
	
    }

	// this method handles all the APIs for connecting, login and joining the room.
    async ConnectToSignalling() {
		this.SetSignallingStatus("signalling");
        try {
            var signalling = this.multiPlayer.signalling;

            if (!signalling.isConnected)
            {
				this.SetSignallingStatus("Connecting...");
				await signalling.connect(this.connectionUrl);
			}
			
            if (!signalling.isLoggedIn)
			{
				this.SetSignallingStatus("Logging in...");
				
				await signalling.login(this.playerAlias);
				
				
			}

            this.SetSignallingStatus("Joining room...");
			
			
            // join game with name, instance and room code
			await signalling.joinRoom(this.runtime.globalVars.GAME_NAME, this.runtime.globalVars.GAME_INSTANCE_NAME, this.runtime.globalVars.ROOM_CODE );

            if (this.multiPlayer.isHost)
            {
                this.SetSignallingStatus("Joined room "+ this.runtime.globalVars.ROOM_CODE +" as HOST");
            }
			else
            {
				this.SetSignallingStatus("Player " + this.playerAlias + " Joined room as peer");
            }
			
			
        }
        catch (err){
            this.SetSignallingStatus("Error at MultiPlayer Handler");
			console.error("Signalling error: ", err);
			
        }
    }
    	
	onPeerConnected(e){
		this.SetSignallingStatus("onPeerConnected");
	
		Globals.GameObj.addPlayerToGame(e.peerId ,e.peerAlias);
		
		//const player = {};
// 		player["playerIdx"]= this.gameDataJson.playerList.length+1;
// 		player["ID"] = playerJoined.peerId;
// 		player["status"] = "";
// 		this.gameDataJson.players[playerJoined.peerAlias] = player;
		
	
	}
	
	// Roles logic need to be updated
	setAndSendPlayerRole(player) {
		this.SetSignallingStatus("setAndSendPlayerRole");
		let role = "";
		//if (this.gameDataJson.roles["A"].length <= this.gameDataJson.roles["B"].length)
			role = "A";
// 		else
// 			role = "B";
		
// 		this.gameDataJson.roles[role] = [];
// 		this.gameDataJson.roles[role].push(player);
		
		this.sendDataToSpecificPeer({"roles":[role]}, player); 
			
	}
	
	
	// Sending Handlers
	
	// Structure of the message	 
	// message = {
	// 		tag: REQUEST_DATA,
	// 		type: connection data, player data etc
	// 		message: <any message>
	// 	}
	sendDataToSpecificPeer(message, player){

		const messageContainer = {tag: TAG_DATA, type: PLAYER_DATA, message:message};	
		this.SetSignallingStatus("sending data: " + JSON.stringify(messageContainer) +" to peer: " + player.peerAlias);
		this.multiPlayer.sendPeerMessage(player.peerId, messageContainer, 'o');
		this.SetSignallingStatus("Message Sent to Peer");
	}
	
	
	sendRequestToSpecificPeer(message, player){
		
		const messageContainer = {tag: TAG_REQUEST_DATA, type: "", message:message};
		this.SetSignallingStatus("sending request: " + JSON.stringify(messageContainer) +" to peer: " + player.peerAlias);
		this.multiPlayer.sendPeerMessage(player.peerId, messageContainer, 'o');
		this.gameDataJson.outstandingRequests = {};
	}
	
	sendDataToPeersWithRole(type, message, toRole) {
	
		this.SetSignallingStatus("send data to peers with Role");
	
		for (const player of Globals.GameObj.players) {
			if (player.getRole === toRole){
				const messageContainer = {tag: TAG_REQUEST_DATA, type: type, message:message};
				this.SetSignallingStatus("sending data: " + JSON.stringify(messageContainer) +" to peer: " + player.peerAlias);
				this.multiPlayer.sendPeerMessage(player.peerId, message, 'o');
			}
		}
	}
	
	
	sendRequestToAllPeers(type){
	
		const messageContainer = {tag: TAG_REQUEST_DATA, type: type, message:""};
		this.SetSignallingStatus("sending request: " + JSON.stringify(messageContainer) +" to all");
		this.multiPlayer.hostBroadcastMessage("", messageContainer, 'r');
		
	}
	
	
	sendDataToAllPeers(type, message){
	
		const messageContainer = {tag: TAG_DATA, type: type, message: message};
		this.SetSignallingStatus("sending data: " + JSON.stringify(messageContainer) +" to all");
		this.multiPlayer.hostBroadcastMessage("", messageContainer, 'r');
	}
	

	// Receiving Handlers
	onReceive(event) {
	
		const messageReceived = event.message;
		
		if (messageReceived["tag"] === TAG_REQUEST_DATA){
			this.SetSignallingStatus("Received request message " + JSON.stringify(messageReceived) + " from " + event.fromAlias);
			this.onReceiveRequest(messageReceived["type"], event.fromAlias);
		} 
		
		else {
			this.SetSignallingStatus("Received data message " + JSON.stringify(messageReceived) + " from " + event.fromAlias);
			this.onReceiveData(messageReceived["type"], messageReceived, event.fromAlias)
		}
	}
	
	
	onReceiveRequest (type, fromAlias){
	
		this.SetSignallingStatus("On receive Request");
		this.gameDataJson.receivedRequests.push({"fromAlias": fromAlias, "type": type});
		console.log(this.gameDataJson)
	}
	
	
	onReceiveData(type, messageReceived, fromAlias) {
		this.SetSignallingStatus("On Receive Data Message");
	
		if (type === CONNECTION_DATA) {
			if (messageReceived.hasOwnProperty("status"))
				Globals.GameObj.players[fromAlias].setStatus = messageReceived["status"];	
		}
		else {
			let temp = {};
			temp[fromAlias] = messageReceived;
			this.gameDataJson.receivedData[type] = temp;
		}
		
		console.log(this.gameDataJson);
	}
	
	
	leaveRoom(e) {
	
		this.SetSignallingStatus("leave room");
		Globals.GameObj.leaveRoom(e);
	}
	
	
	// This method can be used to show status of game on layout/console
    SetSignallingStatus(str)
	{
		this.signallingStatus = "MultiPlayer : " + str
		console.log(this.signallingStatus);
	}	
}
