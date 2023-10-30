

const PLAYER_DATA = "__player_data";
const TAG_REQUEST_DATA = "__request_data";
const TAG_DATA = "data";
const TAG_LEVEL_START = "level_start";
const CONNECTION_DATA = "__connection_data";

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
		
		
		
		

		this.connectPeer();
		
		this.multiPlayer.addEventListener("message", (e) => this.onReceive(e));
		
		
		// add buttons and text input fields
		
		const connectBtn = this.runtime.objects.ConnectButton.getFirstInstance();
		connectBtn.addEventListener("click", () => alert("clicked"));
		
    }
	
	sendDataToHost(messageToSend) {
		this.SetSignallingStatus("Send Data to Host");
		console.log(messageToSend);
		const myself = this.multiPlayer.getPeerById(this.multiPlayer.myId);
		console.log(JSON.stringify(messageToSend));
		this.multiPlayer.sendPeerMessage("",messageToSend, 'o')
		
		this.SetSignallingStatus("Data sent to Host");
		
	}
	
	
	onReceive(event){
		this.SetSignallingStatus("on Received Message");
		
		const receivedMessage = event.message;
		
		console.log(receivedMessage);
		if (receivedMessage["tag"] === TAG_REQUEST_DATA){
			this.gameDataJson.receivedRequests.push({"fromAlias": event.fromAlias, "type": receivedMessage.type});
			this.onReceiveRequest(receivedMessage);
		}
		else {
			let temp={};
			temp[event.fromAlias] = receivedMessage;
			this.gameDataJson.receivedData[receivedMessage.type] = temp;
			this.onReceiveData(receivedMessage);
		}

			
			
		
		console.log(this.gameDataJson);
		
	}
	
	onReceiveRequest(receivedMessage){
		this.SetSignallingStatus("received Request");
		console.log(receivedMessage);
		
		this.sendDataToHost({"tag": TAG_DATA, "type": CONNECTION_DATA, "status": "ready_to_start"});
	}
	
	
	onReceiveData(receivedMessage) {
		
		this.SetSignallingStatus("received Data");
		
		if (receivedMessage["type"] === PLAYER_DATA){
		
			this.gameDataJson["roles"] = receivedMessage["message"]["roles"];
			this.runtime.goToLayout("GameWait");
		
		}
// 		else if (receivedMessage["tag"] === TAG_LEVEL_START){
// 			this.runtime.goToLayout(receivedMessage["message"]);
// 		}
		
		else{			
			this.runtime.goToLayout("ErrorMenu");
		}
			
		

	}
	
	
	connectPeer() {
		this.SetSignallingStatus("On connect peer");
		if ( (this.runtime.globalVars.ROOM_CODE && this.runtime.globalVars.PLAYER_ALIAS))
			this.connectToSignalling();
		else
		{
			this.SetSignallingStatus("Please provide ROOM CODE and ALIAS");
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
	
	
	
// 	async leaveGame(){
// 		this.multiPlayer.leaveRoom();
// 	}
	
	
}