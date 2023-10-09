import { generateUniqueRandomRoomCode } from "./main.js";


export class MultiPlayerHandler {

	

    constructor (runtime) {
		console.debug("In constructor of MultiplayerHandler");
        
		this.runtime = runtime;
        this.multiPlayer = this.runtime.objects.Multiplayer;
		this.signallingStatus = "";
		
		this.connectionUrl = "wss://multiplayer.scirra.com";
		this.gameHost = "game-host";
		
        // add buttons and text input fields
		

        this.ConnectToSignalling();
    }

	// this method handles all the APIs for connecting, login and joining the room.
    async ConnectToSignalling() {
        try {
            var signalling = this.multiPlayer.signalling;

            if (!signalling.isConnected)
            {
				this.SetSignallingStatus("Connecting...");
				await signalling.connect(this.connectionUrl);
			}
			
            if (!signalling.isLoggedIn)
			{
				this.SetSignallingStatus("Logging in...");
				await signalling.login(this.gameHost);
			}

            this.SetSignallingStatus("Joining room...");
			
			
            // join game with name, instance and room code
			await signalling.joinRoom(this.runtime.globalVars.GAME_NAME, this.runtime.globalVars.GAME_INSTANCE_NAME, this.runtime.globalVars.ROOM_CODE );

            if (this.multiPlayer.isHost)
            {
                this.SetSignallingStatus("Joined room "+ this.runtime.globalVars.ROOM_CODE +" as HOST");
            }
			else
            {
				this.SetSignallingStatus("Joined room as peer");
            }
			
			
        }
        catch (err){
            this.SetSignallingStatus("Error");
			console.error(signalling.error);
			console.error("Signalling error: ", err);
			
        }
    }

    // This method can be used to show status of game on layout/console
    SetSignallingStatus(str)
	{
		this.signallingStatus = "MultiPlayer : " + str
		console.log(this.signallingStatus);
	}
	
	
	
	
	
	
	
}