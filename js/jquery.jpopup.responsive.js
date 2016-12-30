/**
 * @license
 *
 * jPopup v2.0.2
 * http://jpopup.seapip.com
 
 * Copyright Thomas Gladdines
 * http://jpopup.seapip.com/LICENSE
 */
jPopup.plugins.responsive = {
	defaults: false,
	overrides: {
		open: function() {
			this.plugins.responsive.call(this, this._config.plugins.responsive);
			return jPopup._super(this);
		},
		close: function() {
			$(window).off("resize.jp_resize"+this.id);
			return jPopup._super(this);
		}
	},
	vars: {
		breakpoint: function() {
			var responsive = this._config.plugins.responsive;
			var width = 0;
			var windowWidth = window.innerWidth ? window.innerWidth > $(window).width() ? window.innerWidth : $(window).width() : $(window).width();
			for(breakpoint in responsive) {
				if(windowWidth < breakpoint) {
					break;
				}
				width = breakpoint;
			}
			if(width != this.__vars.width) {
				this.__vars.width = width;
				responsive[width].call(this);
			}
		}
	},
	methods: function(responsive) {
		if(arguments.length) {
			this._config.plugins.responsive = responsive;
			if(responsive) {
				var breakpoint = jPopup.plugins.responsive.vars.breakpoint.bind(this);
				$(window).on("resize.jp_responsive"+this.id, function() {
					breakpoint();
				});
				breakpoint();
			} else {
				$(window).off("resize.jp_responsive"+this.id);
			}
			
			return this;
		}
		
		return this._config.plugins.responsive;
	}
};