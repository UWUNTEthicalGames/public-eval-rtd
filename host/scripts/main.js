
// Import any other script files here, e.g.:
// import * as myModule from "./mymodule.js";
import { MultiPlayerHandler } from "./MultiPlayerHandler.js";
import { Game } from "./Game.js";


// Import any other script files here
import 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.bundle.min.js'

export function main(runtime)
{
	//const gameLobbyLayout = runtime.getLayout("GameLobby");
	generateUniqueRandomRoomCode(runtime, runtime.globalVars.NUM_ROOM_CODE_CHARACTERS);
	var multiPlayer = null;
	multiPlayer = new MultiPlayerHandler(runtime);
	//var mainGame = new Game(runtime);	
}

export function addDataAndPopulateChart() 
{
	// Code to run just before 'On start of layout' on
	// the first layout. Loading has finished and initial
	// instances are created and available to use here.
	
	// runtime.addEventListener("tick", () => Tick(runtime));
	
	console.log("Project start, gettting data ready")
	
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

	new Chart("myChart", {
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

export function generateRandomRoomCode(characters) {
	if (characters != 3 && characters != 4) {
		throw "Tried to generate room code with inappropriate number of characters. Choose 3 or 4 characters only.";
	}
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	// List found at https://www.noswearing.com/
	const badCodes = new Set(["", "ASS", "CUM", "FAG", "GAY", "HOE", "JAP", "TIT", "VAG", "WOP",
	"ANUS", "ARSE", "CLIT", "COCK", "COON", "CUNT", "DAGO", "DICK", "DIKE", "DYKE",
	"FUCK", "GOOK", "HEEB", "HELL", "HOMO", "JIZZ", "KIKE", "KUNT", "KYKE", "MICK",
	"MUFF", "NAZI", "PAKI", "PISS", "POON", "PUTO", "SHIT", "SHIZ", "SLUT", "SMEG",
	"SPIC", "TARD", "TITS", "TWAT", "TWIT", "WANK"]);
	let roomCode = "";
	while (badCodes.has(roomCode)) {
		for (let i = 0; i < characters; i++) {
			roomCode += alphabet[Math.floor(Math.random() * alphabet.length)];
		}
	}
	return roomCode;
}

export function generateUniqueRandomRoomCode(runtime, characters) {
	let proposed_room_code = generateRandomRoomCode(characters);
	while (runtime.callFunction("CompareRoomCodeToExistingRooms", proposed_room_code) != 0) {
		proposed_room_code = generateRandomRoomCode(characters);
	}
	runtime.globalVars.ROOM_CODE = proposed_room_code;
}

