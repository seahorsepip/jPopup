jPopup.plugins.draggable = {
	defaults: false,
	overrides: {
		_create: function() {
			if(this._config.plugins.draggable) {
				this.elements.title.css("cursor", "move");
			}
			return jPopup._super(this);
		},
		open: function() {
			if(this._config.plugins.draggable) {
				var self = this;
				var dragging;
				var offset;
				this.elements.title.on("mousedown touchstart", function(e) {
					dragging = true;
					offset = {
						x: (e.pageX || (e.originalEvent.touches ? e.originalEvent.touches[0].pageX : 0)) - self.offset().x,
						y: (e.pageY || (e.originalEvent.touches ? e.originalEvent.touches[0].pageY : 0)) + self.offset().y
					};
					$(document).on("selectstart", function(e) {
						e.preventDefault();
					});
				});
				$(document).on("mousemove touchmove", function(e) {
					if(dragging) {
						self.offset({
							x: (e.pageX || (e.originalEvent.touches ? e.originalEvent.touches[0].pageX : 0)) - offset.x - self.offset().x,
							y: offset.y - (e.pageY || (e.originalEvent.touches ? e.originalEvent.touches[0].pageY : 0)) - self.offset().y
						});
					}
				});
				$(document).on("mouseup touchend", function() {
					dragging = false;
					$(document).off("selectstart");
				});
			}
			return jPopup._super(this);
		},
		close: function() {
			if(this._config.plugins.draggable) {
				this.elements.title.off("mousedown touchstart");
				$(document).off("mousemove touchmove");
				$(document).off("mouseup touchend");
			}
			return jPopup._super(this);
		}
	}
};