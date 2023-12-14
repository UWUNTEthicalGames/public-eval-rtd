import * as Utils from "./utils.js";
import { MultiPlayerHandler } from "./MultiPlayerHandler.js";
import { Player } from "./Player.js";
import { loadBarChart } from "./grouped_barchart.js";



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
		
		this.demographicsValues = {
			"ourbusiness": [0,0,0,0,0,0,0,0],
			"competitor1": [0,0,0,0,0,0,0,0],
			"competitor2": [0,0,0,0,0,0,0,0]
		};
		
		this.loadCustomerInfoData();
		this.selectionLists = {};
		this.selectionLists["ourbusiness"] = [];
		this.selectionLists["competitor1"] = [];
		this.selectionLists["competitor2"] = [];
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
		//this.runtime.objects.HTMLElement.getFirstInstance().htmlContent = this.populateDemographicsChart();
		this.refreshDemographicsCharts();
		
		const intervalId = setInterval(
			() => {
				mapSecondsRemaining -= 0.05;
				// this.runtime.objects.TimerText.getFirstInstance().text = mapSecondsRemaining.toFixed(1).toString();
			},
			50
		);
		
		setTimeout(
			() => {
				console.log("Finished map timer!");
				//this.completeTimedMapSelection();
				clearInterval(intervalId);
			},
			mapSeconds * 1000
		);
	}
	
	
	startOperationsLayout() {
		this.SetSignallingStatus("operations method");
		this.multiPlayer.sendDataToAllPeers( GO_TO_PEER_LAYOUT, "RTD_Empty");
		
		this.bldg_entrances = {};
		for (const bldgSprite of this.runtime.objects.BuildingSprite.instances()) {
			this.bldg_entrances[bldgSprite.instVars.listName] = [bldgSprite.getImagePointX(0), bldgSprite.getImagePointY(0)];
		}
		console.log("bldg_entrances: " + this.bldg_entrances.toString());
	
		this.opPersonSprites = {};
		this.opPersonSprites["ourbusiness"] = [
			null,null,null,null,null,null,null,null,null,null,
			null,null,null,null,null,null,null,null,null,null];
		this.opPersonSprites["competitor1"] = [
			null,null,null,null,null,null,null,null,null,null,
			null,null,null,null,null,null,null,null,null,null];
		this.opPersonSprites["competitor2"] = [
			null,null,null,null,null,null,null,null,null,null,
			null,null,null,null,null,null,null,null,null,null];
			
		
		for (const opPersonSprite of this.runtime.objects.PersonSprite.instances()) {
			if (opPersonSprite.instVars.purpose == "queue") {
				opPersonSprite.setAnimation(
					Math.floor(Math.random()*20 + 1).toString().padStart(2, '0') + "_still", 
					"current-frame"
				);
				opPersonSprite.animationFrame = 2;
				console.log(opPersonSprite);
				this.opPersonSprites[opPersonSprite.instVars.selectedListName][opPersonSprite.instVars.queueNum] = opPersonSprite;
			}
		}
		console.log(this.opPersonSprites);
	
		let currentIndex = 0;
		const intervalId = setInterval(
			() => {
				for (const key of Object.keys(this.opPersonSprites)) {
					if (this.opPersonSprites[key][currentIndex]) {
						this.opPersonSprites[key][currentIndex].behaviors.MoveTo.moveToPosition(
						this.bldg_entrances[key][0], this.bldg_entrances[key][1]);
					}
				}
				currentIndex += 1;
			},
			500
		);
		
		setTimeout(
			() => {
				console.log("Finished movement timer!");
				clearInterval(intervalId);
			},
			500 * 20
		);
	}
	
	
	refreshDemographicsCharts() {
		for (const htmlElement of this.runtime.objects.HTMLElement.instances()) {
			const data = [
				['column', 'category', 'count'],
				['Credit history', 'No', this.demographicsValues[htmlElement.instVars.listName][0]],
				['Credit history', 'Yes', this.demographicsValues[htmlElement.instVars.listName][1]],
				['Environment', 'Rural', this.demographicsValues[htmlElement.instVars.listName][2]],
				['Environment', 'Suburban', this.demographicsValues[htmlElement.instVars.listName][3]],
				['Environment', 'Urban',  this.demographicsValues[htmlElement.instVars.listName][4]],
				['Income', '$', this.demographicsValues[htmlElement.instVars.listName][5]],
				['Income', '$$', this.demographicsValues[htmlElement.instVars.listName][6]],
				['Income', '$$$', this.demographicsValues[htmlElement.instVars.listName][7]]
			];
			loadBarChart(htmlElement, data, "_" +htmlElement.instVars.listName);
		}
	}
	
	/*
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
	*/
	
	selectionUpdate(messageObj) {
		const selectionId = messageObj.message.dataId;
		const listName = messageObj.message.listName;
		if (messageObj.type === SELECTION_ADDED) {
			this.selectionLists[listName].push(selectionId);
			this.registerSelectionChanged(selectionId, listName, 1);
		} else if (messageObj.type === SELECTION_REMOVED) {
			console.log(Object.keys(this.selectionLists));
			for (const listName of Object.keys(this.selectionLists)) {
				this.selectionLists[listName] = this.selectionLists[listName].filter(
					function(e) { return e !== selectionId }
				);
			}
			this.registerSelectionChanged(selectionId, listName, -1);
		}
		
		console.log(this.selectionLists);
		this.multiPlayer.sendDataToAllPeers(messageObj.type, messageObj.message);
	}
	
	
	registerSelectionChanged(dataId, listName, addRemoveMultiplier=1) {
		const vals = this.customerInfo[dataId];
		if (vals.Credit_History == 1.0) {
			this.demographicsValues[listName][0] += addRemoveMultiplier;
		} else {
			this.demographicsValues[listName][1] += addRemoveMultiplier;
		}
		
		if (vals.Property_Area == "Rural") {
			this.demographicsValues[listName][2] += addRemoveMultiplier;
		} else if (vals.Property_Area == "Semiurban") {
			this.demographicsValues[listName][3] += addRemoveMultiplier;
		} else if (vals.Property_Area == "Urban") {
			this.demographicsValues[listName][4] += addRemoveMultiplier;
		} else {
			console.warn("Unknown property area value: " + vals.Property_Area);
		}
		
		if (vals.ApplicantIncome < 2875) {
			this.demographicsValues[listName][5] += addRemoveMultiplier;
		} else if (vals.ApplicantIncome < 5795) {
			this.demographicsValues[listName][6] += addRemoveMultiplier;
		} else {
			this.demographicsValues[listName][7] += addRemoveMultiplier;
		}
		
		this.refreshDemographicsCharts();
		for (const listCountText of this.runtime.objects.ListCountText.instances()) {
			listCountText.text = "x " + this.selectionLists[listCountText.instVars.listName].length;
		}
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