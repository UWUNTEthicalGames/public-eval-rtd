
// Import any other script files here, e.g.:
// import * as myModule from "./mymodule.js";

/* DEFAULT CODE
runOnStartup(async runtime =>
{
	// Code to run on the loading screen.
	// Note layouts, objects etc. are not yet available.
	
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

async function OnBeforeProjectStart(runtime)
{
	// Code to run just before 'On start of layout' on
	// the first layout. Loading has finished and initial
	// instances are created and available to use here.
	
	runtime.addEventListener("tick", () => Tick(runtime));
}

function Tick(runtime)
{
	// Code to run every tick
}
*/

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