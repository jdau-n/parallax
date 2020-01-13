var RNGRules = {

	// weights should all be integers
	weight_defs: {
		'tier_count': {1:3,2:3,3:6},

		// 1: even, 2: top quarter, 3: bottom quarter
		'tier_vertical_ratio_type': {1:2,2:1,3:4},

		// 1: 80% of last tier
		// 2: 60% of last tier
		'tier_horizontal_ratio_type': {1:2,2:1},

		'window_type': {1:2,2:1,3:1}
	},

	weight_tables: {},

	roll: function(rule) {
		var chance = 0;
		switch (rule) {
			// case 'single_tier_chance':
			// 	chance = this.single_tier_chance;
			// 	break;
			default: break;
		}

		var dice_roll = this.rng(0,100);
		console.log("Roll "+rule,dice_roll,chance,(dice_roll < chance));
		return (dice_roll < chance);
	},

	select: function(rule_set) {

		var table = null;
		
		// cache the table generation
		if (!(rule_set in this.weight_tables)) { this.weight_tables[rule_set] = this.generate_weight_table(rule_set); }
		table = this.weight_tables[rule_set];

		var choice = this.rng(0,table.length);
		return table[choice];

	},

	generate_weight_table: function(rule_set) {
		if (!(rule_set in this.weight_defs)) { console.log("WARNING: generate_weight_table called with nonexistent def: "+rule_set); }

		var def = this.weight_defs[rule_set];
		var table = [];

		for (i in def) {
			for (j = 0; j < def[i]*2; j++) {
				table.push(i);
			}
		}

		return table;
	},

	rng: function(rng_floor, rng_ceil) {
		return Math.floor(Math.random() * (rng_ceil - rng_floor)) + rng_floor;
	},

};


var Game = {

	cell_size: 20,

	layers: [],
	display_canvas: null,
	display_surface: null,

	init: function() {
		this.display_canvas = document.getElementById('main-canvas');
		this.display_surface = document.getElementById('main-canvas').getContext('2d');

		test_building = Building;
		test_building.generate(12,18);
		test_building.render(this.display_surface, 0, 0);
	},

	tick: function() {

	}

};

var Building = {

	size_x_cells: 0,
	size_y_cells: 0,
	margin_x: 0,
	margin_y: 0,

	tiers: [],
	tier_count: 0,
	tier_vertical_ratio_type: 0,
	tier_horizontal_ratio_type: 0,

	tier_window_type: 0,
	tier_inner_margin: 0,

	generate: function(cells_x, cells_y) {

		this.size_x_cells = cells_x;
		this.size_y_cells = cells_y;

		this.tier_count = RNGRules.select('tier_count');
		this.tier_vertical_ratio_type = RNGRules.select('tier_vertical_ratio_type');
		this.tier_horizontal_ratio_type = RNGRules.select('tier_horizontal_ratio_type');

		this.tier_window_type = RNGRules.select('window_type');

		var available_vertical_cells = cells_y;
		var prev_size = this.size_x_cells;
		for (i = 0; i < this.tier_count; i++) {
			// clone
			var new_tier = Object.assign({}, BuildingTier); 

			// decide tier horizontal size
			var h_size = 0;
			if (this.tier_count == 1) {
				h_size = this.size_x_cells;
				available_vertical_cells = 0;
			} else {
				if (i !== 0) {
					if (this.tier_horizontal_ratio_type == 1) {
						h_size = Math.floor(prev_size * 0.8);
					} else if (this.tier_horizontal_ratio_type == 2) {
						h_size = Math.floor(prev_size * 0.6);
					}
				} else {
					h_size = this.size_x_cells;
				}
				prev_size = h_size;
			}

			// decide tier vertical size
			var v_size=0;
			if (this.tier_count == 1) {
				v_size = this.size_y_cells;
			} else {
				if (this.tier_vertical_ratio_type == 1) {
					v_size = Math.floor(available_vertical_cells * 0.5);
				} else if (this.tier_vertical_ratio_type == 2) { // base tier takes little space
					if (i == 0) {
						v_size = Math.floor(available_vertical_cells * 0.25);
					} else if (i == (this.tier_count-1)) {
						v_size = available_vertical_cells;
					} else {
						v_size = Math.floor(available_vertical_cells * 0.5);
					}
				} else if (this.tier_vertical_ratio_type == 3) { // top tier takes little space
					if (i == (this.tier_count-1)) {
						v_size = Math.floor(available_vertical_cells * 0.25);
					} else {
						v_size = Math.floor(available_vertical_cells * 0.5);
					}
				}
				available_vertical_cells -= v_size;
			}

			new_tier.generate(h_size,v_size,this.size_x_cells,i);

			this.tiers.push(new_tier);
		}

		if (available_vertical_cells > 0) {
			this.tiers[0].set_v_size(this.tiers[0].cells_y+available_vertical_cells);
		}

	},

	render: function(surface, x, y) {
		var vert_base = y;
		for (i = 0; i < this.tier_count; i++) {
			this.tiers[i].render(surface,x,vert_base);
			vert_base += this.tiers[i].size_y;
		}
	},
};

var BuildingTier = {

	cells_x:0,
	cells_y:0,
	size_x:0,
	size_y:0,
	frame_width:0,
	level:0,

	generate: function(cells_x, cells_y, frame_width, level) {
		this.cells_x = cells_x;
		this.cells_y = cells_y;
		this.size_x = cells_x * Game.cell_size;
		this.size_y = cells_y * Game.cell_size;
		this.frame_width = frame_width * Game.cell_size;
		this.level = level;
	},

	set_v_size: function(cells_y) {
		this.cells_y = cells_y;
		this.size_y = cells_y * Game.cell_size;
	},

	render: function(surface, x, y) {
		// this is rendered from the bottom left instead of the top left, so y needs to be inverted
		var x_start = (this.frame_width - this.size_x) / 2;
		var y_start = surface.canvas.clientHeight - this.size_y - y;

		surface.beginPath();
		surface.rect(x_start, y_start, this.size_x, this.size_y);
		if (this.level == 0) {
			surface.fillStyle = 'rgb(100,100,200)';
		} else if (this.level == 1) {
			surface.fillStyle = 'rgb(100,200,100)';
		} else if (this.level == 2) {
			surface.fillStyle = 'rgb(200,100,100)';
		}
		surface.fill();    
		surface.closePath();

		surface.strokeStyle = 'rgb(255,0,0)';
		for (var i = 0; i < this.cells_x; i++) {
			for (var j = 0; j < this.cells_y; j++) {
				// grid line bottom
				surface.beginPath();
				surface.moveTo(x_start + (i * Game.cell_size), y_start + (j * Game.cell_size) + Game.cell_size);
				surface.lineTo(x_start + (i * Game.cell_size) + Game.cell_size, y_start + (j * Game.cell_size) + Game.cell_size);
				surface.closePath();
				surface.stroke();

				surface.beginPath();
				surface.moveTo(x_start + (i * Game.cell_size) + Game.cell_size, y_start + (j * Game.cell_size));
				surface.lineTo(x_start + (i * Game.cell_size) + Game.cell_size, y_start + (j * Game.cell_size) + Game.cell_size);
				surface.closePath();
				surface.stroke();
			}
		}

		
	}

};

Game.init();

setInterval(function() {
	Game.tick();
}, 100);