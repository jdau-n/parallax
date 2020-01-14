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
		var x_start = x+((this.frame_width - this.size_x) / 2);
		var y_start = surface.canvas.clientHeight - this.size_y - y;

		surface.beginPath();
		surface.rect(x_start, y_start, this.size_x, this.size_y);
		if (this.level == 0) {
			surface.fillStyle = 'rgb(100,100,100)';
		} else if (this.level == 1) {
			surface.fillStyle = 'rgb(110,110,110)';
		} else if (this.level == 2) {
			surface.fillStyle = 'rgb(120,120,120)';
		}
		surface.fill();    
		surface.closePath();

		if (this.partition_type == 1) {
			this.partitions[0].render(surface,x_start,y_start);
		}

		if (Game.debug_grid) {
			surface.strokeStyle = 'rgb(0,0,0)';
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