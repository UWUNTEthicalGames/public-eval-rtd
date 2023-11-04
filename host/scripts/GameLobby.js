import { MultiPlayerHandler } from "./MultiPlayerHandler.js";



export class GameLobby {

	constructor(runtime) {
		logging("In GameLobby", "GameLobby.js");
	
		this.runtime = runtime;
		this.multiPlayer = new MultiPlayerHandler(runtime);

		this.playerListText = runtime.objects.PlayerListText.getFirstInstance();
		this.playerCountText = runtime.objects.PlayerCountText.getFirstInstance();

		this.startGameBtn = runtime.objects.Button.getFirstInstance();
		runtime.addEventListener("mousedown", (e) => this.mouseDown(e));
	
	}

	initializeGame() {
		// Use it if required;

	}


	startGame() {
		logging("start game", "GameLobby.js");
		this.runtime.goToLayout("LevelChooser");

		this.multiPlayer.sendDataToAllPeers("level_start", this.startGameBtn.instVars['levelTarget']);
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


	mouseDown(e){
		if (this.runtime.layout === this.runtime.getLayout("GameLobby"))
			this.buttonClicked((this.startGameBtn !== null ? this.startGameBtn : null), e);
		}


	buttonClicked(object, e) {
			if (object !== null){
				const [layerX, layerY] = this.CssPxLayer(this.runtime.layout,  e.clientX, e.clientY);

				if (object.containsPoint(layerX, layerY))
					this.startGame();
			}
		}
		

	CssPxLayer(layout, clientX, clientY){
			const layer = layout.getLayer(0);
			return layer.cssPxToLayer(clientX, clientY);
		}

}