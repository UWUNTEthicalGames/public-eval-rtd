import * as Utils from "./utils.js";
import { MultiPlayerHandler } from "./MultiPlayerHandler.js";
import { Player } from "./Player.js";
import { loadBarChart } from "./grouped_barchart.js";
import { loadConfusionMatrix } from "./confusionMatrix.js";
import { loadScatterPlot } from "./scatterPlot.js";


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
		
		this.multiPlayer = new MultiPlayerHandler(runtime);
		this.roomCode = Utils.generateUniqueRandomRoomCode(runtime, NUM_ROOM_CODE_CHARACTERS);
		this.runtime.globalVars.ROOM_CODE = this.roomCode;
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
	
	
	startGameLobbyLayout() {
		this.SetSignallingStatus("game lobby method");
		this.runtime.objects.RoomCodeText.getFirstInstance().text = this.roomCode;
	}
	
	
	refreshPlayerListToDisplay() {
		this.SetSignallingStatus("Refreshing players list to display", "Game.js");
		
		let playersToDisplay = "";	
			
		for (let player of this.players){
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
		this.multiPlayer.sendDataToAllPeers( GO_TO_PEER_LAYOUT, "RTD_MapSelection");
		const mapSeconds = 10;
		let mapSecondsRemaining = mapSeconds;
		this.runtime.objects.TimerText.getFirstInstance().text = mapSeconds.toFixed(1).toString();
		//this.runtime.objects.HTMLElement.getFirstInstance().htmlContent = this.addDataAndPopulateChart();
		loadBarChart();
		const intervalId = setInterval(
			() => {
				mapSecondsRemaining -= 0.05;
				this.runtime.objects.TimerText.getFirstInstance().text = mapSecondsRemaining.toFixed(1).toString();
			},
			50
		);
		
		setTimeout(
			() => {
				console.log("Switching chart!");
				//this.runtime.objects.HTMLElement.getFirstInstance().htmlContent = this.addDataAndPopulateChart2();
			},
			4000
		);
		
		setTimeout(
			() => {
				console.log("Finished map timer!");
				this.completeTimedMapSelection();
				clearInterval(intervalId);
				this.runtime.goToLayout("RTD_Evaluation");
			},
			mapSeconds * 1000
		);
	}
	
	
	startEvaluationLayout() {
		loadScatterPlot();
	}
	
	startScoreLayout() {
		loadConfusionMatrix();
	}
	
	
	addDataAndPopulateChart() 
	{
		console.log("Preparing chart");

		const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
		const data = {
		  labels: labels,
		  datasets: [{
			label: 'My First Dataset',
			data: [65, 59, 80, 81, 56, 55, 40],
			backgroundColor: [
			  'rgba(255, 99, 132, 0.2)',
			  'rgba(255, 159, 64, 0.2)',
			  'rgba(255, 205, 86, 0.2)',
			  'rgba(75, 192, 192, 0.2)',
			  'rgba(54, 162, 235, 0.2)',
			  'rgba(153, 102, 255, 0.2)',
			  'rgba(201, 203, 207, 0.2)'
			],
			borderColor: [
			  'rgb(255, 99, 132)',
			  'rgb(255, 159, 64)',
			  'rgb(255, 205, 86)',
			  'rgb(75, 192, 192)',
			  'rgb(54, 162, 235)',
			  'rgb(153, 102, 255)',
			  'rgb(201, 203, 207)'
			],
			borderWidth: 1
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
	
	
	addDataAndPopulateChart2() 
	{
		console.log("Preparing chart");

		const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
		const data = {
		  labels: labels,
		  datasets: [{
			label: 'My First Dataset',
			data: [65, 56, 55, 40, 59, 80, 81,],
			backgroundColor: [
			  'rgba(75, 192, 192, 0.2)',
			  'rgba(54, 162, 235, 0.2)',
			  'rgba(153, 102, 255, 0.2)',
			  'rgba(255, 99, 132, 0.2)',
			  'rgba(255, 159, 64, 0.2)',
			  'rgba(255, 205, 86, 0.2)',
			  'rgba(201, 203, 207, 0.2)'
			],
			borderColor: [
			  'rgb(255, 99, 132)',
			  'rgb(255, 159, 64)',
			  'rgb(255, 205, 86)',
			  'rgb(75, 192, 192)',
			  'rgb(54, 162, 235)',
			  'rgb(153, 102, 255)',
			  'rgb(201, 203, 207)'
			],
			borderWidth: 1
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