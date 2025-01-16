//The Player Class
//The interface between our 
//NeuralNetwork and the game 
class Player{
	constructor(id, side){
		this.id = id;
		this.side = side;
		this.brain = new Genome(genomeInputsN, genomeOutputN, id);
		this.fitness;
		this.lifespan = 1800;

		this.score = 5;
		this.dead = false;
		// 0 = nothing, 1 = left, 2 = jump, 3 = right, 4 = attack
		this.decisions = []; //Current Output values
		this.vision = []; //Current input values

		if(side == 0){
			this.position = {x:150, y:200};
			this.sprites = gFrames.mackRight;
			this.animations = {
				idle: new Animation([0, 1, 2, 3, 4, 5, 6, 7], 5),
				run: new Animation([8, 9, 10, 11, 12, 13, 14, 15], 5),
				jump: new Animation([16, 17], 60),
				fall: new Animation([18, 19], 60),
				attack1: new Animation([20, 21, 22, 23, 24, 25], 5),
				attack2: new Animation([26, 27, 28, 29, 30, 31], 10),
				death: new Animation([32, 33, 34, 35, 36, 37], 7),
				hit: new Animation([38, 39, 40, 41], 7),
			};
			this.sounds = {
				death: gSounds.mackDeath,
				hurt: gSounds.mackHurt,
				jump: gSounds.mackJump,
			};
		}
		else if(side == 1){
			this.position = {x:750, y:200};
			this.sprites = gFrames.kenjiRight;
			this.animations = {
				idle: new Animation([0, 1, 2, 3], 7),
				run: new Animation([11, 10, 9, 8, 7, 6, 5, 4], 5),
				jump: new Animation([12, 13], 60),
				fall: new Animation([14, 15], 60),
				attack1: new Animation([19, 18, 17, 16], 5),
				attack2: new Animation([23, 22, 21, 20], 10),
				death: new Animation([24, 25, 26, 27, 28, 29, 30], 7),
				hit: new Animation([31, 32, 33, 34], 7),
			};
			this.sounds = {
				death: gSounds.kenjiDeath,
				hurt: gSounds.kenjiHurt,
				jump: gSounds.kenjiJump,
			};
		}
        this.velocity = {x:0, y:0};
        this.width = 100;
        this.height = 150;
        this.health = 100;
        this.healthPos = side+1;
        this.hitstun = 0;
        this.curAnimation = this.animations.idle;
        this.deathFrames = this.animations.death.interval*this.animations.death.frames.length;
        this.display = {
            message: '',
            frames: 0,
        }
        this.forwardHitbox = {
            x: this.position.x,
            y: this.position.y + 50,
            width: 275,
            height: 50,
            startup: 0,
            recovery: 0,
            hitstun: 10,
            damage: 17,
            isAttacking: false
        }
        this.facing = false; // where left is false and right is true
	}

	collides(other){
        if(this.position.x > other.x + other.width || other.x > this.position.x + this.width)
			return false;
		else if(this.position.y > other.y + other.height || other.y > this.position.y + this.height)
			return false
		else 
			return true;
    }

	handleMovement(){
        // Change in y velocity
        this.velocity.y += GRAVITY;
        if (this.position.y + this.height + this.velocity.y > VIRTUAL_HEIGHT-96) {
            this.position.y = VIRTUAL_HEIGHT-96 - this.height;
            this.velocity.y = 0;
            if (this.val == 2 && this.health > 0){
                this.velocity.y = -20;
            }
        }
        this.position.y += this.velocity.y;
        if(this.health == 0)
            return;
        // changes in x position
        if(this.hitstun == 0 && this.forwardHitbox.recovery == 0){
            if (this.val == 3) {
                this.velocity.x = 5;
            } else if (this.val == 1)
                this.velocity.x = -5;
            else
                this.velocity.x = 0;
            
            if(this.velocity.x != 0)
                this.facing = this.velocity.x > 0;
        }
        if(this.forwardHitbox.recovery > 0)
            this.velocity.x = 0;
        this.position.x += this.velocity.x;
        // correct x if sprite has hit either side of the window
        if (this.position.x + this.width > VIRTUAL_WIDTH)
            this.position.x = VIRTUAL_WIDTH - this.width;
        else if (this.position.x < 0)
            this.position.x = 0;
    }

