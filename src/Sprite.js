class Sprite {
    constructor(side) {
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
            this.moveKeys = {up:87, down:83, left:65, right:68, attack: 83};
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
            this.moveKeys = {up:38, down:40, left:37, right:39, attack: 40};
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

    end(result){
        if(result == 'lost'){
            this.hitstun = 0;
            this.velocity.x = 0;
            this.forwardHitbox.isAttacking = false;
            this.forwardHitbox.recovery = 0;
            this.curAnimation = this.animations.death;
            let death = document.createElement("AUDIO");
            death.src = this.sounds.death.src;
            death.play();
        }
    }

    handleMovement(){
        // Change in y velocity, includes gravity and checks for space bar input
        this.velocity.y += GRAVITY;
        if (this.position.y + this.height + this.velocity.y > VIRTUAL_HEIGHT-96) {
            this.position.y = VIRTUAL_HEIGHT-96 - this.height;
            this.velocity.y = 0;
            if (keys[this.moveKeys.up] && this.health > 0){
                let jump = document.createElement("AUDIO");
                jump.src = this.sounds.jump.src;
                jump.play();
                this.velocity.y = -20;
            }
        }
        this.position.y += this.velocity.y;
        if(this.health == 0)
            return;
        // changes in x position, which is looking for 'left' and 'right' presses
        if(this.hitstun == 0 && this.forwardHitbox.recovery == 0){
            if (keys[this.moveKeys.right]) {
                this.velocity.x = keys[this.moveKeys.left]?0:5;
            } else if (keys[this.moveKeys.left])
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
        if(other.forwardHitbox.isAttacking && this.collides(other.forwardHitbox)){
            this.health = Math.max(0, this.health-other.forwardHitbox.damage);
            if(this.health > 0){
                let hurt = document.createElement("AUDIO");
                hurt.src = this.sounds.hurt.src;
                hurt.play();
                let hit = document.createElement("AUDIO");
                hit.src = gSounds.hit.src;
                hit.volume = .3;
                hit.play();
            }
            this.hitstun = other.forwardHitbox.hitstun;
            this.resetAnimations(10, other.forwardHitbox.hitstun);
            if(this.forwardHitbox.startup > 0){
                let toPlay = document.createElement("AUDIO");
                if(Math.random() < .1)
                    toPlay.src = gSounds.cucumber.src;
                else
                    toPlay.src = gSounds.counter.src;
                toPlay.play();
                this.display.message = 'COUNTER!';
                this.display.frames = 40;
            }else if (this.forwardHitbox.recovery > 0){
                let toPlay = document.createElement("AUDIO");
                if(Math.random() < .2)
                    toPlay.src = gSounds.peanut.src;
                else
                    toPlay.src = gSounds.punish.src;
                toPlay.play();
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

    update(other) {
        this.handleMovement();

        if(this.health == 0)
            return;
        
        if(keys[this.moveKeys.attack] && this.forwardHitbox.startup == 0 && this.forwardHitbox.recovery == 0 && this.hitstun == 0){
            this.forwardHitbox.startup = 15;
            let sword = document.createElement("AUDIO");
            sword.src = gSounds.sword.src;
            sword.volume = .5;
            sword.play();
            if(randInt(0, 2000) == 0)
                gSounds.song.play();
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

        this.handleDamage(other);
        if(this.health <= 0)
            this.dead = true;
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
}