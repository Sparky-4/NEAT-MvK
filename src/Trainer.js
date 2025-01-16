class Trainer {
    constructor(position, velocity, width, height, moveKeys, healthPos, sprites, animations, sounds) {
        this.dead = false;
        this.position = position;
        this.velocity = velocity;
        this.width = width;
        this.height = height;
        this.health = 100;
        this.moveCount = 0;
        this.dirToMove = 0;
        this.healthPos = healthPos;
        this.hitstun = 0;
        this.sprites = sprites;
        this.animations = animations;
        this.curAnimation = this.animations.idle;
        this.deathFrames = this.animations.death.interval*this.animations.death.frames.length;
        this.display = {
            message: '',
            frames: 0,
        }
        this.sounds = sounds;
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
        }
    }

    handleMovement(){
        // Change in y velocity, includes gravity and checks for space bar input
        this.velocity.y += GRAVITY;
        if (this.position.y + this.height + this.velocity.y > VIRTUAL_HEIGHT-96) {
            this.position.y = VIRTUAL_HEIGHT-96 - this.height;
            this.velocity.y = 0;
            if (Math.random() < .01 && this.health > 0){
                this.velocity.y = -20;
            }
        }
        this.position.y += this.velocity.y;
        if(this.health == 0)
            return;
        // changes in x position, which is looking for 'left' and 'right' presses
        if(this.moveCount == 0){
            this.dirToMove = Math.random();
            this.moveCount = randInt(30, 100);
        }
        this.moveCount--;
        if(this.hitstun == 0 && this.forwardHitbox.recovery == 0){
            if (this.dirToMove < .33) {
                this.velocity.x = 5;
            } else if (this.dirToMove > .66)
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
        
        if(Math.random() < .05 && this.forwardHitbox.startup == 0 && this.forwardHitbox.recovery == 0 && this.hitstun == 0){
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