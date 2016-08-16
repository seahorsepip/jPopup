function jPopup(config) {
	//Default options
	//Todo: clean these up...
	var defaults = {
		title: "",
		content: "",
		buttons: [],
		closeButtonContent: "&times;",
		closeButton: false,
		overlay: true,
		overlayClose: false,
		draggable: false,
		resizeable: false,
		position: "center",
		offset: {
			x: 0,
			y: 0
		},
		speed: 300,
		animations: {
			open: {
				center: function() {
					this._animations.zoomIn.apply(this);
				}
			},
			close: {
				center: function() {
					this._animations.zoomOut.apply(this);
				}
			}
		},
		stickToBottom: true,
		keyClose: false,
		freeze: true,
		onOpen: function() {},
		afterOpen: function() {},
		onClose: function() {},
		afterClose: function() {},
		onShow: function() {},
		afterShow: function() {},
		onHide: function() {},
		afterHide: function() {},
		mediaquery: true,
		responsive: {},
		plugins: {}
	};
	
	
	//Apply plugins
	var self = this;
	function override(object, proto, name, p, k) {
		if (typeof object === "function") {
			p[k] = function() {
				
				//Original arguments
				var a = arguments;
				
				//Original function
				self._super = function() {
					return proto.apply(self, a);
				};
				
				//Additional functions
				self.functions = jPopup.plugins[name].functions;
				
				//Custom function
				return object.apply(self, a);
			};
		} else {
			for(key in object) {
				override(object[key], proto[key], name, proto, key);
			}
		}
	}
	for(name in jPopup.plugins) {
		//Load plugin defaults in config
		defaults.plugins[name] = jPopup.plugins[name].defaults;
		
		//Override functions
		override(jPopup.plugins[name].overrides, jPopup.prototype, name);
	}
	
	//Apply options to config
	this._config = $.extend(defaults, config);
	
	//Generate unique id
	do {
		this.id = Math.random().toString(36).substr(2, 16);
	} while(!this.id);
	
	//Generate html elements
	var elements = $("<div><div class=\"jp_overlay\" style=\"position:fixed;top:0;left:0;bottom:0;right:0;display:none;opacity:0;\"></div><div class=\"jp_wrapper\" style=\"display:none;\"><form class=\"jp_popup\" style=\"position:absolute;float:left;\"><header class=\"jp_title\"></header><section class=\"jp_content\"></section><footer class=\"jp_buttons\"></footer><button class=\"jp_close\"></button><div class=\"jp_resize\" style=\"display:none;\"><div style=\"position:absolute;top:0;left:0;right:0;height:6px;cursor:n-resize;\"></div><div style=\"position:absolute;top:0;left:0;bottom:0;width:6px;cursor:w-resize;\"></div><div style=\"position:absolute;left:0;bottom:0;right:0;height:6px;cursor:s-resize;\"></div><div style=\"position:absolute;top:0;bottom:0;right:0;width:6px;cursor:e-resize;\"></div><div style=\"position:absolute;top:0;left:0;width:6px;height:6px;cursor:nw-resize;\"></div><div style=\"position:absolute;top:0;right:0;width:6px;height:6px;cursor:ne-resize;\"></div><div style=\"position:absolute;left:0;bottom:0;width:6px;height:6px;cursor:sw-resize;\"></div><div style=\"position:absolute;bottom:0;right:0;width:6px;height:6px;cursor:se-resize;\"></div></div></form></div></div>");
	this.elements = {};
	this.elements.overlay = elements.children(".jp_overlay");
	this.elements.wrapper = elements.children(".jp_wrapper");
	this.elements.popup =  this.elements.wrapper.children(".jp_popup");
	this.elements.title = this.elements.popup.children(".jp_title");
	this.elements.content = this.elements.popup.children(".jp_content");
	this.elements.buttons = this.elements.popup.children(".jp_buttons");
	this.elements.close = this.elements.popup.children(".jp_close");
	this.elements.resize = this.elements.popup.children(".jp_resize");
	
	//Apply config
	this.title(this._config.title);
	this.content(this._config.content);
	this.buttons(this._config.buttons);
}

jPopup.zIndex = 10000;
jPopup.instances = {};
jPopup.plugins = {};

