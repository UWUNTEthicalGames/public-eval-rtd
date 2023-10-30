import { generateUniqueRandomRoomCode } from "./main.js";
import { Player } from "./Player.js";
import { Game } from "./Game.js";

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
		
		
		
        // add buttons and text input fields
		this.playerListText = this.runtime.objects.PlayerListText.getFirstInstance();
		this.playerCountText = this.runtime.objects.PlayerCountText.getFirstInstance();
		
		const startGameBtn = this.runtime.objects.Button.getFirstInstance();
		startGameBtn.addEventListener("click", () => console.log("button clicked"));
		

        this.ConnectToSignalling();
		
		
		// event binding
		// //multiplayer events
		this.multiPlayer.addEventListener("peerconnect", 
		 (e) => this.onPeerConnected(e));
		 
		this.multiPlayer.addEventListener("message", (e) => this.onReceive(e));
		 
		this.multiPlayer.addEventListener("peerdisconnect", 
		(e) => this.leaveRoom(e));
		
		
		// game events
		
		
		
		//debugger;

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

    // This method can be used to show status of game on layout/console
    SetSignallingStatus(str)
	{
		this.signallingStatus = "MultiPlayer : " + str
		console.log(this.signallingStatus);
	}
	
	
	
	onPeerConnected(e){
		this.SetSignallingStatus("onPeerConnected");
		
		const playerJoined = new Player(e.peerId ,e.peerAlias);
		const player = {};
		
		this.numOfPlayers += 1;
		this.playerCountText.text = this.numOfPlayers.toString();
		
		player["playerIdx"]= this.gameDataJson.playerList.length+1;
		player["ID"] = playerJoined.peerId;
		player["status"] = "";
		this.gameDataJson.players[playerJoined.peerAlias] = player;
		
		this.refreshPlayerListToDisplay();
		//this.gameDataJson.playerList.push(playerJoined.peerAlias);
		console.log(this.gameDataJson);
		
		this.setAndSendPlayerRole(playerJoined);
		this.sendRequestToSpecificPeer(CONNECTION_DATA, playerJoined);
		
		//this.sendDataToPeersWithRole(CONNECTION_DATA, {"test": "test"}, 'A')
	
	}
	
	refreshPlayerListToDisplay() {
		this.SetSignallingStatus("Refreshing players list to display");
		
		let playersToDisplay = "";	
			
		for (let player of Object.keys(this.gameDataJson.players)){
			this.gameDataJson.playerList.push(player);
			
			playersToDisplay += player + "\n"
		}
		
		console.log(playersToDisplay);
		this.playerListText.text = playersToDisplay;
	}
	
	
	
	// role can be separte
	setAndSendPlayerRole(player) {
		this.SetSignallingStatus("setAndSendPlayerRole");
		let role = "";
		//if (this.gameDataJson.roles["A"].length <= this.gameDataJson.roles["B"].length)
			role = "A";
// 		else
// 			role = "B";
		
		this.gameDataJson.roles[role] = [];
		this.gameDataJson.roles[role].push(player);
		const messageToSend = {"tag": TAG_DATA, "type": PLAYER_DATA, "message":{"roles":[role]}};
		this.sendDataToSpecificPeer(messageToSend, player); // TODO: Convert GameDataJSON TO class
			
	}
	
	sendDataToSpecificPeer(message, player){

		this.SetSignallingStatus("sending data to peer: " + player.peerAlias);
		console.log(message);
		this.multiPlayer.sendPeerMessage(player.peerId, message, 'o');
		this.SetSignallingStatus("Message Sent to Peer");
	}
	
	
	sendRequestToSpecificPeer(message, player){
		this.SetSignallingStatus("sending request to peer: " + player.peerAlias);
		const messageToSend = {"tag": TAG_REQUEST_DATA, "message" :message };
		this.multiPlayer.sendPeerMessage(player.peerId, messageToSend, 'o');
		this.gameDataJson.outstandingRequests = {};
	}
	
	sendDataToPeersWithRole(type, message, toRole) {
		this.SetSignallingStatus("send data to peers with Role");
		const playersWithRole = this.gameDataJson.roles[toRole];
		for (let player of playersWithRole) {
			this.multiPlayer.sendPeerMessage(player.peerId, message, 'o');
		}
	}
	
	
	sendRequestToAllPeers(type){
		this.SetSignallingStatus("send Request to all peers")
		const messageToSend = {tag: type};
		this.multiPlayer.hostBroadcastMessage("", messageToSend, 'r');
		
	}
	
	
	sendDataToAllPeers(type, message){
		this.SetSignallingStatus("send Data to all peers")
		const messageToSend = {tag: TAG_DATA, type: type, message: message};
		this.multiPlayer.hostBroadcastMessage("", messageToSend, 'r');
	}
	
	
	onReceive(event) {
		this.SetSignallingStatus("On Receive any Message");
	
		const messageReceived = event.message;
		console.log(messageReceived);
		if (messageReceived["tag"] === TAG_REQUEST_DATA){
			this.onReceiveRequest(messageReceived["type"], event.fromAlias);
		} else {
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
				this.gameDataJson.players[fromAlias]["status"] = messageReceived["status"];	
		}
		else {
			let temp={};
			temp[fromAlias] = messageReceived;
			this.gameDataJson.receivedData[type] = temp;
		}
		
		console.log(this.gameDataJson);
	}
	
	
	onSendData (type, message, toAlias) {
	//No usage yet
	//TODO
	}
	
	
	onSendRequest(type, toAlias) {
	// No usage yet
	//TODO
	}
	
	
	startGame() {
		debugger;
		this.SetSignallingStatus("start game");
		this.runtime.goToLayout("LevelChooser");
		
		this.sendDataToAllPeers("level_start", startGameBtn.instVars['levelTarget']);
	}
	
	
	leaveRoom(e) {
		this.SetSignallingStatus("on peer leave room");
		console.log(this.numOfPlayers);
		this.numOfPlayers -= 1;
		this.playerCountText.text = this.numOfPlayers.toString();
		
		delete this.gameDataJson.players[e.peerAlias];
		this.gameDataJson.playerList.splice(this.gameDataJson.playerList.indexOf(e.peerAlias), 1);
		console.log(this.gameDataJson);
		this.refreshPlayerListToDisplay();
	}
	
}

