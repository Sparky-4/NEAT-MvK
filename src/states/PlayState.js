class PlayState{

    constructor(){
      this.mode = 0;

      if(this.mode == 0)
        this.runOnePop();
      else if(this.mode == 1)
        this.runDoublePop();
      else if(this.mode == 2)
        this.fightTrainer();
    }

    enter(params){}

    fightTrainer(){
      this.mack = new Sprite(0);
      this.trainer = new Trainer(1);
    }

    runOnePop(){
      this.pop = new Population(100);
      while(this.pop.generation < 100){
        this.step();
      }
    }

    runDoublePop(){
      this.pop = new DoublePopulation(100);
      while(this.pop.generation < 100){
        this.step();
      }
    }

    step(){
       if(!this.pop.done()){
        this.pop.updateAlive();
      }
      else{
        this.pop.naturalSelection();
      }
    }

    /*
    * updates the state
    */
    update(){
      if(this.mode == 0){
        this.updateOnePop();
      }
      else if (this.mode == 1)
        this.updateDoublePop();
      else if (this.mode == 2){
        this.mack.update(this.trainer);
        this.trainer.update(this.mack);
      }
    }

    updateDoublePop(){
      this.pop.updateBest();
    }

    updateOnePop(){
      if(keys[32]){
        this.pop.bestEnemy = new Sprite(1);
      }
      else if (keys[16])
        this.pop.bestEnemy = this.pop.newTrainer();
      else if(keys[82]){
        this.pop.bestPlayer = this.pop.bestPlayer.clone();
        this.pop.bestPlayer.health = 100;
        this.pop.bestPlayer.lifespan = 18000;
        this.pop.bestPlayer.dead = false;
      }

      this.pop.updateBest();
    }

    /*
    * renders the state
    */
    render(){
      if(this.mode == 0 || this.mode == 1)  
        this.pop.showBest();
      else if (this.mode == 2){
        this.mack.draw();
        this.trainer.draw();
      }
    }
}