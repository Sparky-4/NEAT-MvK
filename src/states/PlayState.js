class PlayState{

    constructor(){
      this.mode = 3;

      if(this.mode == 0)
        this.runOnePop();
      else if(this.mode == 1)
        this.runDoublePop();
      else if(this.mode == 2)
        this.fightTrainer();
      else if(this.mode == 3)
        this.runAltPop();
    }

    enter(params){}

    fightTrainer(){
      this.mack = new Sprite(0);
      this.trainer = new Trainer(1);
    }

    runOnePop(){
      // Train mack on the trainer
      this.pop = new Population(100, 0, "trainer");
      while(this.pop.generation < 100){
        this.step();
      }
    }

    runAltPop(){
      // Train mack on the trainer
      this.pop = new Population(100, 0, "trainer");
      while(this.pop.generation < 100){
        this.step();
      }
      let mackPop = this.pop;
      let kenjiPop = new Population(100, 1, mackPop.bestPlayer);
      // Train the AIs on each other
      let rounds = 10;
      for(let i = 0; i < rounds; i++){
        this.pop = new Population(100, (i%2)==0?1:0, "trainer");
        this.pop.population = (i%2)==0?kenjiPop.population:mackPop.population;
        this.pop.enemy = (i%2)==0?mackPop.bestPlayer.clone():kenjiPop.bestPlayer.clone();
        while(this.pop.generation < 100){
          this.step();
        }
        if((i%2)==0)
          kenjiPop = this.pop;
        else
          mackPop = this.pop;
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
      else if (this.mode == 3){
        this.updateOnePop();
      }
    }

    updateDoublePop(){
      this.pop.updateBest();
    }

    updateOnePop(){
      if(keys[32]){
        this.pop.bestEnemy = new Sprite(this.pop.character == 0?1:0);
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
      // this.pop.updateAlive();
    }

    /*
    * renders the state
    */
    render(){
      if(this.mode == 0 || this.mode == 1 || this.mode == 3)  
        this.pop.showBest();
        // this.pop.showAlive();
      else if (this.mode == 2){
        this.mack.draw();
        this.trainer.draw();
      }
    }
}