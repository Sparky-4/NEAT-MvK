let genomeInputsN = 5;
let genomeOutputN = 5;

//The Population Class
//Here is where the power of all the classes
//comes together to destroy the game score records
class Population{
	constructor(size){
		this.population = [];
		this.trainers = [];
		this.bestPlayer;
		this.bestFitness = 0;

		this.generation = 0;
		this.matingPool = [];

		for(let i = 0; i < size; i++){
			this.population.push(new Player(i, 0));
			this.population[i].brain.generateNetwork();
			this.population[i].brain.mutate();
			this.trainers[i] = this.newTrainer();
		}
	}

	newTrainer(){
		return new Trainer(
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

	updateAlive(){
		for(let i = 0; i < this.population.length; i++){
			if(!this.population[i].dead && !this.trainers[i].dead){
				//update the population
				this.population[i].look(this.trainers[i]);
				this.population[i].think();
				this.population[i].move();
				this.population[i].update(this.trainers[i]);

				//update the trainers
				this.trainers[i].update(this.population[i]);
			}
		}
	}

	showAlive(){
		for(let i = 0; i < this.population.length; i++){
			if(!this.population[i].dead){
				this.population[i].show();
			}
		}
	}

	updateBest(){
		if(this.bestPlayer && !this.bestPlayer.dead && this.bestEnemy && !this.bestEnemy.dead){
			this.bestPlayer.look(this.bestEnemy);
			this.bestPlayer.think();
			this.bestPlayer.move();
			this.bestPlayer.update(this.bestEnemy);
			this.bestEnemy.update(this.bestPlayer);
		}
	}

	showBest(){
		this.bestPlayer.show();
		this.bestEnemy.draw();
	}

	done(){
		for(let i = 0; i < this.population.length; i++){
			if(!this.population[i].dead && !this.trainers[i].dead){
				return false;
			}
		}
		
		return true;
	}
	
	naturalSelection(){
		this.calculateFitness();

		let averageSum = this.getAverageScore();
		console.log(averageSum);
		let children = [];
		
		this.fillMatingPool();
		for(let i = 0; i < this.population.length; i++){
			let parent1 = this.selectPlayer();
			let parent2 = this.selectPlayer();
			if(parent1.fitness > parent2.fitness)
				children.push(parent1.crossover(parent2));
			else
				children.push(parent2.crossover(parent1));
		}


		this.population.splice(0, this.population.length);
		this.population = children.slice(0);
		this.generateTrainers();
		this.generation++;
		this.population.forEach((element) => { 
			element.brain.generateNetwork();
		});	

		console.log("Generation " + this.generation);
		//console.log(this);

		this.bestPlayer.health = 100;
		this.bestPlayer.lifespan = 1800;
		this.bestPlayer.dead = false;
		this.bestPlayer.score = 5;

		this.bestEnemy = this.newTrainer();
	}

	calculateFitness(){
		let currentMax = 0;
		this.population.forEach((element) => { 
			element.calculateFitness();
			if(element.fitness > this.bestFitness){
				this.bestFitness = element.fitness;
				this.bestPlayer = element.clone();
				this.bestEnemy = this.newTrainer();
				this.bestPlayer.brain.id = "BestGenome";
				this.bestPlayer.brain.draw();
			}

			if(element.fitness > currentMax)
				currentMax = element.fitness;
		});

		//Normalize
		this.population.forEach((element, elementN) => { 
			element.fitness /= currentMax;
		});
	}

	fillMatingPool(){
		this.matingPool.splice(0, this.matingPool.length);
		this.population.forEach((element, elementN) => { 
			let n = element.fitness * 100;
			for(let i = 0; i < n; i++)
				this.matingPool.push(elementN);
		});
	}

	generateTrainers(){
		for(let i = 0; i < this.population.length; i++){
			this.trainers[i] = this.newTrainer();
		}
	}

	selectPlayer(){
		let rand = Math.floor(Math.random() *  this.matingPool.length);
		return this.population[this.matingPool[rand]];
	}

	getAverageScore(){
		let avSum = 0;
		this.population.forEach((element) => { 
			avSum += element.score;
		});

		return avSum / this.population.length;
	}
}
