class PlayState{

    constructor(){
      this.mode = 1;

      if(this.mode == 0)
        this.runOnePop();
      else
        this.runDoublePop();
    }

    enter(params){}

    runOnePop(){
      this.pop = new Population(100);
      while(this.pop.generation < 150){
        this.step();
      }
    }

    runDoublePop(){
      this.pop = new Population(100);
      while(this.pop.generation < 100){
        this.step();
      }
      let temp = this.pop.bestPlayer;
      this.pop = new DoublePopulation(100);
      for(let i = 0; i < this.pop.population1; i++){
        let newPlayer = temp.clone();
        this.pop.population1[i] = newPlayer;
      }
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
      else
      this.updateDoublePop();
    }

    updateDoublePop(){
      this.pop.updateBest();
    }

    updateOnePop(){
      if(keys[32]){
        this.pop.bestEnemy = new Sprite(
          {x:750, y:200},
          {x:0, y:0},
          100, 150,
          {up:38, down:40, left:37, right:39, attack: 40},
          2, gFrames.kenjiRight,
          {
            idle: new Animation([0, 1, 2, 3], 7),
            run: new Animation([11, 10, 9, 8, 7, 6, 5, 4], 5),
            jump: new Animation([12, 13], 60),
            fall: new Animation([14, 15], 60),
            attack1: new Animation([19, 18, 17, 16], 5),
            attack2: new Animation([23, 22, 21, 20], 10),
            death: new Animation([24, 25, 26, 27, 28, 29, 30], 7),
            hit: new Animation([31, 32, 33, 34], 7),
          },
          {
            death: gSounds.kenjiDeath,
            hurt: gSounds.kenjiHurt,
            jump: gSounds.kenjiJump,
        });
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
      this.pop.showBest();
    }
}