class Quad{
	
	constructor(imgX, imgY, quadWidth, quadHeight, img, vWidth, vHeight)
	{
		this.x = imgX;
		this.y = imgY;
		this.width = quadWidth;
		this.height = quadHeight;
		this.img = img;
		this.vWidth = vWidth;
		this.vHeight = vHeight;
		this.xOffset = 0;
		this.yOffset = 0;
	}
	
	draw(x, y, width, height)
	{
		ctx.imageSmoothingEnabled = false; 

		if(width && height)
			ctx.drawImage(this.img, 
						this.x, this.y, this.width, this.height, 
						x+this.xOffset*SCALE_FACTOR_WIDTH, y+this.yOffset*SCALE_FACTOR_HEIGHT,
						width*SCALE_FACTOR_WIDTH, height*SCALE_FACTOR_HEIGHT);
		else 
			ctx.drawImage(this.img, 
						this.x, this.y, this.width, this.height, 
						x+this.xOffset*SCALE_FACTOR_WIDTH, y+this.yOffset*SCALE_FACTOR_HEIGHT,
						this.vWidth*SCALE_FACTOR_WIDTH || this.width*SCALE_FACTOR_WIDTH,
						this.vHeight*SCALE_FACTOR_HEIGHT || this.height*SCALE_FACTOR_HEIGHT);
	}

	drawReversed(x, y, offset)
	{
		ctx.imageSmoothingEnabled = false; 
		ctx.translate(canvas.width, 0);
		ctx.scale(-1, 1);
		ctx.drawImage(this.img, 
					this.x, this.y, this.width, this.height, 
					canvas.width-(x-(this.xOffset-offset)*SCALE_FACTOR_WIDTH), y+this.yOffset*SCALE_FACTOR_HEIGHT,
					this.vWidth*SCALE_FACTOR_WIDTH || this.width*SCALE_FACTOR_WIDTH,
					this.vHeight*SCALE_FACTOR_HEIGHT || this.height*SCALE_FACTOR_HEIGHT);
    	ctx.scale(-1, 1);
		ctx.translate(-canvas.width, 0);

	}
}