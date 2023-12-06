
// Import any other script files here, e.g.:
// import * as myModule from "./mymodule.js";
import { MultiPlayerHandler } from "./MultiPlayerHandler.js";
import { Game } from "./Game.js";
import  Globals  from "./globals.js";


var game = null;
// Import any other script files here
import 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.bundle.min.js'
import 'https://d3js.org/d3.v7.min.js';

runOnStartup(async runtime =>
{	
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
	
	game = new Game(runtime);
	Globals.GameObj = game;
})

async function OnBeforeProjectStart(runtime)
{
	runtime.getLayout("GameLobby").addEventListener("beforelayoutstart", () => game.startGameLobbyLayout());
	runtime.getLayout("LevelChooser").addEventListener("beforelayoutstart", () => game.startLevelChooserLayout());
	runtime.getLayout("Instructions").addEventListener("beforelayoutstart", () => game.startInstructionsLayout());
	runtime.getLayout("BusinessInfo").addEventListener("beforelayoutstart", () => game.startBusinessInfoLayout());
	runtime.getLayout("Demographics").addEventListener("beforelayoutstart", () => game.startDemographicsLayout());
	runtime.getLayout("RTD_Evaluation").addEventListener("beforelayoutstart", () => game.startEvaluationLayout());
	runtime.getLayout("RTD_Score").addEventListener("beforelayoutstart", () => game.startScoreLayout());
}