	handleDamage(other){
		//If we get hit
        if(other.forwardHitbox.isAttacking && this.collides(other.forwardHitbox)){
			this.score--;
            this.health = Math.max(0, this.health-other.forwardHitbox.damage);
            this.hitstun = other.forwardHitbox.hitstun;
            this.resetAnimations(10, other.forwardHitbox.hitstun);
            if(this.forwardHitbox.startup > 0){
                this.display.message = 'COUNTER!';
                this.display.frames = 40;
            }else if (this.forwardHitbox.recovery > 0){
                this.display.message = 'PUNISH!';
                this.display.frames = 40;
            }
            this.forwardHitbox.startup = 0;
            this.forwardHitbox.recovery = 0;
            if(this.position.x+this.width/2 > other.position.x+other.width/2){
                this.velocity.x = 10;
                this.facing = false;
            }else{
                this.velocity.x = -10;
                this.facing = true;
            }
        }
		// If we hit the other
		if(this.forwardHitbox.isAttacking && other.collides(this.forwardHitbox)){
			this.score++;
		}
    }

	handleAnimation(){
        if(this.health > 0){
            if(this.hitstun > 0)
                this.curAnimation = this.animations.hit;
            else if (this.forwardHitbox.startup > 0 || this.forwardHitbox.recovery > 0)
                this.curAnimation = this.animations.attack1;
            else if (this.velocity.y > 0)
                this.curAnimation = this.animations.fall;
            else if (this.velocity.y < 0)
                this.curAnimation = this.animations.jump;
            else if (this.velocity.x != 0)
                this.curAnimation = this.animations.run;
            else
                this.curAnimation = this.animations.idle;
        }
        else
            this.deathFrames--;
        if(this.deathFrames > 0)
            this.curAnimation.update();
    }

	resetAnimations(attackNum, hitNum){
        this.animations.attack1.reset(attackNum);
        this.animations.attack2.reset(attackNum);
        this.animations.hit.reset(hitNum);
    }

	clone() { //Returns a copy of this player
		let clone = new Player(this.id, this.side);
		clone.brain = this.brain.clone();
		return clone;
	}

	crossover(parent){ //Produce a child
		let child = new Player(this.id, this.side);
		if(parent.fitness < this.fitness)
			child.brain = this.brain.crossover(parent.brain);
		else
			child.brain = parent.brain.crossover(this.brain);

		child.brain.mutate()
		return child;
	}


	//Game stuff
	look(t){
		this.vision = [this.facing? 0:1, this.position.x - t.position.x, this.position.y - t.position.y, this.forwardHitbox.startup, t.forwardHitbox.startup];
	}

	think(){
		this.decisions = this.brain.feedForward(this.vision);
	}

	move(){
		let maxIndex = 0;
		for(let i = 0; i < this.decisions.length; i++)
			if(this.decisions[i] > this.decisions[maxIndex])
				maxIndex = i;

		this.val = maxIndex;
	}

	update(t){
		this.handleMovement();
        
        if(this.val == 4 && this.forwardHitbox.startup == 0 && this.forwardHitbox.recovery == 0 && this.hitstun == 0){
            this.forwardHitbox.startup = 15;
            this.resetAnimations(30, 10);
        }
        if (this.forwardHitbox.startup == 1){
            this.forwardHitbox.isAttacking = true;
            this.forwardHitbox.x = this.facing?this.position.x:this.position.x-(this.forwardHitbox.width - this.width);
            this.forwardHitbox.y = this.position.y + 50;
            this.forwardHitbox.recovery = 15;
        }
        else
            this.forwardHitbox.isAttacking = false;
        if(this.forwardHitbox.startup > 0)
            this.forwardHitbox.startup--;
        if(this.forwardHitbox.recovery > 0)
            this.forwardHitbox.recovery--;
        if(this.hitstun > 0)
            this.hitstun--;

		this.handleDamage(t);
		this.lifespan--;
		if(this.health <= 0 || this.lifespan <= 0)
            this.dead = true;
		if(this.lifespan <= 0)
			this.score /= 2;
	}

