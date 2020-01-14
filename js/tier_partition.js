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

	window_h_variation: false,

	generate: function(size_x,size_y,window_size_x,window_size_y,window_type) {
		this.size_x=size_x;
		this.size_y=size_y;
		this.window_size_x=window_size_x;
		this.window_size_y=window_size_y;
		this.window_type=window_type;

		// figure out how many windows this can fit
		// includes borders, therefore bb = bounding box
		var bb_x = window_size_x + PatternDefs.Windows[window_type].margin_x;
		var bb_y = window_size_y + PatternDefs.Windows[window_type].margin_y;

		this.bb_x = bb_x;
		this.bb_y = bb_y;
		this.window_h_count = Math.floor((size_x - 2) / bb_x);
		this.window_v_count = Math.floor((size_y - 2) / bb_y);

		// if the vertical count is odd and the windows are vertically joined, remove 1 set to make it clean
		if (this.window_v_count % 2 !== 0 && (window_type == 4 || window_type == 5)) { this.window_v_count -= 1; }
		if (this.window_h_count % 2 !== 0) { this.window_h_count -= 1; }

		// // if the horizontal count is odd and windows are horizontally joined, decide on a variation
		// // false = remove one window and create a gap in the middle
		// // true = move the thin window to the centre
		// if (this.window_h_count % 2 !== 0 && window_type > 1) {
		// 	this.window_h_variation = (RNGRules.rng(0,1) === 1);
		// 	if (!this.window_h_variation) {
		// 		this.window_h_count -= 1;
		// 	}
		// }
	},

	render: function(surface, x_corner, y_corner) {
		console.log(this.window_h_count, this.window_v_count, this.window_type);
		var start_x = x_corner + Game.cell_size;
		var start_y = y_corner + Game.cell_size;

		// outer border of tiles are the margin
		// how many tiles are spare at the end of the row
		// is it a horizontal join type? if so margin is only if there is double
		var margin = 0;
		var unjoin = false;
		if (PatternDefs.Windows[this.window_type].join_x == 'single') {
			if (this.window_h_count % 2 == 0) {
				margin = 1;
			} else {
				unjoin = true;
			}
		} else if (!PatternDefs.Windows[this.window_type].join_x) { // if no join, there is a margin
			margin = 1;
		}

		var free_cells = Math.ceil((this.size_x-2) - ((this.window_h_count * this.bb_x) - margin))-1;
		console.log('free',free_cells);
		var free_cell_inc = Math.floor(this.window_h_count / free_cells);


		for (var i = 0; i < this.window_h_count; i++) {
			for (var j = 0; j < this.window_v_count; j++) {
				var x_origin = start_x;
				var y_origin = start_y;

				var offset = 0;
				var halfway_point = Math.floor(this.window_h_count / 2) + 1;

				x_origin += Math.floor(i * this.bb_x + offset) * Game.cell_size;
				y_origin += Math.floor(j * this.bb_y) * Game.cell_size;
				
				//x_origin += halfway_margin;

				surface.beginPath();
				surface.rect(x_origin, y_origin, this.window_size_x * Game.cell_size, this.window_size_y * Game.cell_size);
				if (RNGRules.rng(0,10) == 3) {
					surface.fillStyle = 'rgb('+RNGRules.rng(200,220)+','+RNGRules.rng(200,220)+','+RNGRules.rng(0, 30)+')';
				} else {
					surface.fillStyle = 'rgb('+RNGRules.rng(20, 25)+','+RNGRules.rng(20, 23)+','+RNGRules.rng(10,20)+')';
				}
				surface.fill();    
				surface.closePath();
		 	}
		 }

	},
};