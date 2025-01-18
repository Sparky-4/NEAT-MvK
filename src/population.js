let genomeInputsN = 5;
let genomeOutputN = 5;

//The Population Class
//Here is where the power of all the classes
//comes together to destroy the game score records
class Population{
	constructor(size, character, enemy){
		this.enemy = enemy;
		this.character = character;
		this.population = [];
		this.trainers = [];
		this.bestPlayer;
		this.bestFitness = 0;

		this.generation = 0;
		this.matingPool = [];

		for(let i = 0; i < size; i++){
			this.population.push(new Player(i, character));
			this.population[i].brain.generateNetwork();
			this.population[i].brain.mutate();
			this.trainers[i] = this.newTrainer();
		}
	}

	newTrainer(){
		if(this.enemy == "trainer")
			return new Trainer(this.character == 0?1:0);
		else{
			return this.enemy.clone();
		}
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
				if(this.trainers[i].look){
					this.trainers[i].look(this.population[i]);
					this.trainers[i].think();
					this.trainers[i].move();
				}
				this.trainers[i].update(this.population[i]);
			}
		}
	}

	showAlive(){
		for(let i = 0; i < this.population.length; i++){
			if(!this.population[i].dead){
				this.population[i].show();
				this.trainers[i].draw();
			}
		}
	}

	updateBest(){
		if(this.bestPlayer && !this.bestPlayer.dead && this.bestEnemy && !this.bestEnemy.dead){
			this.bestPlayer.look(this.bestEnemy);
			this.bestPlayer.think();
			this.bestPlayer.move();
			this.bestPlayer.update(this.bestEnemy);

			if(this.bestEnemy.look){
				this.bestEnemy.look(this.bestPlayer);
				this.bestEnemy.think();
				this.bestEnemy.move();
			}
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
		// console.log(averageSum);
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

		// console.log("Generation " + this.generation);
		//console.log(this);
		this.resetBest();

		document.getElementById("generation").innerHTML = "Generation: " + this.generation + "<br><br>Best Fitness: " + this.bestFitness;
	}

	resetBest(){
		this.bestPlayer = this.bestPlayer.clone();
		this.bestEnemy = this.newTrainer();
	}

	calculateFitness(){
		let currentMax = 0;
		for(let i = 0; i < this.population.length; i++) { 
			let element = this.population[i];
			element.calculateFitness(this.trainers[i]);
			if(element.fitness > this.bestFitness){
				this.bestFitness = element.fitness;
				this.bestPlayer = element.clone();
				this.bestPlayer.brain.id = "BestGenome";
				this.bestPlayer.brain.draw();
			}

			if(element.fitness > currentMax)
				currentMax = element.fitness;
		}

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