	show(){
		this.draw();
	}

	draw() {
        this.handleAnimation();
        ctx.fillStyle = 'red';
		if(showHitboxes)
        	ctx.fillRect(this.position.x*SCALE_FACTOR_WIDTH, this.position.y*SCALE_FACTOR_HEIGHT, this.width*SCALE_FACTOR_WIDTH, this.height*SCALE_FACTOR_HEIGHT);
        if((this.facing && this.healthPos==1) || (!this.facing && this.healthPos == 2))
            this.sprites[this.curAnimation.getCurFrame()].draw(this.position.x*SCALE_FACTOR_WIDTH, this.position.y*SCALE_FACTOR_HEIGHT);
        else
            this.sprites[this.curAnimation.getCurFrame()].drawReversed(this.position.x*SCALE_FACTOR_WIDTH, this.position.y*SCALE_FACTOR_HEIGHT, this.width);

        //Attackbox
        if(this.forwardHitbox.isAttacking && showHitboxes){   
            ctx.fillStyle = 'blue';
            ctx.fillRect(this.forwardHitbox.x*SCALE_FACTOR_WIDTH, this.forwardHitbox.y*SCALE_FACTOR_HEIGHT, 
                this.forwardHitbox.width*SCALE_FACTOR_WIDTH, this.forwardHitbox.height*SCALE_FACTOR_HEIGHT);
        }

        //Health bar
        ctx.fillStyle = 'red';
        ctx.lineWidth = '4';
        if(this.healthPos == 1){
            ctx.fillRect(51.2*SCALE_FACTOR_WIDTH, 28.8*SCALE_FACTOR_HEIGHT, 409.6*SCALE_FACTOR_WIDTH, 28.8*SCALE_FACTOR_HEIGHT);
            ctx.fillStyle = 'LightSkyBlue';
            ctx.fillRect((51.2+409.6-(409.6*(this.health/100)))*SCALE_FACTOR_WIDTH, 28.8*SCALE_FACTOR_HEIGHT,
                            409.6*(this.health/100)*SCALE_FACTOR_WIDTH, 28.8*SCALE_FACTOR_HEIGHT);
            ctx.strokeStyle = 'white';
            ctx.strokeRect(51.2*SCALE_FACTOR_WIDTH, 28.8*SCALE_FACTOR_HEIGHT, 409.6*SCALE_FACTOR_WIDTH, 28.8*SCALE_FACTOR_HEIGHT);
            
        }
        else{
            ctx.fillRect(563.2*SCALE_FACTOR_WIDTH, 28.8*SCALE_FACTOR_HEIGHT, 409.6*SCALE_FACTOR_WIDTH, 28.8*SCALE_FACTOR_HEIGHT);
            ctx.fillStyle = 'LightSkyBlue';
            ctx.fillRect(563.2*SCALE_FACTOR_WIDTH, 28.8*SCALE_FACTOR_HEIGHT,
                            409.6*(this.health/100)*SCALE_FACTOR_WIDTH, 28.8*SCALE_FACTOR_HEIGHT);
            ctx.strokeStyle = 'white';
            ctx.strokeRect(563.2*SCALE_FACTOR_WIDTH, 28.8*SCALE_FACTOR_HEIGHT, 409.6*SCALE_FACTOR_WIDTH, 28.8*SCALE_FACTOR_HEIGHT);
        }

        //display message
        if(this.display.frames > 0){
            ctx.textAlign = this.healthPos==2?'left':'right';
            ctx.textBaseline = 'top';
            ctx.font = gFonts.large;
            ctx.fillStyle = 'white';
            ctx.fillText(this.display.message, (this.healthPos==2?51.2:972.8)*SCALE_FACTOR_WIDTH, VIRTUAL_HEIGHT/4*SCALE_FACTOR_HEIGHT);
            this.display.frames--;
        }
    }

	calculateFitness(){ //Fitness function : adapt it to the needs of the
		this.fitness = this.score;
		this.fitness /= this.brain.calculateWeight();
	}
}