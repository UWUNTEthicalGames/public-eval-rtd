import * as Utils from "./utils.js";
import { MultiPlayerHandler } from "./MultiPlayerHandler.js";
import { Player } from "./Player.js";



const CONNECTION_DATA = "__connection_data";
const PLAYER_DATA = "__player_data";
const GO_TO_PEER_LAYOUT = "go_to_peer_layout";
const LEVEL_START = "level_start";
const SELECTION_ADDED = "selection_added";
const SELECTION_REMOVED = "selection_removed";
const END_SELECTION_TIME = "end_selection_time";

const NUM_ROOM_CODE_CHARACTERS = 4;


export class Game {

	constructor(runtime) {
		this.initializeGame(runtime);
	}

	initializeGame (runtime) {
		this.SetSignallingStatus("In Game", "Game.js");
		
		this.runtime = runtime;
		this.numOfPlayers = 0;
		this.players = [];
		this.selectedTesters = [];
		
		this.multiPlayer = new MultiPlayerHandler(runtime);
		this.roomCode = Utils.generateUniqueRandomRoomCode(runtime, NUM_ROOM_CODE_CHARACTERS);
		this.runtime.globalVars.ROOM_CODE = this.roomCode;
		
		this.demographicsValues = [0,0,0,0,0,0,0,0];
		
		this.loadCustomerInfoData();
		this.selectedIds = [];
	}
	
	
	async loadCustomerInfoData() {
		const response = await fetch("customer_info.csv");
		const fetchedText = await response.text();
		this.customerInfo = Utils.parseCSVTextToKeyedObj(fetchedText, "Loan_ID");
	}
	
	
	addPlayerToGame ( peerId, peerAlias, role="") {
		this.SetSignallingStatus("start game", "Game.js");
		
		const player = new Player(peerId, peerAlias);
		player.setRole = role;
		this.players.push(player);
		
		this.refreshPlayerListToDisplay();
		
		this.multiPlayer.setAndSendPlayerRole(player);
		this.multiPlayer.sendRequestToSpecificPeer(CONNECTION_DATA, player);
	}
	
	
	startGameLobbyLayout() {
		this.SetSignallingStatus("game lobby method");
		this.runtime.objects.RoomCodeText.getFirstInstance().text = this.roomCode;
	}
	
	
	refreshPlayerListToDisplay() {
		this.SetSignallingStatus("Refreshing players list to display", "Game.js");
		
		let playersToDisplay = "";	
			
		for (const player of this.players){
			playersToDisplay += player.peerAlias + "\n";
		}
		
		this.runtime.objects.PlayerCountText.getFirstInstance().text = this.players.length.toString();
		this.runtime.objects.PlayerListText.getFirstInstance().text = playersToDisplay;
	}
	
	
	startLevelChooserLayout() {
		this.SetSignallingStatus("level chooser method");
		this.multiPlayer.sendDataToAllPeers( GO_TO_PEER_LAYOUT, "RTD_Empty");
	}
	
	
	startInstructionsLayout() {
		this.SetSignallingStatus("instructions method");
		this.multiPlayer.sendDataToAllPeers( GO_TO_PEER_LAYOUT, "RTD_Empty");
	}


