function jPopup(config) {
	//Default options
	var defaults = {
		title: "",
		content: "",
		buttons: [],
		closeButtonContent: "&times;<svg fill=\"#000000\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z\"/></svg>",
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
					this._animations.open.center.apply(this);
				}
			},
			close: {
				center: function() {
					this._animations.close.center.apply(this);
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
		responsive: {}
	};
	
	//Apply options to config
	this._config = $.extend(defaults, config);

	var self = this;
	
	//Generate unique id
	do {
		this.id = Math.random().toString(36).substr(2, 16);
	} while(!this.id);
	
	//Generate html elements
	var elements = $("<div><div data-jp=\"overlay\" style=\"position:fixed;top:0;left:0;bottom:0;right:0;display:none;opacity:0;\"></div><div data-jp=\"wrapper\" style=\"display:none;\"><form data-jp=\"popup\" style=\"position:absolute;float:left;\"><header data-jp=\"title\"></header><section data-jp=\"content\"></section><footer data-jp=\"buttons\"></footer><button data-jp=\"close\"></button><div data-jp=\"resize\" style=\"display:none;\"><div style=\"position:absolute;top:0;left:0;right:0;height:6px;cursor:n-resize;\"></div><div style=\"position:absolute;top:0;left:0;bottom:0;width:6px;cursor:w-resize;\"></div><div style=\"position:absolute;left:0;bottom:0;right:0;height:6px;cursor:s-resize;\"></div><div style=\"position:absolute;top:0;bottom:0;right:0;width:6px;cursor:e-resize;\"></div><div style=\"position:absolute;top:0;left:0;width:6px;height:6px;cursor:nw-resize;\"></div><div style=\"position:absolute;top:0;right:0;width:6px;height:6px;cursor:ne-resize;\"></div><div style=\"position:absolute;left:0;bottom:0;width:6px;height:6px;cursor:sw-resize;\"></div><div style=\"position:absolute;bottom:0;right:0;width:6px;height:6px;cursor:se-resize;\"></div></div></form></div></div>");
	this.elements = {};
	this.elements.overlay = elements.children("[data-jp=overlay]");
	this.elements.wrapper = elements.children("[data-jp=wrapper]");
	this.elements.popup =  this.elements.wrapper.children("[data-jp=popup]");
	this.elements.title = this.elements.popup.children("[data-jp=title]");
	this.elements.content = this.elements.popup.children("[data-jp=content]");
	this.elements.buttons = this.elements.popup.children("[data-jp=buttons]");
	this.elements.close = this.elements.popup.children("[data-jp=close]");
	this.elements.resize = this.elements.popup.children("[data-jp=resize]");
	
	//Apply config
	this.title(this._config.title);
	this.content(this._config.content);
	this.buttons(this._config.buttons);
}

jPopup.zIndex = 10000;
jPopup.instances = {}

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
		
	},
	close: function() {
		//Remove popup from instances
		delete jPopup.instances[this.id];
		
		//Animate
		this._config.animations.close[this._config.position].apply(this);
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
					this.elements.wrapper.css({"width": 0, "height": 0, "position": "fixed", "top": "", "left": "0", "bottom": 0, "right": ""});
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
		open: {
			center: function() {
				var self = this;
				var speed = this._config.speed;
				self.elements.popup.css({"opacity": "0", "transform": "scale(.8)"});
				
				setTimeout(function() {
					self.elements.popup.css({"opacity": "1", "transform": "scale(1)", "transition": "opacity "+speed+"ms, transform "+speed+"ms"});
				}, 1);
			}
		},
		close: {
			center: function() {
				this.elements.popup.css({"opacity": "0", "transform": "scale(.8)"});
			}
		}
	}
};
