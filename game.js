var RNGRules = {

	// weights should all be integers
	weight_defs: {
		'tier_count': {1:3,2:3,3:6},

		// 1: no change
		// 2: +1
		// 3: -1
		'window_modify': {1:6,2:1,3:1},

		// 1: even, 2: top quarter, 3: bottom quarter
		'tier_vertical_ratio_type': {1:2,2:1,3:4},

		// 1: 80% of last tier
		// 2: 60% of last tier
		'tier_horizontal_ratio_type': {1:2,2:1},

		// 1: seperate single cells
		// 2: doubles
		// 3: continuous
		// 4: quads
		// 5: quads, joined lights
		'window_join_type': {1:4,2:2,3:2,4:1,5:1},

		// 1: uniform
		// 2: single division
		// 3: centred partition
		'partition_type': {1:4,2:0,3:0}
	},

	range_defs: {
		'l1_window_size': [2,6],
		'l2_window_size': [2,5],
		'l3_window_size': [1,5],
		'l4_window_size': [1,4],
		'l5_window_size': [1,2],
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

		for (var i in def) {
			for (var j = 0; j < def[i]*2; j++) {
				table.push(i);
			}
		}

		return table;
	},

	rng_rule: function(rule_name) {
		if (!(rule_name in this.range_defs)) { console.log("WARNING: rng_rule called with nonexistent def: "+rule_name); }

		return Math.floor(Math.random() * (this.range_defs[rule_name][1] - this.range_defs[rule_name][0])) + this.range_defs[rule_name][0];
	},

	rng: function(rng_floor, rng_ceil) {
		return Math.floor(Math.random() * (rng_ceil - rng_floor)) + rng_floor;
	},

};


