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
		'partition_type': {1:4,2:0,3:0},

		// 1: right align
		// 2: left align
		// 3: middle column
		// 4: centre 
		'window_align_type': {1:1,2:1,3:3,4:4}
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