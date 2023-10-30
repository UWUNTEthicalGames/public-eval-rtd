
export class Player {

	constructor(peerId, peerAlias){
		
		this.peerAlias = peerAlias;
 		this.peerId = peerId;
		this.role = "";
	
	}
	
	
	set setRole(role) {
		this.role = role;
	}
	
	
	get getRole() {
		return this.role;
	}
}