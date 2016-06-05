jPopup.classBase = "jpopup";
jPopup.zIndex = 10000;

function jPopup(config) {
	
	var defaults = {
		title: "",
		content: "",
		buttons: [],
		popupClass: jPopup.classBase,
		wrapperClass: jPopup.classBase+"_wrapper",
		overlayClass: jPopup.classBase+"_overlay",
		titleClass: jPopup.classBase+"_title",
		contentClass: jPopup.classBase+"_content",
		buttonsClass: jPopup.classBase+"_buttons",
		overflowXClass: jPopup.classBase+"_overflow_x",
		overflowYClass: jPopup.classBase+"_overflow_y",
		scrollTopClass: jPopup.classBase+"_scroll_top",
		scrollBottomClass: jPopup.classBase+"_scroll_bottom",
		resizeClass: jPopup.classBase+"_resize",
		closeButtonClass: jPopup.classBase+"_close",
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
		stickToBottom: true,
		keyClose: false,
		element: false
	};
	
	config = $.extend(defaults, config);
	
	var popupBase = $("<div><div class=\""+config["overlayClass"]+"\"></div><div class=\""+config["wrapperClass"]+"\"><form class=\""+config["popupClass"]+"\"><div class=\""+config["titleClass"]+"\">"+config["title"]+"</div><div class=\""+config["contentClass"]+"\">"+config["content"]+"</div><div class=\""+config["buttonsClass"]+"\">"+getButtons()+"</div><div class=\""+config["closeButtonClass"]+"\">"+config["closeButtonContent"]+"</div></form></div></div>");
	var popupWrapper = (!config["element"].length ? popupBase:config["element"]).children("."+config["wrapperClass"]).css({"display": "none", "opacity": 0});
	var popupOverlay = (!config["element"].length ? popupBase:config["element"]).children("."+config["overlayClass"]).css({"position": "fixed", "top": 0, "left": 0, "bottom": 0, "right": 0, "display": "none", "opacity": 0});
	var popup =  popupWrapper.children("."+config["popupClass"]).css({"position": "absolute", "float": "left"});
	var popupTitle = popup.children("."+config["titleClass"]);
	var popupContent = popup.children("."+config["contentClass"]);
	var popupButtons = popup.children("."+config["buttonsClass"]);
	var popupClose = popup.children("."+config["closeButtonClass"]);
	var popupResize = $("<div class=\""+config["resizeClass"]+"\" style=\"display: none;\"><div style=\"position:absolute;top:0;left:0;right: 0;height:6px;cursor:n-resize;\"></div><div style=\"position:absolute;top:0;left:0;bottom:0;width:6px;cursor:w-resize;\"></div><div style=\"position:absolute;left:0;bottom:0;right:0;height:6px;cursor:s-resize;\"></div><div style=\"position:absolute;top:0;bottom:0;right:0;width:6px;cursor:e-resize;\"></div><div style=\"position:absolute;top:0;left:0;width:6px;height:6px;cursor:nw-resize;\"></div><div style=\"position:absolute;top:0;right:0;width:6px;height:6px;cursor:ne-resize;\"></div><div style=\"position:absolute;left:0;bottom:0;width:6px;height:6px;cursor:sw-resize;\"></div><div style=\"position:absolute;bottom:0;right:0;width:6px;height:6px;cursor:se-resize;\"></div></div>");
	console.log(popupWrapper);
	popup.append(popupResize);
	var top,
		fY,
		fX,
		rY,
		rX,
		y,
		x,
		dragging,
		onResize,
		onMouseMove,
		onMouseUp,
		resizing,
		resizeHandle;

	function freeze() {
		if($("html").css("position") != "fixed" && config["overlay"]) {
			top = $("html, body").scrollTop();
			if(window.innerWidth > $("html").width()) {
				$("html").css("overflow-y", "scroll");
			}
			$("html").css({"width": "100%", "height": "100%", "position": "fixed", "top": -top});
		}
	}
	function unfreeze() {
		if($("html").css("position") == "fixed" && $("[data-popup][data-overlay]").length == 1) {
			$("html").css("position", "static");
			$("html").scrollTop(-parseInt($("html").css("top")));
			$("html").css({"position": "", "width": "", "height": "", "top": "", "overflow-y": ""});
		}
	}
	function open() {
		if(!config["element"].length) {
			$("body").append(popupOverlay).append(popupWrapper);
		} else {
			config["element"].show();
		}
		popupWrapper.attr("data-popup", "");
		(popupOverlay, popupWrapper).show();
		setOverlay();
		setDepth();
		setCloseButton();
		setDraggable();
		setResizeable();
		setButtons();
		setPosition();
		setOffset();
		overflow();
		scrollTop();
		animation();
		setTimeout(function() {
			popup.css({"transition": "transform "+(config["speed"] / 1000)+"s", "transform": "scale(1)translate(0,0)"});
		}, 1);
		popupWrapper.attr("data-position", config["position"]).css({"transition": "opacity "+(config["speed"] / 1000)+"s", "opacity": 1});
	}
	function close() {
		popupTitle.off("mousedown touchstart");
		popupContent.off("scroll");
		popupWrapper.off("click mousedown touchstart mmouseup touchend");
		popupResize.children("div").off("mousedown touchstart");
		$(window).off("resize", onResize);
		$(document).off("mousemove touchmove", onMouseMove);
		$(document).off("mouseup touchend", onMouseUp);
		hide();
		setTimeout(function() {
			if(!config["element"].length) {
				popupWrapper.remove();
				popupOverlay.remove();
			} else {
				config["element"].hide();
			}
		}, config["speed"]);
	}
	function hide() {
		config["offset"] = getOffset();
		popupWrapper.css("opacity", 0);
		popupOverlay.css("opacity", 0);
		animation();
		setTimeout(function() {
			popup.css({"transition": "", "transform": ""});
			popupWrapper.hide();
			popupOverlay.hide();
			if(config["element"].length) {
				popupWrapper.removeAttr("data-popup").removeAttr("data-overlay");
			}
			unfreeze();
		}, config["speed"]);
	}
	function animation() {
		switch(config["position"]) {
			case "stretchTop":
				popup.css({"transform": "translateY(-100%)"});
				break;
			case "stretchLeft":
				popup.css({"transform": "translateX(-100%)"});
				break;
			case "stretchBottom":
				popup.css({"transform": "translateY(100%)"});
				break;
			case "stretchRight":
				popup.css({"transform": "translateX(100%)"});
				break;
			case "full":
				break;
			default:
				popup.css({"transform": "scale(.8)"});
				break;
		}
	}
	function setOverlay() {
		if(config["overlay"]) {
			popupWrapper.attr("data-overlay", "");
			popupOverlay.show();
			setTimeout(function() {
				popupOverlay.css({"z-index": maxDepth(), "transition": "opacity "+(config["speed"] / 1000)+"s", "opacity": 1});
			}, 1);
			freeze();
		} else {
			popupWrapper.removeAttr("data-overlay");
			popupOverlay.css({"transition": "opacity "+(config["speed"] / 1000)+"s", "opacity": 0});
			setTimeout(function() {
				popupOverlay.hide();
			}, config["speed"]);
			unfreeze();
		}
	}
	function setDraggable() {
		if(config["draggable"]) {
			popupTitle.css("cursor", "move");
			if((config["position"] == "bottom" || config["position"] == "bottomLeft" || config["position"] == "bottomRight" || config["position"] == "stretchBottom") && config["stickToBottom"]) {
				stickToBottom = false;
				setPosition();
			}
			popupWrapper.attr("data-draggable","");
		} else {
			popupTitle.css("cursor", "inherit");
			popupWrapper.removeAttr("data-draggable");
		}
	}
	function setResizeable() {
		if(config["resizeable"]) {
			popupResize.show();
			popupWrapper.attr("data-resizeable","");
		} else {
			popupResize.hide();
			popupWrapper.removeAttr("data-resizeable");
		}
	}
	function setButtons() {
		if(config["buttons"].length) {
			popupWrapper.attr("data-buttons","");
		} else {
			popupWrapper.removeAttr("data-buttons");
		}
	}
	function setCloseButton() {
		if(config["closeButton"]) {
			popupClose.show();
		} else {
			popupClose.hide();
		}
	}
	function setPosition() {
		switch(config["position"]) {
			case "center":
				popupWrapper.css({"width": 0, "height": 0, "position": "fixed", "top": "50%", "left": "50%", "bottom": "", "right": ""});
				popup.css({"width": "", "height": "", "position": "relative", "top": -popup.outerHeight() / 2, "left": -popup.outerWidth() / 2, "bottom": ""});
				break;
			case "top":
				popupWrapper.css({"width": 0, "height": 0, "position": "fixed", "top": 0, "left": "50%", "bottom": "", "right": ""});
				popup.css({"width": "", "height": "", "position": "relative", "top": 0, "left": -popup.outerWidth() / 2, "bottom": ""});
				break;
			case "left":
				popupWrapper.css({"width": 0, "height": 0, "position": "fixed", "top": "50%", "left": 0, "bottom": "", "right": ""});
				popup.css({"width": "", "height": "", "position": "relative", "top": -popup.outerHeight() / 2, "left": 0, "bottom": ""});
				break;
			case "bottom":
				popupWrapper.css({"width": 0, "height": 0, "position": "fixed", "top": "", "left": "50%", "bottom": 0, "right": ""});
				if((config["position"] == "bottom" || config["position"] == "bottomLeft" || config["position"] == "bottomRight" || config["position"] == "stretchBottom") && !config["draggable"]) {
					popup.css({"position": "absolute", "top": "", "left": -popup.outerWidth() / 2, "bottom": 0});
				} else {
					popup.css({"width": "", "height": "", "position": "relative", "top": -popup.outerHeight(), "left": -popup.outerWidth() / 2, "bottom": ""});
				}
				break;
			case "right":
				popupWrapper.css({"width": 0, "height": 0, "position": "fixed", "top": "50%", "left": "", "bottom": 0, "right": 0});
				popup.css({"width": "", "height": "", "position": "relative", "top": -popup.outerHeight() / 2, "left": -popup.outerWidth(), "bottom": ""});
				break;
			case "topLeft":
				popupWrapper.css({"width": 0, "height": 0, "position": "fixed", "top": 0, "left": 0, "bottom": "", "right": ""});
				popup.css({"width": "", "height": "", "position": "relative", "top": 0, "left": 0, "bottom": ""});
				break;
			case "topRight":
				popupWrapper.css({"width": 0, "height": 0, "position": "fixed", "top": 0, "left": "", "bottom": "", "right": 0});
				popup.css({"width": "", "height": "", "position": "relative", "top": 0, "left": -popup.outerWidth(), "bottom": ""});
				break;
			case "bottomLeft":
				popupWrapper.css({"width": 0, "height": 0, "position": "fixed", "top": "", "left": "0", "bottom": 0, "right": ""});
				if(config["stickToBottom"] && !config["draggable"]) {
					popup.css({"position": "absolute", "top": "", "left": 0, "bottom": 0});
				} else {
					popup.css({"width": "", "height": "", "position": "relative", "top": -popup.outerHeight(), "left": 0, "bottom": ""});
				}
				break;
			case "bottomRight":
				popupWrapper.css({"width": 0, "height": 0, "position": "fixed", "top": "", "left": "", "bottom": 0, "right": 0});
				if(config["stickToBottom"] && !config["draggable"]) {
					popup.css({"position": "absolute", "top": "", "left": -popup.outerWidth(), "bottom": 0});
				} else {
					popup.css({"width": "", "height": "", "position": "relative", "top": -popup.outerHeight(), "left": -popup.outerWidth(), "bottom": ""});
				}
				break;
			case "stretchTop":
				popupWrapper.css({"width": "100%", "height": 0, "position": "fixed", "top": 0, "left": 0, "bottom": "", "right": ""});
				popup.css({"width": "100%", "height": "", "position": "relative", "top": 0, "left": 0, "bottom": ""});
				break;
			case "stretchLeft":
				popupWrapper.css({"width": 0, "height": "100%", "position": "fixed", "top": 0, "left": 0, "bottom": "", "right": ""});
				popup.css({"width": "", "height": "100%", "position": "relative", "top": 0, "left": 0, "bottom": ""});
				break;
			case "stretchBottom":
				popupWrapper.css({"width": "100%", "height": 0, "position": "fixed", "top": "", "left": 0, "bottom": 0, "right": ""});
				if(config["stickToBottom"] && !config["draggable"]) {
					popup.css({"width": "100%", "height": "", "position": "absolute", "top": "", "left": 0, "bottom": 0});
				} else {
					popup.css({"width": "100%", "height": "", "position": "relative", "top": "", "left": 0, "bottom": ""});
				}
				break;
			case "stretchRight":
				popupWrapper.css({"width": 0, "height": "100%", "position": "fixed", "top": 0, "left": "", "bottom": "", "right": 0});
				popup.css({"width": "", "height": "100%", "position": "relative", "top": 0, "left": -popup.outerWidth(), "bottom": ""});
				break;
			case "full":
				popupWrapper.css({"width": "100%", "height": "100%", "position": "fixed", "top": 0, "left": 0, "bottom": "", "right": ""});
				popup.css({"width": "100%", "height": "100%", "position": "relative", "top": 0, "left": 0, "bottom": ""});
		}
	}
	function boundary() {
		if(config["draggable"] || !config["stickToBottom"] || !(config["position"] == "bottom" || config["position"] == "bottomLeft" || config["position"] == "bottomRight" || config["position"] == "stretchBottom")) {
			//Bottom
			if($(window).height() - popup.offset().top - popup.outerHeight() + $("html").scrollTop() < 0) {
				popup.offset({top: $(window).height() - popup.outerHeight() + $("html").scrollTop()});
			}
			//Right
			if($(window).width() - popup.offset().left - popup.outerWidth() < 0) {
				popup.offset({left: $(window).width() - popup.outerWidth()});
			}
			//Top
			if(popup.offset().top - $("html").scrollTop() < 0 && (config["draggable"] || config["position"] != "bottom")) {
				popup.offset({top: $("html").scrollTop()});
			}
			//Left
			if(popup.offset().left < 0) {
				popup.offset({left: 0});
			}
		}
	}
	function overflow() {
		popupWrapper.removeClass(config["overflowXClass"]+" "+config["overflowYClass"]);
		var overflowX = popup.outerWidth() > $(window).width() ? true:false;
		var overflowY = popup.outerHeight() > $(window).height() ? true:false;
		if(overflowX) {
			popupWrapper.addClass(config["overflowXClass"]);
		}
		if(overflowY) {
			popupWrapper.addClass(config["overflowYClass"]);
		}
	}
	function scrollTop() {
		//Top
		if(!popupContent.scrollTop()) {
			popupWrapper.addClass(config["scrollTopClass"]);
		} else {
			popupWrapper.removeClass(config["scrollTopClass"]);
		}
		var overflowY = popup.outerHeight() > $(window).height() ? true:false;
		//Bottom
		if(!(popupContent.prop("scrollHeight") - popupContent.height() - popupContent.scrollTop())) {
			popupWrapper.addClass(config["scrollBottomClass"]);
		} else {
			popupWrapper.removeClass(config["scrollBottomClass"]);
		}
	}
	function setDepth() {
		var zIndex = maxDepth() + 1;
		popupWrapper.css("z-index", zIndex);
		popupOverlay.css("z-index", zIndex);
	}
	function sortDepth() {
		var currentDepth = popupWrapper.css("z-index");
		var currentMaxDepth = maxDepth();
		$("[data-popup]").each(function() {
			var depth = parseInt($(this).css("z-index"));
			if(depth > currentDepth) {
				$(this).css("z-index", depth - 1);
			}
		});
		popupWrapper.css("z-index", currentMaxDepth);
	}
	function maxDepth() {
		var depths = [jPopup.zIndex-1];
		$("[data-popup]").each(function() {
			var depth = parseInt($(this).css("z-index"));
			if(depth) {
				depths.push(depth);
			}
		});
		return Math.max.apply(Math, depths);
	}
	function setOffset(fOffsetX, fOffsetY) {
		if(config["position"] != "stretchTop" && config["position"] != "stretchLeft" && config["position"] != "stretchBottom" && config["position"] != "stretchRight" && !(config["position"] == "bottom" && !config["draggable"])) {
			fOffsetY = fOffsetY == undefined ? config["offset"]["y"]:fOffsetY;
			fOffsetX = fOffsetX == undefined ? config["offset"]["x"]:fOffsetX;
			fY = popup.offset().top;
			fX = popup.offset().left;
			popup.offset({
				top: fY - fOffsetY,
				left: fX + fOffsetX
			});
			boundary();
		}
	}
	function getOffset() {
		var getOffset = {};
		switch(config["position"]) {
			case "center":
			case "left":
			case "right":
				getOffset["y"] = popupWrapper.offset().top - popup.offset().top - popup.outerHeight() / 2;
				break;
			case "top":
			case "topLeft":
			case "topRight":
			case "stretchTop":
			case "stretchLeft":
			case "stretchRight":
				getOffset["y"] = popupWrapper.offset().top - popup.offset().top;
				break;
			case "bottom":
			case "bottomLeft":
			case "bottomRight":
			case "stretchBottom":
				getOffset["y"] = popupWrapper.offset().top - popup.offset().top - popup.outerHeight();
		}
		switch(config["position"]) {
			case "center":
			case "top":
			case "bottom":
				getOffset["x"] = popup.offset().left - popupWrapper.offset().left + popup.outerWidth() / 2;
				break;
			case "left":
			case "topLeft":
			case "bottomLeft":
			case "stretchTop":
			case "stretchLeft":
			case "stretchBottom":
				getOffset["x"] = popup.offset().left - popupWrapper.offset().left;
				break;
			case "right":
			case "topRight":
			case "bottomRight":
			case "stretchRight":
				getOffset["x"] = popup.offset().left - popupWrapper.offset().left + popup.outerWidth();
		}
		getOffset["y"] = Math.round(getOffset["y"]);
		getOffset["x"] = Math.floor(getOffset["x"]);
		return getOffset;
	}
	function getButtons() {
		var buttons = "";
		for(var x = 0; x < config["buttons"].length; x++) {
			var bClass = config["buttons"][x]["buttonClass"] ? " class="+config["buttons"][x]["buttonClass"]:"";
			var bCheckForm = config["buttons"][x]["checkForm"] ? " data-checkform=true":"";
			var bClose = config["buttons"][x]["close"] === false ? " data-close="+config["buttons"][x]["close"]:"";
			var bValue = config["buttons"][x]["value"] !== undefined	? " data-value="+config["buttons"][x]["value"]:"";
			var bText = config["buttons"][x]["text"] || "";
			buttons += "<button"+bClass+bClose+bCheckForm+bValue+">"+bText+"</button>";
		}
		return buttons;
	}
	function hasFormValidation() {
		return (typeof document.createElement( 'input' ).checkValidity == 'function');
	}
	this.open = function(f) {
		var r = $.Deferred();
		open();
		var closed = false;
		popupButtons.on("click", "button", function(e) {
			e.preventDefault();
			var value = $(this).data("value");
			var checkForm = $(this).data("checkform");
			var autoClose = $(this).data("close");
			if(hasFormValidation() && checkForm) {
				if(!popup[0].checkValidity()) {
					$('<input type="submit">').hide().appendTo(popup).click().remove();
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
		});
		popupClose.on("click", function(e) {
			e.preventDefault();
			close();
		});
		popupContent.on("scroll", function() {
			scrollTop();
		});
		onResize = function() {
			boundary();
			overflow();
			scrollTop();
		}
		$(window).on("resize", onResize);
		popupTitle.on("mousedown touchstart", function(e) {
			if(config["draggable"]) {
				dragging = true;
				fY = popup.offset().top;
				fX = popup.offset().left;
				y = e.pageY || e.originalEvent.touches[0].pageY;
				x = e.pageX || e.originalEvent.touches[0].pageX;
				$(document).bind("selectstart.disableSelection", function(e) {e.preventDefault();});
				$("[data-popup]").css("user-select", "none");
			}
		});
		onMouseMove = function(e) {
			mY = e.pageY == undefined ? e.originalEvent.touches[0].pageY:e.pageY;
			mX = e.pageX == undefined ? e.originalEvent.touches[0].pageX:e.pageX;
			if(dragging && config["draggable"]) {
				popup.offset({
					top: fY + mY - y,
					left: fX + mX - x
				});
				boundary();
			}
			if(resizing && config["resizeable"]) {
				if(/0|4|5/.test(resizeHandle) && (fY + mY - y) > 0) {
					popup.css("height", "");
					if((rY - mY + y) > popup.outerHeight()) {
						popup.outerHeight(rY - mY + y);
						popup.offset({
							top: fY + mY - y
						});
					}
				}
				if(/1|4|6/.test(resizeHandle) && (fX + mX - x) > 0) {
					popup.css("width", "");
					if((rX - mX + x) > popup.outerWidth()) {
						popup.outerWidth(rX - mX + x);
						popup.offset({
							left: fX + mX - x
						});
					}
				}
				if(/2|6|7/.test(resizeHandle) && (fY + mY - y + rY) < $(window).height()) {
					popup.css("height", "");
					if((rY + mY - y) > popup.outerHeight()) {
						popup.outerHeight(rY + mY - y);
					}
				}
				if(/3|5|7/.test(resizeHandle) && (fX + mX - x + rX) < $(window).width()) {
					popup.css("width", "");
					if((rX + mX - x) > popup.outerWidth()) {
						popup.outerWidth(rX + mX - x);
					}
				}
			}
		};
		$(document).on("mousemove touchmove", onMouseMove);
		onMouseUp = function(e) {
			if(config["resizeable"]) {
				resizing = false;
				popupTitle.css("cursor", "");
				$("html").css("cursor", "");
			}
			if(config["draggable"]) {
				dragging = false;
				popupTitle.css("cursor", "move");
			}
			$(document).unbind(".disableSelection");
			$("[data-popup]").css("user-select", "");
		};
		$(document).on("mouseup touchend", onMouseUp);
		popupWrapper.on("mousedown touchstart", function() {
			if(config["draggable"]) {
				sortDepth();
			}
		});
		popupOverlay.on("click", function() {
			if(config["overlayClose"]) {
				close();
			}
		});
		$(document).on("keydown", function(e) {
			if(e.which == config["keyClose"] && popupWrapper.css("z-index") == maxDepth()) {
				close();
			}
		});
		popupResize.children("div").on("mousedown touchstart", function(e) {
			if(config["resizeable"]) {
				resizing = true;
				fY = popup.offset().top;
				fX = popup.offset().left;
				rY = popup.outerHeight();
				rX = popup.outerWidth();
				y = e.pageY || e.originalEvent.touches[0].pageY;
				x = e.pageX || e.originalEvent.touches[0].pageX;
				resizeHandle = $(this).index();
				popupTitle.css("cursor", $(this).css("cursor"));
				$("html").css("cursor", $(this).css("cursor"));
				$("[data-popup]").css("user-select", "none");
				$(document).bind("selectstart.disableSelection", function(e) {e.preventDefault();});
			}
		});	
		return r.progress(f);
	};
	this.show = function() {
		open();
		return this;
	};
	this.close = function() {
		close();
		return this;
	};
	this.hide = function() {
		hide();
		return this;
	};
	this.addClass = function(fClass) {
		popupWrapper.addClass(fClass);
		return this;
	};
	this.removeClass = function(fClass) {
		popupWrapper.removeClass(fClass);
		return this;
	};
	this.title = function(fTitle) {
		if(fTitle == undefined) {
			return config["title"];
		} else {
			popupTitle.html(config["fTitle"]);
			config["title"] = fTitle;
			return this;
		}
	};
	this.content = function(fContent) {
		if(fContent == undefined) {
			return config["content"];
		} else {
			popupContent.html(config["fContent"]);
			config["content"] = fContent;
			return this;
		}
	};
	this.buttons = function(fButtons) {
		if(fButtons == undefined) {
			return config["buttons"];
		} else {
			config["buttons"] = fButtons;
			popupButtons.html(getButtons());
			setButtons()
			return this;
		}
	};
	this.overlay = function(fOverlay) {
		if(fOverlay == undefined) {
			return config["overlay"];
		} else {
			config["overlay"] = fOverlay ? true:false;
			setOverlay();
			return this;
		}
	};
	this.draggable = function(fDraggable) {
		if(fDraggable == undefined) {
			return config["draggable"];
		} else {
			config["draggable"] = fDraggable ? true:false;
			setDraggable();
			return this;
		}
	};
	this.resizeable = function(fResizeable) {
		if(fResizeable == undefined) {
			return config["resizeable"];
		} else {
			config["resizeable"] = fResizeable ? true:false;
			setResizeable();
			return this;
		}
	};
	this.closeButton = function(fCloseButton) {
		if(fCloseButton == undefined) {
			return config["closeButton"];
		} else {
			config["closebutton"] = fCloseButton ? true:false;
			setCloseButton();
			return this;
		}
	}
	this.popupClass = function(fClass) {
		if(fClass == undefined) {
			return config["popupClass"];
		} else {
			popup.removeClass(config["popupClass"]).addClass(fClass);
			config["popupClass"] = fClass;
			return this;
		}
	};
	this.wrapperClass = function(fClass) {
		if(fClass == undefined) {
			return config["wrapperClass"];
		} else {
			popupWrapper.removeClass(config["wrapperClass"]).addClass(fClass);
			config["wrapperClass"] = fClass;
			return this;
		}
	};
	this.overlayClass = function(fClass) {
		if(fClass == undefined) {
			return config["overlayClass"];
		} else {
			popupOverlay.removeClass(config["overlayClass"]).addClass(fClass);
			config["overlayClass"] = fClass;
			return this;
		}
	};
	this.titleClass = function(fClass) {
		if(fClass == undefined) {
			return config["titleClass"];
		} else {
			popupTitle.removeClass(config["titleClass"]).addClass(fClass);
			config["titleClass"] = fClass;
			return this;
		}
	};
	this.contentClass = function(fClass) {
		if(fClass == undefined) {
			return config["contentClass"];
		} else {
			popupContent.removeClass(config["contentClass"]).addClass(fClass);
			config["contentClass"] = fClass;
			return this;
		}
	};
	this.buttonsClass = function(fClass) {
		if(fClass == undefined) {
			return config["buttonsClass"];
		} else {
			popupButtons.removeClass(config["buttonsClass"]).addClass(fClass);
			config["buttonsClass"] = fClass;
			return this;
		}
	};
	this.overflowXClass = function(fClass) {
		if(fClass == undefined) {
			return config["overflowXClass"];
		} else {
			popupWrapper.removeClass(config["overflowXClass"]).addClass(fClass);
			config["overflowXClass"] = fClass;
			return this;
		}
	};
	this.overflowYClass = function(fClass) {
		if(fClass == undefined) {
			return config["overflowYClass"];
		} else {
			popupWrapper.removeClass(config["overflowYClass"]).addClass(fClass);
			config["overflowYClass"] = fClass;
			return this;
		}
	};
	this.scrollTopClass = function(fClass) {
		if(fClass == undefined) {
			return config["scrollTopClass"];
		} else {
			popupWrapper.removeClass(config["scrollTopClass"]).addClass(fClass);
			config["scrollTopClass"] = fClass;
			return this;
		}
	};
	this.scrollBottomClass = function(fClass) {
		if(fClass == undefined) {
			return config["scrollBottomClass"];
		} else {
			popupWrapper.removeClass(config["scrollBottomClass"]).addClass(fClass);
			config["scrollBottomClass"] = fClass;
			return this;
		}
	};
	this.closeButtonClass = function(fClass) {
		if(fClass == undefined) {
			return config["closeButtonClass"];
		} else {
			popupClose.removeClass(config["closeButtonClass"]).addClass(fClass);
			config["closeButtonClass"] = fClass;
			return this;
		}
	};
	this.closeButtonContent = function(fCloseButtonContent) {
		if(fCloseButtonHTML == undefined) {
			return config["closeButtonContent"];
		} else {
			popupClose.html(closeButtonContent);
			config["closeButtonContent"] = fCloseButtonContent;
			return this;
		}
	};
	this.speed = function(fSpeed) {
		if(fSpeed == undefined) {
			return config["speed"];
		} else {
			config["speed"] = fSpeed;
			return this;
		}
	};
	this.position = function(fPosition) {
		if(fPosition == undefined) {
			return config["position"];
		} else {
			popupWrapper.removeAttr("data-position").attr("data-position", fPosition);
			config["position"] = fPosition;
			config["offset"]["y"] = 0;
			config["offset"]["x"] = 0;
			setPosition();
			setPosition();
			return this;
		}
	};
	this.offset = function(fOffset) {
		if(fOffset == undefined) {
			return getOffset();
		} else {
			var offsetY = fOffset["y"] == undefined ? 0:fOffset["y"];
			var offsetX = fOffset["x"] == undefined ? 0:fOffset["x"];
			setOffset(offsetX, offsetY);
			return this;
		}
	};
	this.overlayClose = function(fOverlayClose) {
		if(fOverlayClose == undefined) {
			return config["overlayClose"];
		} else {
			config["overlayClose"] = fOverlayClose ? true:false;
			return this;
		}
	};
	this.stickToBottom = function(fStickToBottom) {
		if(fStickToBottom == undefined) {
			return config["stickToBottom"];
		} else {
			config["stickToBottom"] = fStickToBottom ? true:false;
			config["offset"]["y"] = 0;
			config["offset"]["x"] = 0;
			setPosition();
			setPosition();
		}
	}
	this.keyClose = function(fKeyClose) {
		if(fKeyClose == undefined) {
			return config["keyClose"];
		} else {
			config["keyClose"] = fKeyClose ? fKeyClose:false;
		}
	}
	this.clone = function(fClone) {
		config["offset"] = getOffset();
		return new jPopup(config);
	}
	this.popupWrapper = function() {
		return popupWrapper;
	}
	this.popupOverlay = function() {
		return popupOverlay;
	}
	this.popup = function() {
		return popup;
	}
	this.popupTitle = function() {
		return popupTitle;
	}
	this.popupContent = function() {
		return popupContent;
	}
	this.popupButtons = function() {
		return popupButtons;
	}
	this.popupClose = function() {
		return popupClose;
	}
}