jPopup.prototype = {
	open: function() {
		
		//Add popup to instances
		jPopup.instances[this.id] = this;
		
		//Add overlay and wrapper to document body
		$("body").append(this.elements.overlay);
		$("body").append(this.elements.wrapper);
		
		//Show wrapper
		this.elements.wrapper.show();
		
		//Set position
		this.position(this._config.position);
		
		//Set offset
		
		//Set z-index
		this._zIndex();
		
		//Animate
		this._config.animations.open[this._config.position].apply(this);
		
		//Button click
		var self = this;
		var r = $.Deferred();
		this.elements.buttons.on("click", "button", function(e) {
			e.preventDefault();
			var button = self._config.buttons[$(this).index()];
			
			/*
			if(hasFormValidation() && validate) {
				if(!popup[0].checkValidity()) {
					$("<input type=\"submit\">").hide().appendTo(popup).click().remove();
				} else {
					if(!closed) {
						r.notify(value, popup);
					}
					if(autoClose != false) {
						close();
						closed = true;
					}
				}
			} else {
				if(!closed) {
					r.notify(value, popup);
				}
				if(autoClose != false) {
					close();
					closed = true;
				}
			}
			*/
		});
		
	},
	close: function() {
		//Remove popup from instances
		delete jPopup.instances[this.id];
		
		//Animate
		this._config.animations.close[this._config.position].apply(this);
		
		//Hide wrapper
		var self = this;
		setTimeout(function() {
			self.elements.wrapper.hide();
		}, this._config.speed);
		
		//Remove button click event
		this.elements.buttons.off("click");
	},
	title: function(title) {
		if(title) {
			//Apply new title to config
			this._config.title = title;
			
			//Add title html to title
			this.elements.title.html(title);
		} else {
			this._config.title;
		}
	},
	content: function(content) {
		if(content) {
			//Apply new content to config
			this._config.content = content;
			
			//Add content html to content
			this.elements.content.html(content);
		} else {
			this._config.content;
		}
	},
	buttons: function(buttons) {
		if(buttons) {
			//Apply new buttons to config
			this._config.buttons = buttons;
			
			//Loop trough config buttons and generate html elements
			var buttons = [];
			for(var x = 0; x < this._config["buttons"].length; x++) {
				buttons.push($("<button>"+this._config.buttons[x].text+"</button>"));
			}
			
			//Add button html elements to footer
			this.elements.buttons.html(buttons);
		} else {
			return this._config.buttons;
		}
	},
	position: function(position) {
		if(position) {
			//Apply new position to config
			this._config.position = position;
			
			//Apply position to popup
			switch(this._config.position) {
				case "center":
					this.elements.wrapper.css({"width": 0, "height": 0, "position": "fixed", "top": "50%", "left": "50%", "bottom": "", "right": ""});
					this.elements.popup.css({"width": "", "height": "", "position": "relative", "top": -this.elements.popup.outerHeight() / 2, "left": -this.elements.popup.outerWidth() / 2, "bottom": ""});
					break;
				case "top":
					this.elements.wrapper.css({"width": 0, "height": 0, "position": "fixed", "top": 0, "left": "50%", "bottom": "", "right": ""});
					this.elements.popup.css({"width": "", "height": "", "position": "relative", "top": 0, "left": -this.elements.popup.outerWidth() / 2, "bottom": ""});
					break;
				case "left":
					this.elements.wrapper.css({"width": 0, "height": 0, "position": "fixed", "top": "50%", "left": 0, "bottom": "", "right": ""});
					this.elements.popup.css({"width": "", "height": "", "position": "relative", "top": -this.elements.popup.outerHeight() / 2, "left": 0, "bottom": ""});
					break;
				case "bottom":
					this.elements.wrapper.css({"width": 0, "height": 0, "position": "fixed", "top": "", "left": "50%", "bottom": 0, "right": ""});
					if((this._config.position == "bottom" || this._config.position == "bottomLeft" || this._config.position == "bottomRight" || this._config.position == "stretchBottom") && !this._config.draggable) {
						this.elements.popup.css({"position": "absolute", "top": "", "left": -this.elements.popup.outerWidth() / 2, "bottom": 0});
					} else {
						this.elements.popup.css({"width": "", "height": "", "position": "relative", "top": -this.elements.popup.outerHeight(), "left": -this.elements.popup.outerWidth() / 2, "bottom": ""});
					}
					break;
				case "right":
					this.elements.wrapper.css({"width": 0, "height": 0, "position": "fixed", "top": "50%", "left": "", "bottom": 0, "right": 0});
					this.elements.popup.css({"width": "", "height": "", "position": "relative", "top": -this.elements.popup.outerHeight() / 2, "left": -this.elements.popup.outerWidth(), "bottom": ""});
					break;
				case "topLeft":
					this.elements.wrapper.css({"width": 0, "height": 0, "position": "fixed", "top": 0, "left": 0, "bottom": "", "right": ""});
					this.elements.popup.css({"width": "", "height": "", "position": "relative", "top": 0, "left": 0, "bottom": ""});
					break;
				case "topRight":
					this.elements.wrapper.css({"width": 0, "height": 0, "position": "fixed", "top": 0, "left": "", "bottom": "", "right": 0});
					this.elements.popup.css({"width": "", "height": "", "position": "relative", "top": 0, "left": -this.elements.popup.outerWidth(), "bottom": ""});
					break;
				case "bottomLeft":
					this.elements.wrapper.css({"width": 0, "height": 0, "position": "fixed", "top": "", "left": 0, "bottom": 0, "right": ""});
					if(this._config.stickToBottom && !this._config.draggable) {
						this.elements.popup.css({"position": "absolute", "top": "", "left": 0, "bottom": 0});
					} else {
						this.elements.popup.css({"width": "", "height": "", "position": "relative", "top": -this.elements.popup.outerHeight(), "left": 0, "bottom": ""});
					}
					break;
				case "bottomRight":
					this.elements.wrapper.css({"width": 0, "height": 0, "position": "fixed", "top": "", "left": "", "bottom": 0, "right": 0});
					if(this._config.stickToBottom && !this._config.draggable) {
						this.elements.popup.css({"position": "absolute", "top": "", "left": -this.elements.popup.outerWidth(), "bottom": 0});
					} else {
						this.elements.popup.css({"width": "", "height": "", "position": "relative", "top": -this.elements.popup.outerHeight(), "left": -this.elements.popup.outerWidth(), "bottom": ""});
					}
					break;
				case "stretchTop":
					this.elements.wrapper.css({"width": "100%", "height": 0, "position": "fixed", "top": 0, "left": 0, "bottom": "", "right": ""});
					this.elements.popup.css({"width": "100%", "height": "", "position": "relative", "top": 0, "left": 0, "bottom": ""});
					break;
				case "stretchLeft":
					this.elements.wrapper.css({"width": 0, "height": "100%", "position": "fixed", "top": 0, "left": 0, "bottom": "", "right": ""});
					this.elements.popup.css({"width": "", "height": "100%", "position": "relative", "top": 0, "left": 0, "bottom": ""});
					break;
				case "stretchBottom":
					this.elements.wrapper.css({"width": "100%", "height": 0, "position": "fixed", "top": "", "left": 0, "bottom": 0, "right": ""});
					if(this._config.stickToBottom && !this._config.draggable) {
						this.elements.popup.css({"width": "100%", "height": "", "position": "absolute", "top": "", "left": 0, "bottom": 0});
					} else {
						this.elements.popup.css({"width": "100%", "height": "", "position": "relative", "top": "", "left": 0, "bottom": ""});
					}
					break;
				case "stretchRight":
					this.elements.wrapper.css({"width": 0, "height": "100%", "position": "fixed", "top": 0, "left": "", "bottom": "", "right": 0});
					this.elements.popup.css({"width": "", "height": "100%", "position": "relative", "top": 0, "left": -this.elements.popup.outerWidth(), "bottom": ""});
					break;
				case "full":
					this.elements.wrapper.css({"width": "100%", "height": "100%", "position": "fixed", "top": 0, "left": 0, "bottom": "", "right": ""});
					this.elements.popup.css({"width": "100%", "height": "100%", "position": "relative", "top": 0, "left": 0, "bottom": ""});
			}
		} else {
			return this._config.position;
		}
	},
	_zIndex: function() {
		var zIndex = jPopup.zIndex - 1;
		for(var id in jPopup.instances) {
			zIndex++;
		}
		
		//Set z-index
		this.elements.overlay.css("z-index", zIndex);
		this.elements.wrapper.css("z-index", zIndex);
	},
	_animations: {
		zoomIn: function() {
			var self = this;
			var speed = this._config.speed;
			
			//Animation start
			this.elements.popup.css({"opacity": 0, "transform": "scale(.8)"});
			
			setTimeout(function() {
				//Animation end
				self.elements.popup.css({"opacity": "1", "transform": "scale(1)", "transition": "opacity "+speed+"ms, transform "+speed+"ms"});
				self._animations._clean.apply(self);
			}, 10);
		},
		zoomOut: function() {
			var speed = this._config.speed;
			
			//Animation end
			this.elements.popup.css({"opacity": 0, "transform": "scale(.8)", "transition": "opacity "+speed+"ms, transform "+speed+"ms"});
			this._animations._clean.apply(this);
		},
		_clean: function() {
			//Remove animation css when finished
			var self = this;
			setTimeout(function() {
				self.elements.popup.css({"opacity": "", "transform": "", "transition": ""});
			}, this._config.speed);
		}
	}
};
