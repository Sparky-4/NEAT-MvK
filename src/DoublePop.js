//The Population Class
//Here is where the power of all the classes
//comes together to destroy the game score records
class DoublePop{
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
			for(let j = 0; j < this.population2.length; j++){
				if(!this.population1[i].dead && !this.population2[j].dead){
					//update the population1
					this.population1[i].look(this.population2[j]);
					this.population1[i].think();
					this.population1[i].move();
					this.population1[i].update(this.population2[j]);
	
					//update the population2
					this.population2[j].look(this.population1[i]);
					this.population2[j].think();
					this.population2[j].move();
					this.population2[j].update(this.population1[i]);
				}
			}
			console.log("reset")
			this.resetPops()
		}
	}

	resetPops(){
		for(let i = 0; i < this.population1.length; i++){
			this.population1[i].health = 100;
			this.population1[i].lifespan = 1800;
			this.population1[i].score = 0;
			this.population1[i].dead = false;

			this.population2[i].health = 100;
			this.population2[i].lifespan = 1800;
			this.population2[i].score = 0;
			this.population2[i].dead = false;
		}
	}

	showAlive(){
		// for(let i = 0; i < this.population1.length; i++){
		// 	if(!this.population1[i].dead){
		// 		this.population1[i].show();
		// 		this.trainers[i].draw();
		// 	}
		// }
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
		this.calculateFitness();

		let averageSum = this.getAverageScore();
		console.log(averageSum);
		let children1 = [];
		let children2 = [];
		
		this.fillMatingPool();
        // Population 1
		for(let i = 0; i < this.population1.length; i++){
			let parent1 = this.selectPlayer1();
			let parent2 = this.selectPlayer1();
			if(parent1.fitness > parent2.fitness)
				children1.push(parent1.crossover(parent2));
			else
				children1.push(parent2.crossover(parent1));
		}

        this.population1.splice(0, this.population1.length);
		this.population1 = children1.slice(0);
		this.population1.forEach((element) => { 
			element.brain.generateNetwork();
		});	

        // Population 2
        for(let i = 0; i < this.population2.length; i++){
			let parent1 = this.selectPlayer2();
			let parent2 = this.selectPlayer2();
			if(parent1.fitness > parent2.fitness)
				children2.push(parent1.crossover(parent2));
			else
				children2.push(parent2.crossover(parent1));
		}

        this.population2.splice(0, this.population2.length);
		this.population2 = children2.slice(0);
		this.generation++;
		this.population2.forEach((element) => { 
			element.brain.generateNetwork();
		});	

		// console.log("Generation " + this.generation);
		//console.log(this);
		this.resetBest();

		document.getElementById("generation").innerHTML = "Generation: " + this.generation + "<br><br>Best Fitness: " + this.bestFitness1;
	}

	resetBest(){
		this.bestPlayer1 = this.bestPlayer1.clone();
		this.bestPlayer2 = this.bestPlayer2.clone();
	}

	calculateFitness(){
        // Fitness for population 1
		let currentMax = 0;
		for(let i = 0; i < this.population1.length; i++) { 
			let element = this.population1[i];
			element.calculateFitness(this.population2[i]);
			if(element.fitness > this.bestFitness1){
				this.bestFitness1 = element.fitness;
				this.bestPlayer1 = element.clone();
				this.bestPlayer1.brain.id = "BestGenome";
				this.bestPlayer1.brain.draw();
			}

			if(element.fitness > currentMax)
				currentMax = element.fitness;
        }
        
        //Normalize
        this.population1.forEach((element, elementN) => { 
            element.fitness /= currentMax;
        });

        // Fitness for population 2
        for(let i = 0; i < this.population2.length; i++) { 
			let element = this.population2[i];
			element.calculateFitness(this.population1[i]);
			if(element.fitness > this.bestFitness2){
				this.bestFitness2 = element.fitness;
				this.bestPlayer2 = element.clone();
				this.bestPlayer2.brain.id = "BestGenome";
				this.bestPlayer2.brain.draw();
			}

			if(element.fitness > currentMax)
				currentMax = element.fitness;
		}
        //Normalize
        this.population2.forEach((element, elementN) => { 
            element.fitness /= currentMax;
        });

	}

	fillMatingPool(){
        // Population 1
		this.matingPool1.splice(0, this.matingPool1.length);
		this.population1.forEach((element, elementN) => { 
			let n = element.fitness * 100;
			for(let i = 0; i < n; i++)
				this.matingPool1.push(elementN);
		});

        // Population 2
        this.matingPool2.splice(0, this.matingPool2.length);
		this.population2.forEach((element, elementN) => { 
			let n = element.fitness * 100;
			for(let i = 0; i < n; i++)
				this.matingPool2.push(elementN);
		});
	}

	selectPlayer1(){
		let rand = Math.floor(Math.random() *  this.matingPool1.length);
		return this.population1[this.matingPool1[rand]];
	}

    selectPlayer2(){
		let rand = Math.floor(Math.random() *  this.matingPool2.length);
		return this.population2[this.matingPool2[rand]];
	}

	getAverageScore(){
		let avSum = 0;
		this.population1.forEach((element) => { 
			avSum += element.score;
		});

        let out = [];
        out[0] = avSum / this.population1.length;

        avSum = 0;
		this.population1.forEach((element) => { 
			avSum += element.score;
		});
        out[1] = avSum / this.population1.length;
        return out;
	}
}
