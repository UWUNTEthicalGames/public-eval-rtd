
import { generateUniqueRandomRoomCode } from "./main.js";
import { MultiPlayerHandler } from "./MultiPlayerHandler.js";
import { Player } from "./Player.js";


export class Game
{
	constructor () {
		
		this.players = [],
		this.outstandingRequests = {},
		this.receivedData = {},
		this.receivedRequests = [];
		
	}
	
	
	addPlayerToGame ( peerId, peerAlias, role="") {
		let player = new Player(peerId, peerAlias);
		player.setRole(role);
		this.players.push(player);
	}
	
	
	// 
	updateReceivedRequests () {
		
	}
		
	updateReceivedData () {
	
	}
		
	updateOutstandingRequests() {
	
	}	
	
}