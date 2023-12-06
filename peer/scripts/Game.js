import { MultiPlayerHandler } from "./MultiPlayerHandler.js";
import { Player } from "./Player.js";

const CONNECTION_DATA = "__connection_data";
const PLAYER_DATA = "__player_data";
const SELECTION_ADDED = "selection_added";
const SELECTION_REMOVED = "selection_removed";


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
		
		//debugger;
		if ( (this.runtime.globalVars.ROOM_CODE && this.runtime.globalVars.PLAYER_ALIAS))
			this.multiPlayer.connectToSignalling();
		else
		{
			this.SetSignallingStatus("Please provide ROOM CODE and ALIAS");
		}
			
	}
	
	
	selectPerson(personSpriteObj) {
		console.log("Person selected with dataId="+personSpriteObj.instVars);
		console.log(personSpriteObj);
		if (!personSpriteObj.instVars.selected) {
			personSpriteObj.instVars.selected = true;
			personSpriteObj.opacity = 0.5;
			this.multiPlayer.sendDataToHost(SELECTION_ADDED, personSpriteObj.instVars.dataId);
		}
	}
	
	
	deselectPerson(personSpriteObj) {
		console.log("Person de-selected.");
		console.log(personSpriteObj);
		if (personSpriteObj.instVars.selected) {
			personSpriteObj.instVars.selected = false;
			personSpriteObj.opacity = 1.0;
			this.multiPlayer.sendDataToHost(SELECTION_REMOVED, personSpriteObj.instVars.dataId);
		}
	}

	
	getPersonSpriteByDataId(dataId) {
		for (const ps of this.runtime.objects.PersonSprite.instances()) {
			if (ps.instVars.dataId == dataId) {
				return ps;
			}
		}
		console.warn("Could not find selection by Data ID!");
	}
	
	
	registerPeerSelectPerson(messageObj) {
		console.log("Person selected by peer.");
		const personSpriteObj = this.getPersonSpriteByDataId(messageObj.message);
		if (!personSpriteObj.instVars.selected) {
			personSpriteObj.instVars.selected = true;
			personSpriteObj.opacity = 0.5;
		}
	}
	
	
	registerPeerDeselectPerson(messageObj) {
		console.log("Person de-selected by peer.");
		const personSpriteObj = this.getPersonSpriteByDataId(messageObj.message);
		if (personSpriteObj.instVars.selected) {
			personSpriteObj.instVars.selected = false;
			personSpriteObj.opacity = 1.0;
		}
	}
	
	
	// This method can be used to show status of game on layout/console
    SetSignallingStatus(str)
	{
		this.signallingStatus = "Game.js : " + str
		console.log(this.signallingStatus);
	}
	
}