import { MultiPlayerHandler } from "./MultiPlayerHandler.js";
import { Player } from "./Player.js";




const CONNECTION_DATA = "__connection_data";
const PLAYER_DATA = "__player_data";


export class Game {

	constructor(runtime) {
		this.initializeGame(runtime);
	}

	initializeGame (runtime) {
		this.SetSignallingStatus("In GameLobby");
		
		this.numOfPlayers = 0;
		this.players = [];
	
		this.runtime = runtime;
		this.multiPlayer = new MultiPlayerHandler(runtime);

		//this.connectBtn = runtime.objects.ConnectButton.getFirstInstance();
		//runtime.addEventListener("mousedown", (e) => this.mouseDown(e));
		
	}
	
	connectPeer() {
		this.SetSignallingStatus("On connect peer");
		
		//this.playerAlias = this.runtime.objects.NameInput.getFirstInstance().text;
		this.runtime.globalVars.ROOM_CODE = this.runtime.objects.RoomCodeInput.getFirstInstance().text;
		this.runtime.globalVars.PLAYER_ALIAS = this.runtime.objects.NameInput.getFirstInstance().text;
		
		if ( (this.runtime.globalVars.ROOM_CODE && this.runtime.globalVars.PLAYER_ALIAS))
			this.multiPlayer.connectToSignalling();
		else
		{
			this.SetSignallingStatus("Please provide ROOM CODE and ALIAS");
		}
			
	}
	
	// This method can be used to show status of game on layout/console
    SetSignallingStatus(str)
	{
		this.signallingStatus = "Game.js : " + str
		console.log(this.signallingStatus);
	}
	
}