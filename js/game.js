var Game = {

	debug_grid: false,

	cell_size: 4,

	buildings: [],
	display_canvas: null,
	display_surface: null,

	init: function() {
		this.display_canvas = document.getElementById('main-canvas');
		this.display_surface = document.getElementById('main-canvas').getContext('2d');

		var layer_canvas = document.getElementById('temp-canvas');
		var remaining_units = 300;
		var layer_surface = document.getElementById('temp-canvas').getContext('2d');
		while (remaining_units > 20) {
			var building_height = RNGRules.rng(40,55);
			var building_width = RNGRules.rng(25,40);
			var margin = RNGRules.rng(0,1);

			var new_building = Object.assign({}, Building);
			new_building.generate(building_width, building_height);

			var xpos = 300 - remaining_units;
			console.log(xpos);
			//new_building.render(this.display_surface, xpos * this.cell_size, 0);
			new_building.render(layer_surface, xpos * this.cell_size, 0);
			remaining_units -= building_height + margin;
		}

		var bg_gradient = this.display_surface.createLinearGradient(0,0,2400,500);
		bg_gradient.addColorStop(0, '#ffffff');
		bg_gradient.addColorStop(1, '#6666ff');
		this.display_surface.fillStyle = bg_gradient;
		this.display_surface.fillRect(0,0,2400,500);

		var layer_img_data = layer_surface.getImageData(0, 0, 1000, 400);
		console.log(layer_img_data);
		console.log(layer_canvas,layer_surface);
		this.display_surface.putImageData(layer_img_data,0,0);
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