	startBusinessInfoLayout() {
		this.SetSignallingStatus("businessInfo method");
		this.multiPlayer.sendDataToAllPeers( GO_TO_PEER_LAYOUT, "RTD_Empty");
	}	
	
	
	startDemographicsLayout() {
		this.SetSignallingStatus("demographics method");
		this.multiPlayer.sendDataToAllPeers( GO_TO_PEER_LAYOUT, "RTD_MapSelection");
	
		const mapSeconds = 60;
		let mapSecondsRemaining = mapSeconds;
		this.runtime.objects.TimerText.getFirstInstance().text = mapSeconds.toFixed(1).toString();
		this.runtime.objects.HTMLElement.getFirstInstance().htmlContent = this.populateDemographicsChart();
		
		const intervalId = setInterval(
			() => {
				mapSecondsRemaining -= 0.05;
				this.runtime.objects.TimerText.getFirstInstance().text = mapSecondsRemaining.toFixed(1).toString();
			},
			50
		);
		
		setTimeout(
			() => {
				console.log("Finished map timer!");
				this.completeTimedMapSelection();
				clearInterval(intervalId);
			},
			mapSeconds * 1000
		);
	}
	
	
	populateDemographicsChart(values=this.demographicsValues) 
	{
		console.log("Preparing chart");

		const labels = ["Credit history", "No credit history", "Rural", "Suburban", "Urban", "$", "$$", "$$$"];
		const data = {
		  labels: labels,
		  datasets: [{
			label: 'Selected Demographics',
			data: [...values],
			backgroundColor: [
			  'rgba(255, 99, 132, 0.2)',
			  'rgba(255, 99, 132, 0.2)',
			  'rgba(75, 192, 192, 0.2)',
			  'rgba(75, 192, 192, 0.2)',
			  'rgba(75, 192, 192, 0.2)',
			  'rgba(201, 203, 207, 0.2)',
			  'rgba(201, 203, 207, 0.2)',
			  'rgba(201, 203, 207, 0.2)'
			],
			borderColor: [
			  'rgb(255, 99, 132)',
			  'rgb(255, 99, 132)',
			  'rgb(75, 192, 192)',
			  'rgb(75, 192, 192)',
			  'rgb(75, 192, 192)',
			  'rgb(201, 203, 207)',
			  'rgb(201, 203, 207)',
			  'rgb(201, 203, 207)'
			],
			borderWidth: 2
		  }]
		};

		return new Chart("myChart", {
		  type: "bar",
		  data: data,
		  options: {
			legend: {
				display: true
			},
			scales: { 
				y: { 
					beginAtZero: true
				}
			}
		  }
		});
	}
	
	
	selectionUpdate(messageObj) {
		const selectionId = messageObj.message.dataId;
		if (messageObj.type === SELECTION_ADDED) {
			this.selectedIds.push(messageObj.message.dataId);
			this.registerSelectionChanged(selectionId, 1);
		} else if (messageObj.type === SELECTION_REMOVED) {
			this.selectedIds = this.selectedIds.filter(
				function(e) { return e !== messageObj.message.dataId }
			);
			this.registerSelectionChanged(selectionId, -1);
		}
		
		console.log(this.selectedIds);
		this.multiPlayer.sendDataToAllPeers(messageObj.type, messageObj.message);
	}
	
	
	registerSelectionChanged(dataId, addRemoveMultiplier=1) {
		const vals = this.customerInfo[dataId];
		console.log(vals);
		if (vals.Credit_History == 1.0) {
			this.demographicsValues[0] += addRemoveMultiplier;
		} else {
			this.demographicsValues[1] += addRemoveMultiplier;
		}
		
		if (vals.Property_Area == "Rural") {
			this.demographicsValues[2] += addRemoveMultiplier;
		} else if (vals.Property_Area == "Semiurban") {
			this.demographicsValues[3] += addRemoveMultiplier;
		} else if (vals.Property_Area == "Urban") {
			this.demographicsValues[4] += addRemoveMultiplier;
		} else {
			console.warn("Unknown property area value: " + vals.Property_Area);
		}
		
		if (vals.ApplicantIncome < 2875) {
			this.demographicsValues[5] += addRemoveMultiplier;
		} else if (vals.ApplicantIncome < 5795) {
			this.demographicsValues[6] += addRemoveMultiplier;
		} else {
			this.demographicsValues[7] += addRemoveMultiplier;
		}
		
		this.populateDemographicsChart();
	}
	
	
	completeTimedMapSelection() {
		this.runtime.objects.TimerText.getFirstInstance().text = "0.0";
		this.multiPlayer.sendDataToAllPeers( END_SELECTION_TIME, "");
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