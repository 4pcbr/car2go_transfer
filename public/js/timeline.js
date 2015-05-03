(function() {
	
	var EVENT_LOOP_TIME_DELTA = 500;
	
	var T = function(opts) {
		this.sequences  = [];
		this.is_running = false;
		this.loop_pid   = null;
		this.time       = opts.start_time || 0;
		this.speed      = opts.speed      || 1.0;
		this.ptr        = 0;
    this.tick       = opts.tick || $.noop;
    this.animation_speed =
                      opts.speed || 1.0;
    this.animation_duration =
                      opts.animation_duration || 0;
	}
	
	T.prototype.getSpeed = function() {
		return this.speed;
	}

  T.prototype.getAnimationSpeed = function() {
    return this.animation_speed;
  }
	
	T.prototype.isRunning = function() {
		return this.is_running;
	}
	
	T.prototype.addSequence = function(sequence) {
		var self = this;
		var prev_obj;
		$.each(sequence, function(ix, sequence_obj) {
			if (ix >= sequence.length - 1) {
				return;
			}
			var obj_from    = sequence_obj.pos;
			var obj_to      = sequence[ix + 1].pos;
			var duration    = sequence[ix + 1].time - sequence_obj.time;
			var step_func   = sequence_obj.step;
      var start_func  = sequence_obj.start || $.noop;
      var finish_func = sequence_obj.finish  || $.noop;
			self.sequences.push({
				time: sequence_obj.time,
				run: function() {
          start_func();
					$(obj_from).animate(obj_to, {
						duration: self.animation_duration || duration / self.getSpeed() * self.getAnimationSpeed(),
						step:     step_func,
            complete: finish_func,
					});
				}
			});
		});
	}
	
	T.prototype.setStartTime = function(start) {
		if (this.isRunning()) {
			throw "The timeline is already running and is immutable";
		}
		this.time = start;
	}
	
	T.prototype.play = function() {
		this.sequences = this.sequences.sort(function(a, b) { var t1 = a.time, t2 = b.time; return (t1 == t2) ? 0 : (t1 > t2) ? 1 : -1 });
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
			
			if (!self.is_running) return;
			
			self.time += Math.round((Date.now() - t) / 1e3 * self.getSpeed());
			while ((self.ptr < self.sequences.length) &&
				(self.sequences[self.ptr].time < self.time) && self.is_running) {
				self.sequences[self.ptr].run();
				self.ptr++;
				if (self.ptr >= self.sequences.length) {
					self.stop();
				}
			}
      self.tick.call(self); // Call an external user-define function
			self._tick();
		}, EVENT_LOOP_TIME_DELTA);
	}
	
	window.Timeline = T;
})();
