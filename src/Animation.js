class Animation{

    constructor(frames, interval){
        this.frames = frames;
        this.interval = interval;
        this.timer = new Timer();
        this.curFrame = 0;
    }

    update(){
        if(this.frames.length > 1){
            this.timer.update();
            if(this.timer.counter > this.interval){
                this.timer.counter = this.timer.counter % this.interval;
                this.curFrame = (this.curFrame+1) % this.frames.length;
            } 
        }
    }

    reset(total){
        this.timer = new Timer();
        this.curFrame = 0;
        this.interval = total/this.frames.length;
    }

    getCurFrame(){
        return this.frames[this.curFrame];
    }
}