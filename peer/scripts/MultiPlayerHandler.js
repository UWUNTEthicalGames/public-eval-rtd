import Globals from "./globals.js";

const TAG_REQUEST_DATA = "__request_data";
const TAG_DATA = "data";
const PLAYER_DATA = "__player_data";
const LEVEL_START = "level_start";
const GO_TO_PEER_LAYOUT = "go_to_peer_layout";
const CONNECTION_DATA = "__connection_data";
const SELECTION_ADDED = "selection_added";
const SELECTION_REMOVED = "selection_removed";


export class MultiPlayerHandler {

	

    constructor (runtime) {
		
        
		this.runtime = runtime;
        this.multiPlayer = this.runtime.objects.Multiplayer;
		this.signallingStatus = "";
		
		this.connectionUrl = "wss://multiplayer.scirra.com";
	
		// playerAlias is set dynamically based on 
		this.playerAlias = (typeof this.runtime.globalVars.PLAYER_ALIAS === "undefined" ) ? "game-host": this.runtime.globalVars.PLAYER_ALIAS;
		
		this.gameDataJson = {
			"roles": {},
			"receivedData": {},
			"receivedRequests": []
		};
	
		
		// add buttons and text input fields
		
		
		//this.connectBtn = this.runtime.objects.ConnectButton.getFirstInstance();
		//connectBtn.addEventListener("click", () => this.connectPeer());
		
		
		// Multiplayer Events
		this.multiPlayer.addEventListener("message", (e) => this.onReceive(e));
		
		
		// Game Events
		
    }
	
	
	
	
	sendDataToHost(type, message) {
		
		const messageContainer = {tag:  TAG_DATA, type: type, message: message};	
		this.SetSignallingStatus("sending data: " + JSON.stringify(messageContainer) + " to host");
		this.multiPlayer.sendPeerMessage("", messageContainer, 'o')
		this.SetSignallingStatus("data sent to Host");
		
	}
	
	
	onReceive(event){
		this.SetSignallingStatus("on Received Message");
		
		const receivedMessage = event.message;
		
		console.log(receivedMessage);
		if (receivedMessage["tag"] === TAG_REQUEST_DATA){
			this.gameDataJson.receivedRequests.push({fromAlias: event.fromAlias, type : receivedMessage.type});
			this.onReceiveRequest(receivedMessage);
		}
		else {
			const temp={};
			temp[event.fromAlias] = receivedMessage;
			this.gameDataJson.receivedData[receivedMessage.type] = temp;
			this.onReceiveData(receivedMessage);
		}

		console.log(this.gameDataJson);
		
	}
	
	onReceiveRequest(receivedMessage){
		this.SetSignallingStatus("received Request");
		console.log(receivedMessage);
		
		if (receivedMessage.message === CONNECTION_DATA) {
			this.sendDataToHost(CONNECTION_DATA, {"status": "ready_to_start"});
		}
	}
	
	
	onReceiveData(receivedMessage) {
		
		this.SetSignallingStatus("received Data" + receivedMessage.message);
		
		
		if (receivedMessage.type === GO_TO_PEER_LAYOUT){
			this.runtime.goToLayout(receivedMessage.message);
		} else if (receivedMessage.type === LEVEL_START){
			this.SetSignallingStatus("Host is at " + receivedMessage.message);
		} else if (receivedMessage.type === PLAYER_DATA){
			this.gameDataJson.roles = receivedMessage.message.roles;
			this.runtime.goToLayout("GameWait");
		} else if (receivedMessage.type === SELECTION_ADDED) {
			Globals.gameObj.registerPeerSelectPerson(receivedMessage);
		} else if (receivedMessage.type === SELECTION_REMOVED) {
			Globals.gameObj.registerPeerSelectPerson(receivedMessage);
		} else{
			console.error(receivedMessage);
			this.runtime.goToLayout("ErrorMenu");
		}

	}
	

	// this method handles all the APIs for connecting, login and joining the room.
    async connectToSignalling() {
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
				await signalling.login(this.runtime.globalVars.PLAYER_ALIAS);
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
	
	
	
// 	async leaveGame(){
// 		this.multiPlayer.leaveRoom();
// 	}
	
	
}