var Game = {

	debug_grid: true,

	cell_size: 8,

	layers: [],
	display_canvas: null,
	display_surface: null,

	init: function() {
		this.display_canvas = document.getElementById('main-canvas');
		this.display_surface = document.getElementById('main-canvas').getContext('2d');

		var layer_canvas = document.createElement('canvas');
		layer_canvas.height = 8*34;
		layer_canvas.width = 8*300;

		test_building = Building;
		test_building.generate(36,52);

		var bg_gradient = this.display_surface.createLinearGradient(0,0,500,500);
		bg_gradient.addColorStop(0, '#ffffff');
		bg_gradient.addColorStop(1, '#6666ff');
		this.display_surface.fillStyle = bg_gradient;
		this.display_surface.fillRect(0,0,500,500);

		test_building.render(this.display_surface, 150, 0);
	},

	tick: function() {

	}

};

Game.init();
/*
setInterval(function() {
	Game.tick();
}, 100);
*/