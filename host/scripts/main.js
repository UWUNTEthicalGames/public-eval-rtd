
// Import any other script files here, e.g.:
// import * as myModule from "./mymodule.js";
import { customer_data } from "./customer_data.js";


// Import any other script files here
import 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.bundle.min.js'

var visualizationDataRatios;
var prospective_customers = [];

const selectedDataRatios = new Object();
const selectedDataWeights = new Object();


export function addDataAndPopulateChart(model) 
{	
	if (model == "loan_applications") {
		const female_perc = visualizationDataRatios[0] / (visualizationDataRatios[0] + visualizationDataRatios[1]);
		const male_perc = visualizationDataRatios[1] / (visualizationDataRatios[0] + visualizationDataRatios[1]);
		const dependents_0_perc = visualizationDataRatios[2] / (visualizationDataRatios[2] + visualizationDataRatios[3] + visualizationDataRatios[4] + visualizationDataRatios[5]);
		const dependents_1_perc = visualizationDataRatios[3] / (visualizationDataRatios[2] + visualizationDataRatios[3] + visualizationDataRatios[4] + visualizationDataRatios[5]);
		const dependents_2_perc = visualizationDataRatios[4] / (visualizationDataRatios[2] + visualizationDataRatios[3] + visualizationDataRatios[4] + visualizationDataRatios[5]);
		const dependents_3plus_perc = visualizationDataRatios[5] / (visualizationDataRatios[2] + visualizationDataRatios[3] + visualizationDataRatios[4] + visualizationDataRatios[5]);
		const uneducated_perc = visualizationDataRatios[6] / (visualizationDataRatios[6] + visualizationDataRatios[7]);
		const educated_perc = visualizationDataRatios[7] / (visualizationDataRatios[6] + visualizationDataRatios[7]);
		const urban_perc = visualizationDataRatios[8] / (visualizationDataRatios[8] + visualizationDataRatios[9] + visualizationDataRatios[10]);
		const suburban_perc = visualizationDataRatios[9] / (visualizationDataRatios[8] + visualizationDataRatios[9] + visualizationDataRatios[10]);
		const rural_perc = visualizationDataRatios[10] / (visualizationDataRatios[8] + visualizationDataRatios[9] + visualizationDataRatios[10]);
		
		console.log("visualization data ratios: " + visualizationDataRatios);
		console.log([female_perc, male_perc, dependents_0_perc, dependents_1_perc, dependents_2_perc, dependents_3plus_perc, uneducated_perc, educated_perc, urban_perc, suburban_perc, rural_perc]);

		const labels = ["Gender", "Number of Dependents", "Education", "Property Type"];
		var data = {
		  labels: labels,
		  datasets: [
			{data: [female_perc, dependents_0_perc, uneducated_perc, urban_perc]},
			{data: [male_perc, dependents_1_perc, educated_perc, suburban_perc]},
			{data: [null, dependents_2_perc, null, rural_perc]},
			{data: [null, dependents_3plus_perc, null, null]}
		  ]
		};
	}
	
	new Chart("myChart", {
	  type: "bar",
	  data: data,
	  options: {
	    indexAxis: 'y',
		legend: {
			display: false
		},
		scales: { 
			x: { 
				beginAtZero: true,
				stacked: true
			},
			y: {
				beginAtZero: true,
				stacked: true
			}
		}
	  }
	});
}


