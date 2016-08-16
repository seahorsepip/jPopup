jPopup.plugins.ie = {
	overrides: {
		open: function() {
			//IE6
			if(this.functions._version() <= 6) {
				var self = this;
				
				function scroll() {
					var top = ($("html").scrollTop() ? $("html").scrollTop() : $("body").scrollTop());
					self.elements.overlay.css("margin-top", top+"px");
					self.elements.wrapper.css("margin-top", top+"px");
				}
				
				$(window).on("scroll.ie_"+this.id, scroll);
				scroll();
			}
			return this._super();
		},
		close: function() {
			//IE6
			if(this.functions._version() <= 6) {
				$(window).off("scroll.ie_"+this.id);
			}
			return this._super();
		},
		position: function() {
			var s = this._super();
			//IE6
			if(this.functions._version() <= 6) {
				this.elements.overlay.css({"position": "absolute", "width": "9999px", "height": "9999px"});
				this.elements.wrapper.css("position", "absolute");
				this.elements.popup.css("position", "absolute");
			}
			return s;
		},
		_animations: {
			zoomIn: function() {
				//IE9 and below
				if(this.functions._version() <= 9) {
					var x = 0;
					var self = this;
					var speed = this._config.speed;
					var width = this.elements.popup.outerWidth();
					var height = this.elements.popup.outerHeight();
					var filter = this.elements.popup.css("filter");
					filter = filter ? filter+" " : "";
					var msFilter = this.elements.popup.css("filter");
					msFilter = msFilter ? msFilter+" " : "";
					var animate = function() {
						x += 6000 / speed;
						var scale = .8 + .2 * (x / 100);
						var scaleX = width * .1 * (1- (x / 100)) + "px";
						var scaleY = height * .1 * (1- (x / 100)) + "px";
						self.elements.popup.css({
							"-ms-filter": msFilter+"progid:DXImageTransform.Microsoft.Matrix(M11="+scale+", M12=0, M21=0, M22="+scale+", SizingMethod='auto expand')",
							"filter": filter+"progid:DXImageTransform.Microsoft.Matrix(M11="+scale+", M12=0, M21=0, M22="+scale+", SizingMethod='auto expand')",
							"margin-left": scaleX,
							"margin-top": scaleY,
							"opacity": (x / 100)
						});
						if(x >= 100) {
							clearInterval(animation);
							setTimeout(function() {
								self.elements.popup.css({"opacity": "", "-ms-filter": msFilter, "filter": filter, "margin-left": "", "margin-top": ""});
							}, speed);
						}
					}
					var animation = setInterval(animate, 60);
					animate();
				} else {
					this._super();
				}
			},
			zoomOut: function() {
				//IE9 and below
				if(this.functions._version() <= 9) {
					var x = 0;
					var self = this;
					var speed = this._config.speed;
					var width = this.elements.popup.outerWidth();
					var height = this.elements.popup.outerHeight();
					var filter = this.elements.popup.css("filter");
					filter = filter ? filter+" " : "";
					var msFilter = this.elements.popup.css("filter");
					msFilter = msFilter ? filter+" " : "";
					var animate = function() {
						x += 6000 / speed;
						var scale = .8 + .2 * (1- (x / 100));
						var scaleX = width * .1 * (x / 100) + "px";
						var scaleY = height * .1 * (x / 100) + "px";
						self.elements.popup.css({
							"-ms-filter": msFilter+"progid:DXImageTransform.Microsoft.Matrix(M11="+scale+", M12=0, M21=0, M22="+scale+", SizingMethod='auto expand')",
							"filter": filter+"progid:DXImageTransform.Microsoft.Matrix(M11="+scale+", M12=0, M21=0, M22="+scale+", SizingMethod='auto expand')",
							"margin-left": scaleX,
							"margin-top": scaleY,
							"opacity": (1- (x / 100))
						});
						if(x >= 100) {
							clearInterval(animation);
							setTimeout(function() {
								self.elements.popup.css({"opacity": "", "-ms-filter": msFilter, "filter": filter, "margin-left": "", "margin-top": ""});
							}, speed);
						}
					}
					var animation = setInterval(animate, 60);
					animate();
				} else {
					this._super();
				}
			}
		}
	},
	functions: {
		_version: function() {
			//version
			var ua = window.navigator.userAgent;
			var msie = ua.indexOf('MSIE ');
			if (msie > 0) {
				return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
			}
		}
	}
};
