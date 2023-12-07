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
	return proposed_room_code;
}


export function readCSVFile(file, callback) {
	const reader = new FileReader();

	reader.onload = function (e) {
		const csvData = e.target.result;
		const lines = csvData.split('\n').map(line => line.split(','));
		callback(null, lines);
	};

	reader.onerror = function (e) {
		callback(e.target.error, null);
	};

	reader.readAsText(file);
}


export function parseCSVTextToObjArray(data, line_delimiter='\n', value_delimiter=',') {
	// Copied from https://www.30secondsofcode.org/js/s/csv-to-json/
	const titles = data.slice(0, data.indexOf(line_delimiter)).split(value_delimiter);
	return data
		.slice(data.indexOf(line_delimiter) + 1)
		.split(line_delimiter)
		.map(v => {
			const values = v.split(value_delimiter);
			return titles.reduce(
				(obj, title, index) => ((obj[title] = values[index]), obj),
				{}
			);
		}
	);
}


export function parseCSVTextToKeyedObj(data, key) {
	const obj_list = parseCSVTextToObjArray(data);
	
	const result = {};
	
	for (const row of obj_list) {
		result[row[key]] = row;
	}
	console.log(result);
	return result;
}