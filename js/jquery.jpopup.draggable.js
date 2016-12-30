/**
 * @license
 *
 * jPopup v2.0.2
 * http://jpopup.seapip.com
 
 * Copyright Thomas Gladdines
 * http://jpopup.seapip.com/LICENSE
 */
jPopup.plugins.draggable = {
	defaults: false,
	overrides: {
		open: function() {
			this.plugins.draggable.call(this, this._config.plugins.draggable);
			return jPopup._super(this);
		},
		close: function() {
			this.elements.title.off("mousedown touchstart");
			$(document).off("mousemove.jp_draggable"+this.id+" touchmove.jp_draggable"+this.id);
			$(document).off("mouseup.jp_draggable"+this.id+" touchend.jp_draggable"+this.id);
			return jPopup._super(this);
		}
	},
	methods: function(draggable) {
		if(arguments.length) {
			if(draggable) {	
				var self = this;
				var dragging;
				var offset;
				
				this.elements.title.css("cursor", "move");
				this.elements.overlay.addClass("jp_draggable");
				this.elements.wrapper.addClass("jp_draggable");
				
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
				this.elements.popup.on("mousedown touchstart", function(e) {
					if($(e.target).parent()[0] != self.elements.buttons[0] && e.target != self.elements.close[0]) {
						self._zIndex();
					}
				});
				$(document).on("mousemove.jp_draggable"+this.id+" touchmove.jp_draggable"+this.id, function(e) {
					if(dragging) {
						self.offset({
							x: (e.pageX || (e.originalEvent.touches ? e.originalEvent.touches[0].pageX : 0)) - offset.x - self.offset().x,
							y: offset.y - (e.pageY || (e.originalEvent.touches ? e.originalEvent.touches[0].pageY : 0)) - self.offset().y
						});
					}
				});
				$(document).on("mouseup.jp_draggable"+this.id+" touchend.jp_draggable"+this.id, function() {
					dragging = false;
					$(document).off("selectstart");
				});
				
			} else {
				this.elements.title.css("cursor", "");
				this.elements.overlay.removeClass("jp_draggable");
				this.elements.wrapper.removeClass("jp_draggable");
				
				this.elements.title.off("mousedown touchstart");
				$(document).off("mousemove.jp_draggable"+this.id+" touchmove.jp_draggable"+this.id);
				$(document).off("mouseup.jp_draggable"+this.id+" touchend.jp_draggable"+this.id);
			}
			this._config.plugins.draggable = draggable ? true: false;
			
			return this;
		}
		
		return this._config.plugins.draggable;
	}
};