var Game = {

	debug_grid: false,

	cell_size: 8,

	layers: [],
	display_canvas: null,
	display_surface: null,

	init: function() {
		this.display_canvas = document.getElementById('main-canvas');
		this.display_surface = document.getElementById('main-canvas').getContext('2d');

		test_building = Building;
		test_building.generate(35,50);
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

	tier_window_join_type: 0,
	tier_window_size_x: 0,
	tier_window_size_y: 0,
	tier_partition_type: 0,

	generate: function(cells_x, cells_y) {

		this.size_x_cells = cells_x;
		this.size_y_cells = cells_y;

		this.tier_count = RNGRules.select('tier_count');
		this.tier_vertical_ratio_type = RNGRules.select('tier_vertical_ratio_type');
		this.tier_horizontal_ratio_type = RNGRules.select('tier_horizontal_ratio_type');

		// detail rules are set at a building level
		// there is a chance they are changed per tier, but generally they should be similar
		this.tier_window_join_type = RNGRules.select('window_join_type');
		this.tier_window_size_x = RNGRules.rng_rule('l1_window_size');
		this.tier_window_size_y = RNGRules.rng_rule('l1_window_size');
		this.tier_partition_type = RNGRules.select('partition_type');

		var available_vertical_cells = cells_y;
		var prev_size = this.size_x_cells;
		for (var i = 0; i < this.tier_count; i++) {
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
						h_size = Math.floor(prev_size * 0.7);
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

		for (var i = 0; i < this.tier_count; i++) {
			this.tiers[i].generate_detail(this.tier_window_join_type, this.tier_window_size_x, this.tier_window_size_y, this.tier_partition_type);
		}

	},

	render: function(surface, x, y) {
		var vert_base = y;
		for (var i = 0; i < this.tier_count; i++) {
			this.tiers[i].render(surface,x,vert_base);
			vert_base += this.tiers[i].size_y;
		}
	},
};

var TierPartition = {

	size_x:0,
	size_y:0,
	window_size_x: 0,
	window_size_y: 0,
	bb_x: 0,
	bb_y: 0,
	window_type: 0,

	window_h_count: 0,
	window_v_count: 0,

	generate: function(size_x,size_y,window_size_x,window_size_y,window_type) {
		this.size_x=size_x;
		this.size_y=size_y;
		this.window_size_x=window_size_x;
		this.window_size_y=window_size_y;
		this.window_type=window_type;

		// figure out how many windows this can fit
		// includes borders, therefore bb = bounding box
		var bb_x = window_size_x;
		var bb_y = window_size_y;
		if (window_type==1) { // seperate - borders both sides
			bb_x += 1;
			bb_y += 1;
		} else if (window_type == 2) { // doubles - one border every 2 windows
			bb_x += 0.5;
			bb_y += 1;
		} else if (window_type == 3) { // continuous, only border on bottom
			bb_y += 1;
		} else if (window_type == 4 || window_type == 5) { // quads, one border every 2 in both directions
			bb_x += 0.5;
			bb_y += 0.5;
		}

		this.bb_x = bb_x;
		this.bb_y = bb_y;
		this.window_h_count = Math.floor((size_x - 2) / bb_x);
		this.window_v_count = Math.floor((size_y - 2) / bb_y);
	},

	render: function(surface, x_corner, y_corner) {
		console.log(this.window_h_count, this.window_v_count, this.window_type);
		var start_x = x_corner + Game.cell_size;
		var start_y = y_corner + Game.cell_size;
		for (var i = 0; i < this.window_h_count; i++) {
			for (var j = 0; j < this.window_v_count; j++) {
				var x_origin = start_x;
				var y_origin = start_y;
				if (this.window_type==1) { // seperate - borders both sides
					x_origin += (i * (this.window_size_x + 1)) * Game.cell_size;
					y_origin += (j * (this.window_size_y + 1)) * Game.cell_size;
				} else if (this.window_type == 2) { // doubles - one border every 2 windows
					x_origin += Math.floor(i * this.bb_x) * Game.cell_size;
					y_origin += (j * (this.window_size_y + 1)) * Game.cell_size;
				} else if (this.window_type == 3) { // continuous, only border on bottom
					x_origin += Math.floor(i * this.bb_x) * Game.cell_size;
					y_origin += (j * (this.window_size_y + 1)) * Game.cell_size;
				} else if (this.window_type == 4 || this.window_type == 5) { // quads, one border every 2 in both directions
					x_origin += Math.floor(i * this.bb_x) * Game.cell_size;
					y_origin += Math.floor(j * this.bb_y) * Game.cell_size;
				}

				surface.beginPath();
				surface.rect(x_origin, y_origin, this.window_size_x * Game.cell_size, this.window_size_y * Game.cell_size);
				surface.fillStyle = 'rgb('+RNGRules.rng(50, 255)+','+RNGRules.rng(185, 200)+','+RNGRules.rng(0, 10)+')';
				surface.fill();    
				surface.closePath();
		 	}
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

	partitions: [],
	partition_type: 0,

	generate: function(cells_x, cells_y, frame_width, level) {
		this.cells_x = cells_x;
		this.cells_y = cells_y;
		this.size_x = cells_x * Game.cell_size;
		this.size_y = cells_y * Game.cell_size;
		this.frame_width = frame_width * Game.cell_size;
		this.level = level;
	},

	generate_detail(window_type,window_size_x,window_size_y,partition_type) {
		this.partitions = [];

		var window_modify = RNGRules.select('window_modify');
		if (window_modify == 2) { window_size_x += 1; }
		if (window_modify == 3) { window_size_x -= 1; }

		var window_modify = RNGRules.select('window_modify');
		if (window_modify == 2) { window_size_y += 1; }
		if (window_modify == 3) { window_size_y -= 1; }

		this.partition_type = partition_type;
		if (this.partition_type == 1) {
			var new_partition = Object.assign({}, TierPartition);
			new_partition.generate(this.cells_x,this.cells_y,window_size_x,window_size_y,window_type);
			this.partitions.push(new_partition);
		}

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

		if (this.partition_type == 1) {
			this.partitions[0].render(surface,x_start,y_start);
		}

		if (Game.debug_grid) {
			surface.strokeStyle = 'rgb(255,255,255)';
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

		
	}

};

Game.init();
/*
setInterval(function() {
	Game.tick();
}, 100);
*/