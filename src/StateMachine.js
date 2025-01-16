class StateMachine{
	
	constructor(states){
		this.states = states;
		this.current;
	}
	
	change(stateName, enterParams){
		if(stateName == 'start')
			this.current = this.states.start;
		else if(stateName == 'play')
			this.current = this.states.play;
		else if(stateName == 'game_over')
			this.current = this.states.game_over;
		else if(stateName == 'win')
			this.current = this.states.win;
		else if(stateName == 'select')
			this.current = this.states.select;
		
		this.current.enter(enterParams)
	}
	
	update(){
		this.current.update();	  
	}
	
	render(){
		this.current.render();
	}
}