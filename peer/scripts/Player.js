
export class Player {

	constructor(peerId, peerAlias){
		
		this.peerAlias = peerAlias;
 		this.peerId = peerId;
		this.role = "";
		this.status = "new";
	
	}
	
	
	set setRole(role) {
		this.role = role;
	}
	
	
	get getRole() {
		return this.role;
	}
	
	
	set setStatus(role) {
		this.role = role;
	}
	
	
	get getStatus() {
		return this.role;
	}	
}