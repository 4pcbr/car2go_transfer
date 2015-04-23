(function() {
	
	var EVENT_LOOP_TIME_DELTA = 10;
	
	var T = function(opts) {
		this.sequences  = [];
		this.is_running = false;
		this.loop_pid   = null;
		this.time       = opts.start_time || 0;
		this.speed      = opts.speed      || 1.0;
		this.ptr        = 0;
	}
	
	T.prototype.getSpeed = function() {
		return this.speed;
	}
	
	T.prototype.isRunning = function() {
		return this.is_running;
	}
	
	T.prototype.addSequence = function(sequence) {
		var self = this;
		var prev_obj;
		$.each(sequence, function(ix, sequence_obj) {

			if (ix > sequence.length - 1) {
				return;
			}

			if (ix > 0) {
				var obj_from = {
					lat: sequence_obj.lat,
					lon: sequence_obj.lon,
				}
				var obj_to = {
					lat: sequence[ix + 1].lat,
					lon: sequence[ix + 1].lon,
				}
				var duration = sequence[ix + 1].time - sequence_obj.time;
				var step_func = sequence_obj.step;
				self.sequences.push({
					time:    sequence_obj.time,
					run: function() {
						$(obj_from).animate(obj_to, {
							duration: duration / self.getSpeed(),
							step: step_func,
						});
					}
				});
			}
		});
		
		this.sequences.sort(function(a, b) { var t1 = a.time, t2 = b.time; return a == b ? 0 : a > b ? 1 : -1 });
	}
	
	T.prototype.setStartTime = function(start) {
		if (this.isRunning()) {
			throw "The timeline is already running and is immutable";
		}
	}
	
	T.prototype.play = function() {
		this.is_running = true;
		this._tick();
	}

	T.prototype.stop = function() {
		this.is_running = false;
		this.ptr = 0;
	}
	
	T.prototype._tick = function() {
		var t = Date.now();
		var self = this;
		window.setTimeout(function() {
			self.time += Date.now() - t * this.getSpeed();
			while (self.ptr < self.sequences.length &&
				self.sequences[self.ptr].time < self.time) {
				self.sequences[self.ptr].run();
				self.ptr++;
			}
			self._tick();
		}, EVENT_LOOP_TIME_DELTA);
	}
	
	window.Timeline = T;
})();