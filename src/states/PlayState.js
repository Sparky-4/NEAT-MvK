class PlayState{

    constructor(){
      if(mode == 0)
        this.runOnePop();
      else if(mode == 1)
        this.runDoublePop();
      else if(mode == 2)
        this.fightTrainer();
      else if(mode == 3)
        this.runAltPop();
    }

    enter(params){}

    fightTrainer(){
      this.mack = new Sprite(0);
      this.trainer = new Trainer(1);
    }

    runOnePop(){
      // Train mack on the trainer
      this.pop = new Population(popSize, 0, "trainer");
      while(this.pop.generation < generations){
          this.step();
      }
    }

    runAltPop(){
      // Train mack on the trainer
      this.pop = new Population(popSize, 0, "trainer");
      while(this.pop.generation < generations){
        this.step();
      }
      this.mackPop = this.pop;
      this.kenjiPop = new Population(popSize, 1, this.mackPop.bestPlayer);
      this.popCounter = 0;
      this.trainAlt();
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
      if(mode == 0){
        this.updateOnePop();
      }
      else if (mode == 3){
        this.updateAltPop();
      }
      else if (mode == 2){
        this.mack.update(this.trainer);
        this.trainer.update(this.mack);
      }
    }

    updateOnePop(){
      this.handleInputs();
      while(this.pop.generation%showGenerationNum!=0 || this.pop.bestPlayer.dead || this.pop.bestEnemy.dead){
        this.step();
      }
      this.pop.updateBest();
    }

    updateAltPop(){
      this.handleInputs();
      if(this.pop.bestPlayer.dead || this.pop.bestEnemy.dead){
        this.trainAlt();
      }
      this.pop.updateBest();
    }

    trainAlt(){
      // this.pop = (this.popCounter%2)==0?this.kenjiPop:this.mackPop;
      this.pop = new Population(popSize, (this.popCounter%2)==0?1:0, "trainer");
      this.pop.population = (this.popCounter%2)==0?this.kenjiPop.population:this.mackPop.population;
      this.pop.enemy = (this.popCounter%2)==0?this.mackPop.bestPlayer.clone():this.kenjiPop.bestPlayer.clone();
      let goal = this.pop.generation + showGenerationNum;
      while(this.pop.generation < goal){
        this.step();
      }
      if((this.popCounter%2)==0)
        this.kenjiPop = this.pop;
      else
        this.mackPop = this.pop;
      let curName = (this.popCounter%2)==0?"Kenji":"Mack";
      document.getElementById("generation").innerHTML = "Showing: " + curName + 
      "<br><br>Best Fitness: " + this.pop.bestFitness +
      "<br><br>Training Count: " + this.popCounter;

      this.popCounter++;
    }

    handleInputs(){
      if(keys[32]){
        this.pop.bestEnemy = new Sprite(this.pop.character == 0?1:0);
        this.pop.bestPlayer = this.pop.bestPlayer.clone();
        this.pop.bestPlayer.lifespan = 5940;
        console.log(this.pop.bestPlayer);
      }
      else if (keys[16]){
        this.pop.bestEnemy = this.pop.newTrainer();
        this.pop.bestPlayer = this.pop.bestPlayer.clone();
        this.pop.bestPlayer.lifespan = 5940;
      }
    }

    /*
    * renders the state
    */
    render(){
      if(mode == 0 || mode == 3){
        // console.log(this.pop)
        this.pop.showBest();

        //Timer
        ctx.fillStyle = 'white';
        ctx.strokeRect(460.8*SCALE_FACTOR_WIDTH, 23.04*SCALE_FACTOR_HEIGHT, 102.4*SCALE_FACTOR_WIDTH, 40.32*SCALE_FACTOR_HEIGHT);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.font = gFonts.medium;
        ctx.fillText(Math.floor(this.pop.bestPlayer.lifespan/60), 512*SCALE_FACTOR_WIDTH, 55*SCALE_FACTOR_HEIGHT);
      }
      else if (mode == 2){
        this.mack.draw();
        this.trainer.draw();
      }
    }
}