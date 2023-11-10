
import { generateUniqueRandomRoomCode, addDataAndPopulateChart } from "./main.js";
import { MultiPlayerHandler } from "./MultiPlayerHandler.js";
import { Player } from "./Player.js";



const CONNECTION_DATA = "__connection_data";
const PLAYER_DATA = "__player_data";
const GO_TO_PEER_LAYOUT = "go_to_peer_layout";
const LEVEL_START = "level_start";


export class Game {

	constructor(runtime) {
		this.initializeGame(runtime);
		
		
	}

	initializeGame (runtime) {
		this.SetSignallingStatus("In Game", "Game.js");
		
		this.numOfPlayers = 0;
		this.players = [];
	
		this.runtime = runtime;
		this.multiPlayer = new MultiPlayerHandler(runtime);

		this.playerListText = runtime.objects.PlayerListText.getFirstInstance();
		this.playerCountText = runtime.objects.PlayerCountText.getFirstInstance();

		this.startGameBtn = runtime.objects.Button.getFirstInstance();
		//runtime.addEventListener("mousedown", (e) => this.mouseDown(e));
		
	}
	
	
	startGame () {
		this.SetSignallingStatus("start game", "Game.js");
		
		this.runtime.goToLayout(this.startGameBtn.instVars['levelTarget']);
		//this.multiPlayer.sendDataToAllPeers("level_start", this.startGameBtn.instVars['levelTarget']);
	
	}
	
	
	addPlayerToGame ( peerId, peerAlias, role="") {
		this.SetSignallingStatus("start game", "Game.js");
		
		let player = new Player(peerId, peerAlias);
		player.setRole = role;
		this.players.push(player);
		
		this.refreshPlayerListToDisplay();
		
		this.multiPlayer.setAndSendPlayerRole(player);
		this.multiPlayer.sendRequestToSpecificPeer(CONNECTION_DATA, player);
	}
	
	
	refreshPlayerListToDisplay() {
		this.SetSignallingStatus("Refreshing players list to display", "Game.js");
		
		let playersToDisplay = "";	
			
		for (let player of this.players){
			playersToDisplay += player.peerAlias + "\n";
		}
		
		//console.log(playersToDisplay);
		this.playerCountText.text = this.players.length.toString();
		this.playerListText.text = playersToDisplay;
		
		
		
	}
	
	
	levelChooserLayout() {
		this.SetSignallingStatus("level chooser method");
		this.multiPlayer.sendDataToAllPeers( LEVEL_START, this.runtime.objects.Button.getFirstPickedInstance().instVars["levelTarget"]);	
		this.multiPlayer.sendDataToAllPeers( GO_TO_PEER_LAYOUT, "RTD_Empty");
	}
	
	
	instructionsLayout() {
		this.SetSignallingStatus("instructions method");
		this.multiPlayer.sendDataToAllPeers( LEVEL_START, this.runtime.objects.Button.getFirstPickedInstance().instVars["levelTarget"]);	
		this.multiPlayer.sendDataToAllPeers( GO_TO_PEER_LAYOUT, "RTD_Empty");
	}


	businessInfoLayout() {
		this.SetSignallingStatus("businessInfo method");
		this.multiPlayer.sendDataToAllPeers( LEVEL_START, this.runtime.objects.Button.getFirstPickedInstance().instVars["levelTarget"]);	
		this.multiPlayer.sendDataToAllPeers( GO_TO_PEER_LAYOUT, "RTD_Empty");
		this.runtime.objects.TimerText.text = 10;
		
		this.runtime.objects.HTMLElement.htmlContent = addDataAndPopulateChart();
		
		let timeLeft = 4;
		setTimeout(timeLeft * 1000);
		while (timeLeft > -1 ){
			this.runtime.objects.TimerText.text = timeLeft;
			
			timeLeft--;
			
		}
		clearTimeout();
		
	}

	leaveRoom(e) {
	
		for (const player of this.players){
			if (player.peerAlias === e.peerAlias)
				this.players.splice(this.players.indexOf(player), 1);;
				break;
		}
	
		this.refreshPlayerListToDisplay();
	}
	
	
	// This method can be used to show status of game on layout/console
    SetSignallingStatus(str)
	{
		this.signallingStatus = "Game.js : " + str
		console.log(this.signallingStatus);
	}	
}	