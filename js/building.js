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