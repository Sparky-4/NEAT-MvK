/*Generating quads given an atlas and a width and height for the tile by adding
 *a quad in an array for each quad in the atlas
 */
function GenerateQuads(atlas, tileWidth, tileHeight, vWidth, vHeight){
	let sheetWidth = atlas.width;
	let sheetHeight = atlas.height;
	
	let sheetCounter = 0;
	let spriteSheet = [];
	
	for(let y = 0; y < sheetHeight; y+=tileHeight)
	{
		for(let x = 0; x < sheetWidth; x+= tileWidth)
		{
			spriteSheet[sheetCounter] = new Quad(x, y,
			tileWidth, tileHeight, atlas, vWidth, vHeight);
			sheetCounter++;
		}
	}
	return spriteSheet;
}

function offsetMack(spriteSheet){
	for(let i = 0; i < spriteSheet.length; i++){
		spriteSheet[i].yOffset = -189;
		spriteSheet[i].xOffset = -211;
	}
	return spriteSheet;
}

function offsetKenji(spriteSheet){
	for(let i = 0; i < spriteSheet.length; i++){
		spriteSheet[i].yOffset = -205;
		spriteSheet[i].xOffset = -235;
	}
	return spriteSheet;
}

function GenerateMackRight(){
	let mackFrames = {
		mackIdle: offsetMack(GenerateQuads(gTextures.mackIdle, 200, 200, 555, 555)),
        mackRun: offsetMack(GenerateQuads(gTextures.mackRun, 200, 200, 555, 555)),
        mackJump: offsetMack(GenerateQuads(gTextures.mackJump, 200, 200, 555, 555)),
        mackFall: offsetMack(GenerateQuads(gTextures.mackFall, 200, 200, 555, 555)),
        mackAttack1: offsetMack(GenerateQuads(gTextures.mackAttack1, 200, 200, 555, 555)),
        mackAttack2: offsetMack(GenerateQuads(gTextures.mackAttack2, 200, 200, 555, 555)),
        mackDeath: offsetMack(GenerateQuads(gTextures.mackDeath, 200, 200, 555, 555)),
        mackHit: offsetMack(GenerateQuads(gTextures.mackHit, 200, 200, 555, 555)),
	}
	let spriteSheet = mackFrames.mackIdle.concat(mackFrames.mackRun, mackFrames.mackJump, mackFrames.mackFall, 
		mackFrames.mackAttack1, mackFrames.mackAttack2, mackFrames.mackDeath, mackFrames.mackHit);
	return spriteSheet;
}

function GenerateKenjiRight(){
	let kenjiFrames = {
		kenjiIdle: offsetKenji(GenerateQuads(gTextures.kenjiIdle, 200, 200, 555, 555)),
        kenjiRun: offsetKenji(GenerateQuads(gTextures.kenjiRun, 200, 200, 555, 555)),
        kenjiJump: offsetKenji(GenerateQuads(gTextures.kenjiJump, 200, 200, 555, 555)),
        kenjiFall: offsetKenji(GenerateQuads(gTextures.kenjiFall, 200, 200, 555, 555)),
        kenjiAttack1: offsetKenji(GenerateQuads(gTextures.kenjiAttack1, 200, 200, 555, 555)),
        kenjiAttack2: offsetKenji(GenerateQuads(gTextures.kenjiAttack2, 200, 200, 555, 555)),
        kenjiDeath: offsetKenji(GenerateQuads(gTextures.kenjiDeath, 200, 200, 555, 555)),
        kenjiHit: offsetKenji(GenerateQuads(gTextures.kenjiHit, 200, 200, 555, 555)),
	}
	let spriteSheet = kenjiFrames.kenjiIdle.concat(kenjiFrames.kenjiRun, kenjiFrames.kenjiJump, kenjiFrames.kenjiFall, 
		kenjiFrames.kenjiAttack1, kenjiFrames.kenjiAttack2, kenjiFrames.kenjiDeath, kenjiFrames.kenjiHit);
	return spriteSheet;
}
