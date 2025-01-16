class DoublePopulation{
	constructor(size){
		this.population1 = [];
		this.population2 = [];
		this.bestPlayer1;
		this.bestPlayer2;
		this.bestFitness1 = 0;
		this.bestFitness2 = 0;

		this.generation = 0;
		this.matingPool1 = [];
		this.matingPool2 = [];

		for(let i = 0; i < size; i++){
			this.population1.push(new Player(i, 0));
			this.population1[i].brain.generateNetwork();
			this.population1[i].brain.mutate();

			this.population2.push(new Player(i, 1));
			this.population2[i].brain.generateNetwork();
			this.population2[i].brain.mutate();
		}
	}

	updateAlive(){
		for(let i = 0; i < this.population1.length; i++){
			if(!this.population1[i].dead && !this.population2[i].dead){
				//update population 1
				this.population1[i].look(this.population2[i]);
				this.population1[i].think();
				this.population1[i].move();
				this.population1[i].update(this.population2[i]);

				//update population 2
				this.population2[i].look(this.population1[i]);
				this.population2[i].think();
				this.population2[i].move();
				this.population2[i].update(this.population1[i]);
			}
		}
	}

	showAlive(){
		for(let i = 0; i < this.population1.length; i++){
			if(!this.population1[i].dead && !this.population2[i].dead){
				this.population1[i].show();
				this.population2[i].show();
			}
		}
	}

	updateBest(){
		if(this.bestPlayer1 && !this.bestPlayer1.dead && this.bestPlayer2 && !this.bestPlayer2.dead){
			this.bestPlayer1.look(this.bestPlayer2);
			this.bestPlayer1.think();
			this.bestPlayer1.move();
			this.bestPlayer1.update(this.bestPlayer2);


			this.bestPlayer2.look(this.bestPlayer1);
			this.bestPlayer2.think();
			this.bestPlayer2.move();
			this.bestPlayer2.update(this.bestPlayer1);
		}
	}

	showBest(){
		this.bestPlayer1.show();
		this.bestPlayer2.draw();
	}

	done(){
		for(let i = 0; i < this.population1.length; i++){
			if(!this.population1[i].dead && !this.population2[i].dead){
				return false;
			}
		}
		
		return true;
	}

	naturalSelection(){
		this.calculateFitnesses();

		let averageSum1 = this.getAverageScore(this.population1);
		let averageSum2 = this.getAverageScore(this.population2);
		console.log(averageSum1, averageSum2);
		let children1 = [];
		let children2 = [];
		
		this.fillMatingPools();

		// crossover for Population1
		for(let i = 0; i < this.population1.length; i++){
			let parent1 = this.selectPlayer(1);
			let parent2 = this.selectPlayer(1);
			if(parent1.fitness > parent2.fitness)
				children1.push(parent1.crossover(parent2));
			else
				children1.push(parent2.crossover(parent1));
		}

		// crossover for Population2
		for(let i = 0; i < this.population2.length; i++){
			let parent1 = this.selectPlayer(2);
			let parent2 = this.selectPlayer(2);
			if(parent1.fitness > parent2.fitness)
				children2.push(parent1.crossover(parent2));
			else
				children2.push(parent2.crossover(parent1));
		}


		this.population1.splice(0, this.population1.length);
		this.population2.splice(0, this.population2.length);
		this.population1 = children1.slice(0);
		this.population2 = children2.slice(0);
		this.generation++;
		this.population1.forEach((element) => { 
			element.brain.generateNetwork();
		});	
		this.population2.forEach((element) => { 
			element.brain.generateNetwork();
		});	

		console.log("Generation " + this.generation);
		//console.log(this);

		this.bestPlayer1.health = 100;
		this.bestPlayer1.lifespan = 1800;
		this.bestPlayer1.dead = false;
		this.bestPlayer1.score = 5;

		this.bestPlayer2.health = 100;
		this.bestPlayer2.lifespan = 1800;
		this.bestPlayer2.dead = false;
		this.bestPlayer2.score = 5;

	}

	calculateFitnesses(){
		let currentMax = 0;
		this.population1.forEach((element) => { 
			element.calculateFitness();
			if(element.fitness > this.bestFitness1){
				this.bestFitness1 = element.fitness;
				this.bestPlayer1 = element.clone();
				this.bestPlayer1.brain.id = "BestGenome";
				this.bestPlayer1.brain.draw();
			}

			if(element.fitness > currentMax)
				currentMax = element.fitness;
		});

		//Normalize
		this.population1.forEach((element, elementN) => { 
			element.fitness /= currentMax;
		});

		currentMax = 0;
		this.population2.forEach((element) => { 
			element.calculateFitness();
			if(element.fitness > this.bestFitness2){
				this.bestFitness2 = element.fitness;
				this.bestPlayer2 = element.clone();
				this.bestPlayer2.brain.id = "BestGenome";
				this.bestPlayer2.brain.draw();
			}

			if(element.fitness > currentMax)
				currentMax = element.fitness;
		});

		//Normalize
		this.population2.forEach((element, elementN) => { 
			element.fitness /= currentMax;
		});
	}

	fillMatingPools(){
		this.matingPool1.splice(0, this.matingPool1.length);
		this.population1.forEach((element, elementN) => { 
			let n = element.fitness * 100;
			for(let i = 0; i < n; i++)
				this.matingPool1.push(elementN);
		});

		this.matingPool2.splice(0, this.matingPool2.length);
		this.population2.forEach((element, elementN) => { 
			let n = element.fitness * 100;
			for(let i = 0; i < n; i++)
				this.matingPool2.push(elementN);
		});
	}

	selectPlayer(popNum){
		if(popNum == 1){
			let rand = Math.floor(Math.random() *  this.matingPool1.length);
			return this.population1[this.matingPool1[rand]];
		}
		else{
			let rand = Math.floor(Math.random() *  this.matingPool2.length);
			return this.population2[this.matingPool2[rand]];
		}
	}

	getAverageScore(pop){
		let avSum = 0;
		pop.forEach((element) => { 
			avSum += element.score;
		});

		return avSum / pop.length;
	}
}