export function selectAllCustomersForWave(model) {
	if (model == "loan_applications") {
		for (const uid in selectedDataWeights) {
			var feature_binary_str = "";
		
			while (!(feature_binary_str in customer_data)) {
				// Choose random numbers for each feature
				const gender_rand = Math.random();
				const dependents_rand = Math.random();
				const education_rand = Math.random();
				const property_rand = Math.random();

				console.log("Random numbers for features: " + gender_rand + ", " + dependents_rand + ", " + education_rand + ", " + property_rand);


				if (gender_rand < selectedDataRatios[uid][0]) {
					feature_binary_str = feature_binary_str.concat("10");
				} else {
					feature_binary_str = feature_binary_str.concat("01");
				}

				if (dependents_rand < selectedDataRatios[uid][2]) {
					feature_binary_str = feature_binary_str.concat("1000");
				} else if (dependents_rand < (selectedDataRatios[uid][2] + selectedDataRatios[uid][3])) {
					feature_binary_str = feature_binary_str.concat("0100");
				} else if (dependents_rand < (selectedDataRatios[uid][2] + selectedDataRatios[uid][3] + selectedDataRatios[uid][4])) {
					feature_binary_str = feature_binary_str.concat("0010");
				} else {
					feature_binary_str = feature_binary_str.concat("0001");
				}

				if (education_rand < selectedDataRatios[uid][6]) {
					feature_binary_str = feature_binary_str.concat("10");
				} else {
					feature_binary_str = feature_binary_str.concat("01");
				}

				if (property_rand < selectedDataRatios[uid][8]) {
					feature_binary_str = feature_binary_str.concat("100");
				} else if (dependents_rand < (selectedDataRatios[uid][8] + selectedDataRatios[uid][9])) {
					feature_binary_str = feature_binary_str.concat("010");
				} else {
					feature_binary_str = feature_binary_str.concat("001");
				}

				console.log("Feature binary for UID " + uid + " and ratio " + selectedDataRatios[uid] + ": " + feature_binary_str);
			}
			
			console.log("selectedDataWeights[uid]: " + selectedDataWeights[uid]);
			for (var i = 0; i < selectedDataWeights[uid]; i++) {
				const selected_prospective_customer = customer_data[feature_binary_str][Math.floor(Math.random() * customer_data[feature_binary_str].length)];
				console.log("Prospective customer selected: " + selected_prospective_customer);
				prospective_customers.push(selected_prospective_customer);
			}
		}
	}
	
	console.log("Number of prospective customers: " + prospective_customers.length);
	console.log(prospective_customers);
}


export function chooseRandomProspectiveCustomer() {
	return prospective_customers[Math.floor(Math.random() * prospective_customers.length)];
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



export function parseDataRatiosMessage(message, model) {
	if (model == "loan_applications") {
		console.log("Typeof message: " + typeof(message))
		var feature_values = message.split("/");
		var dataRatios_str = [...feature_values[0].split(":"), ...feature_values[1].split(":"), ...feature_values[2].split(":"), ...feature_values[3].split(":")];
		var dataRatios = dataRatios_str.map(numStr => parseInt(numStr)); // https://medium.com/dailyjs/parseint-mystery-7c4368ef7b21
		console.log("Parsed incoming data ratios message (" + message + ") as " + dataRatios);
		
	return dataRatios;
	}
}


export function registerDataRatiosAndWeight(message) {
	const message_values = message.split("_");
	const uid = message_values[0];
	const weight = parseInt(message_values[1]);
	const ratios = message_values[2];
	
	console.log("uid: " + uid + ", weight: " + weight + ", ratios: " + ratios);
	
	const parsedRatios = parseDataRatiosMessage(ratios, "loan_applications");
	
	if (!(uid in selectedDataRatios)) {
		selectedDataRatios[uid] = parsedRatios;
	}
	if (!(uid in selectedDataWeights)) {
		selectedDataWeights[uid] = 0;
	}
	
	selectedDataWeights[uid] += weight;
	
	addToVisualizationDataRatios(weight, parsedRatios);
}


export function initializeVisualizationDataRatios(model) {
	if (model == "loan_applications") {
		visualizationDataRatios = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		console.log("visualizationDataRatios: " + visualizationDataRatios);
	}
}


export function addToVisualizationDataRatios(weight, parsedDataRatioArr) {
	for (var i=0; i < visualizationDataRatios.length; i++) {
		visualizationDataRatios[i] += (parsedDataRatioArr[i] * weight);
	}
	console.log("visualizationDataRatios: " + visualizationDataRatios);
}