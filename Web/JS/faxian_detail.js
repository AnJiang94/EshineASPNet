G.util.post = function(url, data, okfn) {
	G.util.post.pIndex = (G.util.post.pIndex || 0) + 1;

	var iframe = $('<iframe name="pIframe_' + G.util.post.pIndex + '" src="about:blank" style="display:none" width="0" height="0" scrolling="no" allowtransparency="true" frameborder="0"></iframe>').appendTo($(document.body));
	var ipts = [];

	$.each(data, function(k, v) {
		ipts.push('<input type="hidden" name="' + k + '" value="" />');
	});

	if (!/(\?|&(amp;)?)fmt=[^0 &]+/.test(url)) {
		url += (url.indexOf('?') > 0 ? '&' : '?') + 'fmt=1';
	}

	var form = $('<form action="' + url + '" method="post" target="pIframe_' + G.util.post.pIndex + '">' + ipts.join('') + '</form>').appendTo( $(document.body)) ;

	$.each(data, function(k, v) {
		form.children('[name=' + k + ']').val(v);
	});

	iframe[0].callback = function(o) {
		if (typeof okfn == 'function') okfn(o);
		$(this).src = 'about:blank';
		$(this).remove();
		form.remove();
		iframe = form = null;
	};

	if ($.browser.msie && $.browser.version == 6.0) {
		iframe[0].pIndex = G.util.post.pIndex;
		iframe[0].ie6callback = function() {
			form.target = 'pIframe_' + this.pIndex;
			form.submit();
		};
		iframe[0].src = location.protocol + '//st.' + G.domain + '/static_v1/htm/ie6post.htm';
	}
	else {
		form.submit();
	}
};

/**
 * icson��ģ�崦��
 * @author myforchen
 */
G.ui.template = {
	/**
	 * ʹ��idΪtpl��Ԫ��������Ϊģ�壬o��Ϊ���ݣ������idΪbed��Ԫ��
	 * ģ�����ݸ�ʽ��
	 * &lt;!--something&lt;@list@&gt;listcontent&lt;@_list@&gt;somethingelse--&gt;
	 * @param {String} bedId ģ������Ԫ��ID, false��ֱ�ӷ���ֵ
	 * @param {Object} o ������������
	 * @param {String} tplId ����ģ���Ԫ��ID�������falseģ�����ݾ�ֱ��ʹ��TPL���������û��ָ��tplId����bedId + '_tpl'
	 * @param {String} TPL ģ������
	 * @param {Boolean} isReturn �Ƿ���Ϊ�ַ�������
	 */
	fillWithTPL: function(bedId, o, tplId, TPL, isReturn) {
		if (!o) return;
		if (!tplId && tplId !== false) tplId = bedId + '_tpl';
		TPL = (tplId === false) ? (TPL || '') : $('#' + tplId).html().replace(/^\s*<!--/, "").replace(/-->\s*$/, "");

		var BLOCKS = {};
		TPL = TPL.replace(/<@([0-9a-zA-Z_-]+)@>((.|\s)*?)<@_\1@>/g, function(a0, a1, a2) {
			BLOCKS[a1] = a2;
			return '[#' + a1 + '#]';
		});
		$.each(BLOCKS, function(key, tpl) {
			var ot = [],
				p = o[key];
			if (p) {
				$.each(p, function(pp, tt) {
					ot.push(G.ui.template.fillWithTPL(false, tt, false, tpl.replace(/<_index_>/g, pp - 0 + 1)));
				});
			}

			BLOCKS[key] = ot.join('');
		});

		var htm = TPL.replace(/\{([0-9a-zA-Z_-]+)\}/g, function(a0, a1) {
			return o[a1] !== undefined ? o[a1] : '';
		}).replace(/\[#([0-9a-zA-Z_-]+)#\]/g, function(a0, a1) {
			return BLOCKS[a1] !== undefined ? BLOCKS[a1] : a1;
		}).replace(/^\s+/, '');

		if (isReturn || bedId === false) {
			return htm;
		} else {
			$('#' + bedId).html(htm);
		}
	}
};

/**
 * �������
 * �涨����ͨԪ�ص����zIndexΪ1099��ȫ��ģ̬���iframe��zIndexΪ1100��divΪ1101��������ľ�����1101
 * @param {Object} o ���ݵĲ���
 */
G.ui.modal = (function(){
	var fullModal = null;
	return {
		create	: function(obj, fixed){
			var ifr = null;
			if(!obj){
				ifr = fullModal && fullModal.length > 0 ? fullModal : $('<iframe src="javascript:void(0)"></iframe>').css({
					opacity	: 0,
					background	: '#000',
					left	: '0',
					display	: 'none',
					zIndex	: 1100,
					top	: '0',
					position	: 'absolute'
				});

				ifr.css({
					width	: $(window).width() + 'px',
					height	: $(window).height() + 'px'
				});

				ifr.appendTo($('body')).show();
				if(fixed){
					ifr.fixedPosition({
						fixedTo		: 'top',
						fixedTop	: 0,
						fixedLeft	: 0
					});
				} else {
					ifr.css({
						left	: $(window).scrollLeft(),
						top	: $(window).scrollTop()
					});
				}
			} else {
				ifr = $('<iframe style="z-index:-1;width:'+$(obj).innerWidth()+'px;height:'+$(obj).innerHeight()+'px" src="javascript:void(0)" frameborder="0" scrolling="no" width="100%" height="100%"></iframe>').css({
					opacity	: 0,
					background	: '#FFF',
					left	: '0',
					top	: '0',
					position	: 'absolute'
				});
				ifr.appendTo(obj);
			}

			return ifr;
		}
	};
})();

G.ui.popup = {
	_cssLoaded: false,
	_loadCss: function() {
		if (this._cssLoaded) return;
		this._cssLoaded = true;
		var cssFile = G.prefix.st + "static_v1/css/package/package_v1.css";
		if (G.prefix.ssl) {
			cssFile = G.prefix.st_ssl + "static_v1/css/package/package_v1.css";
		}
		var cssExists = false;
		$('link').each(function() {
			if ($(this).attr('href') == cssFile) {
				cssExists = true;
				return false;
			}
		});

		if (!cssExists) $('<link href="' + cssFile + '" rel="stylesheet" type="text/css" charset="utf-8" />').appendTo($('head'));
	},
	_zIndex: 1101,

	/**
	 * ����һ��������
	 * @param {Object} opt ��������
	 * @return {
	 * 	close	: function(){}, //�ر�
	 * 	show	: function(){}, // ��ʾ
	 * }
	 */
	create: function(opt) {
		this._loadCss();
		var _header = null,
			_content = null,
			_opt = opt || {},
			fixH = _opt.height > 50;

		_opt.width = _opt.width || 500;
		//_opt.fixed = false;
		_opt.fixed = _opt.fixed === false ? false : true;

		var o = $('<div style="box-shadow:2px 2px 4px rgba(0, 0, 0, 0.5);z-index:' + (++this._zIndex) + ';' + (fixH ? ('height:' + _opt.height + 'px') : '') + ';width:' + _opt.width + 'px;" class="layer_global">\
		<div class="layer_global_main">\
			<div class="layer_global_title">\
				<h3><span class="jian">&gt;</span>' + (_opt.title || '��ܰ��ʾ') + '<span></span></h3>\
				<button title="�ر�" ytag="84777"><span class="none">�w</span></button>\
			</div>\
			<div class="layer_global_cont layer_cont_15"></div>\
		</div>\
	</div>');

		o.appendTo($('body'));

		// ��λ
		if (_opt.fixed) {
			o.fixedPosition({
				fixedTo: 'top'
			});
		}

		_header = o.find('.layer_global_main .layer_global_title')[0];
		_content = o.find('.layer_global_main .layer_global_cont')[0];

		if (opt.contWidth == '30') $(_content).removeClass('layer_cont_15').addClass('layer_cont_30');

		function _createModal(obj) {
			o.mIframe = G.ui.modal.create(obj, o.ifFixedPosition());
		}

		function _setAtCenter(w, h) {
			if (null == w) w = o.width();
			if (null == h) h = o.height();
			var ww = $(window).width(),
				wh = $(window).height();

			var xw = (_opt.fullscreen && ww < w ? 0 : (ww / 2 - w / 2)),
				xh = (_opt.fullscreen && wh < h ? 0 : (wh / 2 - h / 2));
			if (o.ifFixedPosition()) {
				o.fixedPosition({
					fixedTo: 'top',
					fixedLeft: xw,
					fixedTop: xh
				});
			} else {
				o.css("left", $(window).scrollLeft() + xw + "px");
				o.css("top", $(window).scrollTop() + xh + "px");
			}

			if (_opt.fullscreen && !o.mDiv) {
				var div = $('<div></div>').css({
					opacity: 0.05,
					background: '#000',
					display: 'none',
					zIndex: 1101,
					width: $(window).width() + 'px',
					height: $(window).height() + 'px'
				}).appendTo('body');

				if (o.ifFixedPosition()) {
					div.fixedPosition({
						fixedTo: 'top',
						fixedLeft: 0,
						fixedTop: 0
					});
				} else {
					div.css({
						left: $(window).scrollLeft(),
						top: $(window).scrollTop(),
						position: 'absolute'
					});
				}

				div.show();

				if (!o.ifFixedPosition()) {
					if ($.browser.msie) {
						$("html").css({
							'overflow': "hidden"
						});
					} else {
						$("body").css({
							'overflow': "hidden"
						});
					}
				}
				o.mDiv = div;
			}

			if ($.browser.msie && $.browser.version >= 6.0 && !o.mIframe) {
				_createModal(_opt.fullscreen ? null : o);
			}
		}

		function _close(triggerDefaultAction) {
			if (_opt.fullscreen && o.mDiv) { // ȫ��ģʽ����ģ̬��
				o.mDiv.remove();
				o.mDiv = null;
				if (o.mIframe) {
					o.mIframe.remove();
					o.mIframe = null;
				}

				if (!o.ifFixedPosition()) {
					if ($.browser.msie) {
						$('html').css({
							'overflow': 'scroll',
							'overflow-x': 'hidden'
						});
					} else {
						$('body').css({
							'overflow': 'scroll',
							'overflow-x': 'hidden'
						});
					}
				}
			}

			if (triggerDefaultAction !== false && $.isFunction(_opt.closeFn)) _opt.closeFn.apply(null);

			o.hide();
		}

		$(_header).children('button').click(_close);

		!_opt.disableDrag && G.ui.drag.enable(o.get(0), _header, {
			fixed: o.ifFixedPosition()
		});
		if (fixH) _setAtCenter(_opt.width, fixH ? _opt.height : 300);
		else _close(); // Ĭ������

		return {
			onclose: function(closeFn) {
				_opt.closeFn = closeFn;
			},
			close: _close,
			hide: _close,
			show: function() {
				//o.fadeIn(100);
				o.show();
				_setAtCenter();
			},
			paint: function(uFunc) {
				if (!$.isFunction(uFunc)) return;

				var cbObj = {
					header: _header,
					content: _content
				};

				return uFunc.apply(o, [cbObj]);
			},
			setAtCenter: _setAtCenter,
			resize: function(newSize) {
				if (!$.isPlainObject(newSize)) return;
				if (newSize.width) o.css('width', newSize.width + 'px');
				if (newSize.height > 50) {
					o.css('height', newSize.height + 'px');
					$(_content).height(newSize.height - 50);
				}

				_setAtCenter();
			},
			resizeNoCenter: function(newSize) {
				if (!$.isPlainObject(newSize)) return;
				if (newSize.width) o.css('width', newSize.width + 'px');
				if (newSize.height > 50) {
					o.css('height', newSize.height + 'px');
					$(_content).height(newSize.height - 50);
				}

			}
		};
	},
	_msgPopup: null,
	showMsg: function(msg) {
		var args = arguments,
			opt = args[1] || {};
		if ($.type(opt) != 'object') {
			// ����map
			opt = {};
			$.each({
				1: 'type',
				2: 'okFn',
				3: 'closeFn',
				4: 'cancelFn',
				5: 'okText',
				6: 'cancelText'
			}, function(k, v) {
				if (args[k] != null) opt[v] = args[k];
			});

			if (opt.okText && opt.cancelText) opt.btns = 3;
		}

		if (!this._msgPopup) {
			this._msgPopup = G.ui.popup.create({
				title: '��ʾ',
				width: 500,
				height: 170,
				fullscreen: 1
			});
		}

		var levels = {
			//0	: 'info',
			1: 'warn',
			2: 'error',
			3: 'right' //,

			//4	: 'help'
		};
		if (!(opt.type in levels)) opt.type = 1;

		if (!$.isArray(msg)) {
			msg = [msg];
		}

		opt.btns = opt.btns || 1;
		this._msgPopup.paint((function(_) {
			return function(uObj) {
				$(uObj.content).empty().html(' <div class="layer_global_mod">\
	<b class="icon icon_msg4 icon_msg4_' + levels[opt.type] + '"></b>' + (msg.length >= 1 ? ('<h4 class="layer_global_tit">' + msg[0] + '</h4>') : '') + '\
	' + (msg.length >= 2 ? ('<p>' + msg[1] + '</p>') : '') + (msg.slice(2, msg.length).join('')) + '\
	<div class="wrap_btn"><a class="btn_strong" href="#" onclick="return false">' + (opt.okText || 'ȷ��') + '</a> <a class="btn_common" href="#" onclick="return false">' + (opt.cancelText || 'ȡ��') + '</a></div>\
	</div>');

				$(".wrap_btn .btn_strong", uObj.content).click(function() {
					var kill = true;
					if ($.isFunction(opt.okFn)) {
						kill = opt.okFn() !== false;
					}
					if (kill) _.hide(false);
				})[(opt.btns & 1) ? 'show' : 'hide']();

				$(".wrap_btn .btn_common", uObj.content).click(function() {
					var kill = true;
					if ($.isFunction(opt.cancelFn)) {
						kill = opt.cancelFn() !== false;
					}
					if (kill) _.hide(false);
				})[(opt.btns & 2) ? 'show' : 'hide']();

				_.show();
			};
		})(this._msgPopup));

		// setting pop close callback function
		this._msgPopup.onclose($.isFunction(opt.closeFn) ? opt.closeFn : $.noop);
		return this._msgPopup;
	}
};

(function($) {
	var __fixed = {},
		__fixedId = 0,
		__supportsPositionFixed = null,
		supportsPositionFixed = function() {
			if (__supportsPositionFixed === null) {
				var dom = $('<span id="supportsPositionFixed" style="position:fixed;width:1px;height:1px;top:25px;"></span>').appendTo($('body'));
				var offset = dom.offset();
				dom.remove();
				__supportsPositionFixed = (offset.top - $(window).scrollTop()) === 25;
			}
			return Boolean(__supportsPositionFixed);
		},
		__fixCss = false,
		fixCss = function() {
			if (__fixCss !== false) return;
			var _body = $("body");
			var url = "http://st.icson.com/static_v1/img/blank.gif";
			if (G.prefix.ssl) {
				url = G.prefix.st_ssl + "/static_v1/img/blank.gif";
			}
			if ((_body.css("background-image")) == "none") {
				_body.css({
					"background-image": "url(" + url + ")",
					"background-attachment": "fixed"
				});
			} else {
				_body.css("background-attachment", "fixed");
			}
			__fixCss = true;
		};

	$.fn.ifFixedPosition = function() {
		if (!this.attr("id") || this.attr("id").length == 0) return false;
		return !!__fixed[this.attr("id")];
	};
	$.fn.fixedPosition = function(options) {
		var defaults = {
			fixedTo: "bottom",
			fixedTop: 0,
			fixedBottom: 0,
			fixedLeft: false,
			effect: false,
			effectSpeed: 1000
		};

		//var _body = $("body");
		var options = $.extend(defaults, options);

		return this.each(function() {
			var fb = $(this);
			if (!fb.attr("id") || fb.attr("id").length == 0) fb.attr("id", "positionFixedID" + (__fixedId++));
			if (!supportsPositionFixed()) {
				fixCss();
				var expr = "";
				if (options.fixedTo == "top") {
					expr = '$(document).scrollTop()';
					if (options.fixedTop > 0) {
						expr += '+' + options.fixedTop;
					}
				} else {
					expr = '$(document).scrollTop() - $("#' + fb.attr("id") + '").outerHeight() + (document.documentElement.clientHeight || document.body.clientHeight)';
					if (options.fixedBottom > 0) {
						expr += '-' + options.fixedBottom;
					}
				}

				fb.css('position', 'absolute');
				if (fb.length > 0 && fb[0].style && fb[0].style.setExpression) fb[0].style.setExpression('top', 'eval(' + expr + ')');
				else fb.css('top', (options.fixedTop || 0) + 'px');
				if (options.fixedLeft !== false) {
					fb.css('left', $(document).scrollLeft() + (options.fixedLeft - 0) + 'px');
				}
			} else {
				fb.css('position', 'fixed');
				if (options.fixedTo == "top") {
					fb.css('top', (options.fixedTop || 0) + 'px');
				} else {
					fb.css('bottom', (options.fixedBottom || 0) + 'px');
				}
				if (options.fixedLeft !== false) {
					fb.css('left', options.fixedLeft + 'px');
				}
			}

			__fixed[$(this).attr("id")] = 1;
			if (options.effect) {
				switch (options.effect) {
				case "fadeIn":
					fb.hide().fadeIn(options.effectSpeed);
					break;
				case "slideDown":
					fb.hide().slideDown(options.effectSpeed);
					break;
				}
			}
		});
	};
})(jQuery);

/**
 *
 */
G.ui.drag = (function() {
	// ��ǰ��קԪ��
	var _curEle = null;
	// ��Ӧ��ק��Ԫ��
	var _curEleLauncher = null;
	// ��ʼ������
	var _x = 0;
	// ��ʼ������
	var _y = 0;
	// ��ǰ������
	var _cx = false;
	// ��ǰ������
	var _cy = false;
	// ��������
	var _opt = {};

	/**
	 * �ƶ��е��¼�
	 * @param {Event} e �������¼�
	 */
	function _moving(e) {
		e.stopPropagation();
		e.preventDefault();
		if (!_curEle || !_curEleLauncher) return;
		var sl = $(window).scrollLeft();
		var st = $(window).scrollTop();
		var x = _x + e.clientX + sl;
		var y = _y + e.clientY + st;
		// �����ڿɼ�������
		x = Math.min(Math.max(x, sl), $(window).width() - $(_curEle).outerWidth() + sl);
		y = Math.min(Math.max(y, st), $(window).height() - $(_curEle).outerHeight() + st);

		if (x < 0) x = 0;
		if (y < 0) y = 0;

		if ($(_curEle).css('position') == 'fixed') {
			$(_curEle).offset({
				left: x,
				top: y
			});
		} else {
			$(_curEle).offset({
				left: x,
				top: y
			});
		}
		_cx = x;
		_cy = y;
	}

	function _start(e) {
		e.stopPropagation();
		e.preventDefault();
		if (!_curEle || !_curEleLauncher) return;
		var sl = $(window).scrollLeft();
		var st = $(window).scrollTop();
		_x = _curEle.offsetLeft - e.clientX - sl;
		_y = _curEle.offsetTop - e.clientY - st;
		if ($(_curEle).css('position') == 'fixed') {
			_x += sl;
			_y += st;
		}

		_cx = false;
		_cy = false;

		var d = _curEleLauncher && _curEleLauncher.setCapture ? _curEleLauncher : document;
		$(d).bind('mousemove.moving', _moving).bind('mouseup.stop', _stop);
		setEventCapture(d);
	}

	function _stop(e) {
		if (!_curEleLauncher) return;

		var d = _curEleLauncher && _curEleLauncher.setCapture ? _curEleLauncher : document;
		$(d).unbind('mousemove.moving');
		$(d).unbind('mouseup.stop');

		if (typeof _opt.onstop == 'function') _opt.onstop.apply(_curEleLauncher);
		if (_opt.fixed && _cx !== false && _cy !== false) {
			var sl = $(window).scrollLeft();
			var st = $(window).scrollTop();
			$(_curEle).fixedPosition({
				fixedTo: 'top',
				fixedTop: _cy < st ? 0 : (_cy - st),
				fixedLeft: _cx < sl ? 0 : (_cx - sl)
			});
		}
		_curEle = null;
		_curEleLauncher = null;
		_x = 0;
		_y = 0;
		releaseEventCapture(d);
	}

	// �����¼�����
	function setEventCapture(target) {
		if (target.setCapture) target.setCapture();
		else if (window.captureEvents || document.captureEvents)(window.captureEvents || document.captureEvents)(Event.MouseMove | Event.MouseUp);
	}

	// �ͷ��¼�����
	function releaseEventCapture(target) {
		if (target.releaseCapture) target.releaseCapture();
		else if (window.releaseEvents || document.releaseEvents)(window.releaseEvents || document.releaseEvents)(Event.MouseMove | Event.MouseUp);
	}

	return {
		enable: function(e, el, opt) {
			if (typeof el == 'string') el = $('#' + el).get(0);
			if (typeof e == 'string') {
				if (!el) el = $('#' + e + '_head').get(0);
				e = $('#' + e).get(0);
			}
			if (!e || !el) return;
			_opt = opt || {};
			$(el).mousedown(function(ee) {
				_curEle = e;
				_curEleLauncher = el;
				_start(ee);
			});
		}
	};
})();

G.ui.droplist = {
	attach: function() {
		// ...
	}
};


G.app.faxian_detail = {
	like: 0, //�Ƿ����� ��ϲ��
	likepid: [],
	appointid: 0, // �������id
	appointinitcount: 0,

	loadscript: function(url, callback) {
		url = url + '&t=' + Math.random();
		var script = document.createElement('script');
		script.type = 'text/javascript';
		if (callback) script.onload = script.onreadystatechange = function() {
			if (script.readyState && script.readyState != 'loaded' && script.readyState != 'complete') return;
			script.onreadystatechange = script.onload = null;
			callback();
		};
		script.src = url;
		document.getElementsByTagName('head')[0].appendChild(script);
	},

	centershow: function(j_centerdiv) {
		var _scrollHeight = $(document).scrollTop(),
			//��ȡ��ǰ���ھ���ҳ�涥���߶�
			_windowHeight = $(window).height(),
			//��ȡ��ǰ���ڸ߶�
			_windowWidth = $(window).width(),
			//��ȡ��ǰ���ڿ��
			_popupHeight = j_centerdiv.height(),
			//��ȡ������߶�
			_popupWeight = j_centerdiv.width(); //��ȡ��������
		_posiTop = (_windowHeight - _popupHeight) / 2 + _scrollHeight;
		_posiLeft = (_windowWidth - _popupWeight) / 2;

		j_centerdiv.css("left", _posiLeft + "px").css("top", _posiTop + "px");
		j_centerdiv.css("display", "");
	},

	init: function() {
		var self = this;
		self.pid = pid;
		self.review.getReviewsPage(); //��ȡ��ҳ��������ȡ��һҳ����

		//���޵Ĵ���������
		var $ding_html = $('#ding_html');
		$('.new_mod_action').each(function() {
			$(this).find('.new_mod_action_item').eq(0).html( $ding_html.html() ).show();
		});
		$ding_html.html("");

		//������
		var _ptimer = 0,
			$popshare = $('div.new_mod_popshare');
		$('a.new_mod_action_share').mouseover(function() {
			$popshare.addClass('show');
		});
		$popshare.mouseout(function() {
			$(this).removeClass('show');
			clearTimeout(_ptimer);
		});
		$('li.share_leave').bind({
			mouseover: function() {
				clearTimeout(_ptimer);
				$popshare.show().addClass('show');
			},
			mouseout: function() {
				_ptimer = setTimeout(function() {
					$popshare.hide().removeClass('show');
				}, 100)
			}
		});
		
		// ������������
		G.app.Component.getAppointCount(self.appointid, function(data){
			$('.fx_mod_goods_setting .fx_tx1').html(G.app.faxian_detail.appointinitcount + parseInt(data));
			$('.fx_mod_goods_setting').show();
		});
		$('.set_remind').click(function(){
			if (!G.logic.login.getLoginUid()) {
				G.ui.popup.showMsg("�Բ�������δ��¼�����¼�����������ѣ�", 1, function(){location.href = 'https://base.yixun.com/login.html?url='+encodeURIComponent(location.href);},function(){},null,'���ϵ�¼','ȡ��');
				return false;
			}
			var html = '<div class="layer_global_mod appoint_dialog_content mod_pop_ico">\
				<b class="icon icon_msg4 icon_msg4_right"></b>\
				<div class="appoint_form">\
					<div class="appoint_form_row mod_pop_con">\
						<h4 style="width:300px;">�����������ֻ��ţ����ǻ��ڿ���ǰ��һʱ�������������</h4>\
						<div class="fx_pop_cont" style="margin-bottom:0;">\
							<span>*</span>\
							<label class="appoint_form_label">�ֻ����룺<input type="text" name="tel_num" class="appoint_form_input fx_pop_input"></label>\
							<br><strong class="appoint_form_error">��������ȷ���ֻ���(11λ����)</strong>\
						</div>\
					</div>\
				</div>\
				<div class="wrap_btn appoint_btn_pannel">\
					<a href="#" onclick="return false;" class="btn_strong appoint_btn appoint_btn_ok">ȷ��</a>\
					<a href="#" onclick="return false;" class="btn_common appoint_btn appoint_btn_cancel">�ر�</a>\
				</div>\
			</div>';
			var _dialog = G.ui.popup.create({title: "��ʾ", width: 500, height: 220, fullscreen: 1});
			_dialog.paint((function (i) {
		        return function (p) {
		            var n = $(p.content);
		            n.empty().html(html);
		            _dialogId = n.parents(".layer_global").attr("id");
		            
		            G.logic.login.getLoginUser(function(o){
		            	if (o.data && o.data.mobile) {
		            		$("#" + _dialogId + " .appoint_form_input").val(o.data.mobile);
		            	}
					});
		            
		            $("#" + _dialogId + " .appoint_btn_ok").click(function () {
		                $("#" + _dialogId + " .appoint_form_error").html("");
		                var s = $("#" + _dialogId + " .appoint_form input[name=tel_num]").val();
						if (/^[0-9]+$/.test(s) && s.length == 11) {
							_dialog.close();
						    G.app.Component.appoint(G.app.faxian_detail.appointid, {phone: s}, function(){
						    	G.ui.popup._msgPopup = G.ui.popup.create({
									title: '��ʾ',
									width: 530,
									height: 170,
									fullscreen: 1
								});
						        G.ui.popup.showMsg("��ϲ�������ѳɹ��������ѣ���л������Ѹ����֧�֣�", 3, null,function(){},null,null,'ȷ��');
						        $('.wrap_btn').append('<a href="http://faxian.yixun.com" target="_blank" class="btn_strong" onclick="G.ui.popup._msgPopup.close();">ȥ������ҳ</a>');
						        G.app.Component.getAppointCount(G.app.faxian_detail.appointid, function(data){
						        	$('.fx_mod_goods_setting .fx_tx1').html(G.app.faxian_detail.appointinitcount + parseInt(data));
								});
						    }, function(errno, errmsg){
								if (errno == 3 || errno == 1007) {//δ��¼
									G.ui.popup.showMsg("�Բ�������δ��¼�����¼�����������ѣ�", 1, function(){location.href = 'https://base.yixun.com/login.html?url='+encodeURIComponent(location.href);},function(){},null,'���ϵ�¼','ȡ��');
						        } else if (errno == 1503) {
						        	G.ui.popup.showMsg("�Բ������Ѿ����ù����ѣ���ӭ��ע������Ʒ��", 1, null,function(){},null,'ȷ��');
						        	$('.wrap_btn').append('<a href="http://faxian.yixun.com" target="_blank" class="btn_strong" onclick="G.ui.popup._msgPopup.close();">ȥ������ҳ</a>');
						        } else {
									G.ui.popup.showMsg(errmsg, 1, null,function(){},null,null,'ȷ��');
									$('.wrap_btn').append('<a href="http://faxian.yixun.com" target="_blank" class="btn_strong" onclick="G.ui.popup._msgPopup.close();">ȥ������ҳ</a>');
								}
						    }, 1);
		                } else {
		                	$("#" + _dialogId + " .appoint_form_error").text("��������ȷ���ֻ���(11λ����)");
		                	return;
		                }
		            });
		            $("#" + _dialogId + " .appoint_btn_cancel").click(function () {
		                _dialog.close();
		            });
		            i.close();
		        };
		    })(_dialog));
		    $("#" + _dialogId + " .appoint_form_error").html("");
		    _dialog.show();
		});
		
		//PM Ҫ�ײ�Ҳ��һ���ڵ�
		$('div.fx_content .ewm').before( $('div.fx_mod_goods').clone().addClass('art_goods') );

		$('a.new_ico_wb').click(function() { //#share_weibo
			var title = $('.fx_mod_goods_info h3 a ').eq(0).html(); //��Ʒ����
			var url = location.href;
			self.shareweibo(title, url);
			return false;
		});
		$('a.new_ico_qzone').click(function() { //#share_qzone
			var title = $('.fx_mod_goods_info h3 a ').eq(0).html(); //��Ʒ����
			var url = location.href;
			self.shareqzone(title, url);
			return false;
		});

		$('a[pid]').each(function(k, v) {
			var pid = $(v).attr("pid");

			if (pid && (0 != pid)) {
				self.loadscript("http://faxian.yixun.com/json.php?mod=deservebuy&act=get&pid=" + pid + "&jsonstr=str&callback=G.app.faxian_detail.cbget");
			}
		});

		//��
		$('.new_mod_action_ding').click(function() {
			var pid = $(this).attr("pid");
			if ($.inArray((pid + "-1"), self.likepid) < 0) {
				$(this).addClass('new_mod_action_ding_on');
				self.loadscript("http://faxian.yixun.com/json.php?mod=deservebuy&act=addone&pid=" + pid + "&type=like&callback=G.app.faxian_detail.cbaddone");
			}
			return false;
		});

		//������֤��
		$('#vcode >img').click(function(e) {
			self.review.toChangeReviewReplyVCode(e);
			return false;
		});

		$('textarea[name=content]').keyup(function() {
			var c = $.trim( $(this).val() ),
				$num = $('.num >span');

			$num.html(c.length);
			if (c.length > 80) {
				$num.addClass('strong');
			}
			else {
				$num.removeClass('strong');
			}
		});

		$('#dis_submit').hide(); //û�е�¼������
		G.logic.login.getLoginUser(function(o) {
			if ((o === false) || (!o.data)) {
				//G.ui.popup.showMsg('����û�е�¼');
				$('.fx_talk_link').attr('href', 'https://base.yixun.com/login.html?url=' + location.href);
				return;
			}
			else if (o && o.data && (o.data.bindMobile == 0)) { //δ��֤�ֻ�
				var _msg = '<h4 class="layer_global_tit">�������ֻ���֤�ſ��Է���ظ���</h4><p class="todo_link"><a class="tit" href="http://base.yixun.com/myprofile.html" target="_blank">���ڽ�����֤ҳ��&gt;&gt;</a></p><br/>';

				$('.fx_talk_link').html('���Ȱ��ֻ�').attr({
					target: "_blank",
					href: 'https://base.yixun.com/myprofile.html'
				}).click(function() {
					var dialog = G.ui.popup.showMsg(_msg, 1, function() {
						G.logic.login.getLoginUser(function(a) {
							if (a && a.data && (a.data.bindMobile == 1)) {
								dialog.close();
								$('.fx_talk_link').css("display", "none");
								$('#dis_submit').show(); //��ʾ�����
							}
							else {
								dialog.close();
								//a.data.uid='';//������Ż������µ�
								G.logic.login._loginUser.data.uid = '';
								setTimeout(function() {
									dialog.show();
								}, 200);
							}
						}, false, true);

						return false;
					}, null, null, '�������֤', '�ر�');

					return false;
				});
			}
			else {
				G.app.icsonid = o.data.icsonid;
				$('.fx_talk_link').css("display", "none");
				$('#dis_submit').show(); //��ʾ�����
			}
		}, false, true);

		$('#dis_submit').click(function() { //���û�е�½�͵���� ����ť
			if (G.logic.login.ifLogin(this, arguments) === false) return false;

			var uid = G.logic.login.getLoginUid(),
				vCodeInput = $('#vcode_input'),
				codeNum = vCodeInput.val(), /* �����֤�� */
				content = $.trim($('textarea[name=content]').val());
			if (content.length <= 0) {
				G.ui.popup.showMsg('����д�������ݣ�');
				return false;
			}
			if (content.length < 5 || content.length > 80) {
				G.ui.popup.showMsg('������������5~80����֮�䣡');
				return false;
			}
			if (codeNum.length <= 0) {
				G.ui.popup.showMsg('����д��֤�룡');
				return false;
			}

			var data = {
				pid: pid,
				content: content,
				codeNum: codeNum
			};

			var nc = '';
			if (nc.length > 0) {
				data['nick'] = nc.val();
			} //if

			var plUrl = G.util.token.addToken('http://pinglun.yixun.com/json.php?mod=review&act=adddiscussion&uid=' + uid,'jq');
			G.util.post(plUrl, data, function(o) {
				//G.app.review.loading.close();
				if (o && o.errno == 0) {
					self.review.clear();
					self.review.getReviewsPage(); //��ȡ��ҳ��������ȡ��һҳ����
					$('textarea[name=content]').val(''); //�������
					G.ui.popup.showMsg('���ѷ���ɹ�!'); //�ύ������и�����ʾ�������ѷ���ɹ���
				}
				else if (o && o.errno == 14) {
					G.ui.popup.showMsg('��֤�����!');
					return false;
				}
				else {
					var em = {
						12: '���ݹ�������ɾ���������ݺ����',
						14: '����д�ǳ�',
						777: '������������ݿ��ܰ���������Ϣ�����ǻᾡ����ˣ�������Ա���ͨ�������۽���ʾ��ҳ���С�',
						600: '���ķ���Ƶ�ʹ��죬���Ժ��ٷ���',
						602: '���ľ���ֵ���㣬�޷��������ۣ������κ���������������ѯ',
						776: '��������������к��в�ǡ������Ϣ���������������ٷ���'
					};
					if (o && (o.errno - 0) in em) {
						return G.ui.popup.showMsg(em[o.errno]);
					}
					G.ui.popup.showMsg('��Ǹ����������ʧ�ܣ�');
				}
			});
			$('#vcode_input').val(''); //������������֤�����

			//������֤��
			plUrl = G.util.token.addToken('http://pinglun.yixun.com/json.php?jsontype=str&mod=review&act=vcode&_=' + Math.random(),'jq');
			$('.code_num img').attr('src', plUrl);

			return false;
		});

		//���� scroll ��
		var fx_top = $('div.fx_top');
		var $container = $('div.fx_container_inner'),
			win_height = $(window).height();
		var fx_header_pos = $('div.fx_header').offset();
		var $fix_btn = $('div.fx_fix');
		var scroll_top;
		$(window).scroll(function() {
			scroll_top = self.scrolltop();
			if (scroll_top > fx_top.offset().top && scroll_top < ($container.offset().top + $container.height() - win_height)) {
				$fix_btn.show();
			}
			else {
				$fix_btn.hide();
			}
		});

		//��Ʒͼ 160x160 �� 120x120
		//$('.fx_mod_goods_img >img').attr('src', $('.fx_mod_goods_img >img').attr('src').replace(/pic160/, 'small'));
		$('.fx_mod_goods_img >img').each(function(k, v) {
			$(this).attr('src', $(this).attr('src').replace(/pic160/, 'small'));
		});

		//ȥ�����м
		$('.fx_crumbs').hide();
		$('.fx_nav_inner li').eq(3).find('a').addClass('selected'); //����ѡ��̬

		//���������ʼ��
		G.footer.initBakTop();
	}, //init

	scrolltop: function() {
		var scrollTop = 0;
		if (document.documentElement && document.documentElement.scrollTop) {
			scrollTop = document.documentElement.scrollTop;
		}
		else if (document.body) {
			scrollTop = document.body.scrollTop;
		}
		return scrollTop;
	},

	cbget: function(data) {
		if (data.data && data.data.like) {
			$('a[pid]').find('.c_tx2').html(data.data.like);
		}
	},

	cbaddone: function(data) {
		if (0 == data.errcode) {
			var $nodes = $('a[pid]'),
				$bros = $nodes.next();
			$nodes.hide();
			$bros.find('.c_tx2').html(parseInt( $nodes.find('.c_tx2').html() ) + 1);
			$bros.show();

			if ($.inArray((data.pid + "-1"), G.app.faxian_detail.likepid) < 0) {
				G.app.faxian_detail.likepid.push(data.pid + "-1");
			}
		} //if
	},

	//����
	review: {
		data: {},
		currentpage: 1, //��ǰ����ҳ
		discussiontotal: 0, //������ҳ��
		_jhistory: {}, //ǰ�˱����ͶƱ����id

		//������֤��
		toChangeReviewReplyVCode: function(e) {
			var srcElement = $(e.srcElement || e.target);
			var plUrl = G.util.token.addToken('http://pinglun.yixun.com/json.php?jsontype=str&mod=review&act=vcode&_=' + Math.random(),'jq');
			srcElement.attr('src', plUrl);
			srcElement.parent().prevAll('#vcode_input').focus();
		},

		//���� paginator ����HTML
		paginator: function() {
			var self = this;
			if (self.discussiontotal == 0) {
				$('div.paginator').hide().html('').show();
				return false;
			}

			//else
			var const_num = 5;
			var html_ary = [],
				html_str='',
				dot_str = '<span>...</span>';
			var js_tpl = ' onclick="G.app.faxian_detail.review.getReviews(null, {page_holder}); return false;"',
				js_pre = js_tpl.replace(/{page_holder}/, 'G.app.faxian_detail.review.currentpage-1'),
				js_next = js_tpl.replace(/{page_holder}/, 'G.app.faxian_detail.review.currentpage+1');

			var js_page='';
			if (const_num >= self.discussiontotal) { //ֱ�ӳ���
				for(var _page=1; _page<=self.discussiontotal; _page++) {
					if (_page == self.currentpage) {
						html_ary.push('<span class="page-this">'+_page+'</span>'); //disable
					}
					else {
						js_page = js_tpl.replace(/{page_holder}/, _page);
						html_ary.push('<a href="javascript:;" '+ js_page +'>'+_page+'</a>');
					}
				}
			}
			else { //������λ��
				var dash_1 = false, dash_2 = false;
				for(var _page=1; _page<=self.discussiontotal; _page++) {
					if (_page == self.currentpage) {
						html_ary.push('<span class="page-this">'+_page+'</span>'); //disable
					}
					else { // <a>, '...', or nothing.
						if (self.currentpage <= 3) { //����
							if (_page < self.currentpage || _page <= 3 || _page == self.discussiontotal) {
								js_page = js_tpl.replace(/{page_holder}/, _page);
								html_ary.push('<a href="javascript:;" '+ js_page +'>'+_page+'</a>');
							}
							else {
								if (! dash_1) {
									html_ary.push( dot_str );
									dash_1 = true;
								}
							}
						}
						else if (self.currentpage >= (self.discussiontotal-2)) { //����
							if (_page == 1 || _page >= (self.discussiontotal-2) ) {
								js_page = js_tpl.replace(/{page_holder}/, _page);
								html_ary.push('<a href="javascript:;" '+ js_page +'>'+_page+'</a>');
							}
							else {
								if (! dash_1) {
									html_ary.push( dot_str );
									dash_1 = true;
								}
							}
						}
						else { //�м�
							if (_page == 1 || _page == self.discussiontotal || (_page >= (self.currentpage-1) && _page <= (self.currentpage+1))) {
								js_page = js_tpl.replace(/{page_holder}/, _page);
								html_ary.push('<a href="javascript:;" '+ js_page +'>'+_page+'</a>');
							}
							else {
								if (_page < self.currentpage) { //dash_1
									if (! dash_1) {
										html_ary.push( dot_str );
										dash_1 = true;
									}
								}
								else { //dash_2
									if (! dash_2) {
										html_ary.push( dot_str );
										dash_2 = true;
									}
								}
							}
						}
					}
				}
			}

			if (self.currentpage == 1) {
				html_ary.push('<span class="page-start">��һҳ</span>'); //disable
			}
			else {
				html_ary.push('<a href="javascript:;" class="page-pre" ' + js_pre + '>��һҳ</a>');
			}
			if (self.discussiontotal <= self.currentpage) {
				html_ary.push('<span class="page-end">��һҳ</span>'); //disable
			}
			else {
				html_ary.push('<a href="javascript:;" class="page-next" ' + js_next + '>��һҳ</a>');
			}

			html_str = html_ary.join('');
			$('div.paginator').hide().html(html_str).show();
		},

		//��ȡ��ҳ��
		getReviewsPage: function() {
			var self = this;
			var plUrl = G.util.token.addToken('http://pinglun.yixun.com/json1.php?mod=reviews&act=getproperty&jsontype=str&pid=' + G.app.faxian_detail.pid,'jq');
			$.get(plUrl, function(o) {
				//self._updateReviewStatus(o);
				if (o.discussion <= 0 || o.errno || o.errCode) {
					/* empty */
				}
				else {
					self.discussiontotal = Math.ceil(o.discussion / 5);
					self.getReviews('', 1); //��ȡ��һҳ����
				}
			}, 'jsonp');
		},

		//��ȡ����
		getReviews: function(type, curpage) {
			curpage = parseInt(curpage);
			if (isNaN(curpage) || curpage == 0) {
				curpage = 1;
			}

			var self = this;
			if (curpage in self.data) { //�������У�
				self._printReviews(self.data[ curpage ]);
				self.currentpage = curpage;
				self.paginator(); //paginator flush
				return;
			}

			//��Ϊcgi�ӿ�д����ÿ��ֻ����10��������ÿҳչʾ���������Ҫ�����ˡ�
			svr_page = parseInt((curpage + 1) / 2);
			if (!svr_page || svr_page < 1) {
				svr_page = 1;
			}

			var plUrl = G.util.token.addToken('http://pinglun.yixun.com/json1.php?mod=reviews&act=getreviews&jsontype=str&pid=' + G.app.faxian_detail.pid + '&type=discussion' + '&page=' + svr_page,'jq');
			$.get(plUrl, function(o) {
				if (o && !o.errno && !o.errCode) {
					//self._c.reviews = type;
					var page_1 = (svr_page * 2 - 1).toString(),
						page_2 = (svr_page * 2).toString();

					$.each(o, function(k, v) {
						if (k < 5) {
							if (! (page_1 in self.data)) {
								self.data[ page_1 ] = [];
							}
							self.data[ page_1 ].push(v);
						}
						else {
							if (! (page_2 in self.data)) {
								self.data[ page_2 ] = [];
							}
							self.data[ page_2 ].push(v);
						}
					});

					self._printReviews( self.data[ curpage ] );
					self.currentpage = curpage;
					self.paginator(); //paginator flush
				}
				else {
					$('#review_content').empty().html('������������ʧ��');
				}
			}, 'jsonp');

			$('#review_content').empty().html('<span class="loading_58_58">���ڼ�����</span>');
		},

		//��
		setLike: function() {
			var self = G.app.faxian_detail.review,
				rid = $(this).attr('rup');

			if (self._jhistory[rid] == 1) {
				G.ui.popup.showMsg('���Ѿ�Ͷ��Ʊ�ˡ�');
				return false;
			}
			self._judgeReview(rid, 4 /* ������4 rtype*/ , 1, $(this));
		},

		//����ͶƱ
		_judgeReview: function(rid, rtype, option, btnTarget) {
			var self = G.app.faxian_detail.review;
			if (G.logic.login.ifLogin(this, arguments) === false) return;

			var uid = G.logic.login.getLoginUid();
			var plUrl = G.util.token.addToken('http://pinglun.yixun.com/json1.php?mod=reviews&act=judge&fmt=1&uid=' + uid,'jq');
			G.util.post(plUrl, {
				review_id: rid,
				type: rtype,
				option: option,
				pid: G.app.faxian_detail.pid
			}, function(o) {
				if (o && o.errno == 0) {
					self._jhistory[rid] = 1;
					var num = parseInt( btnTarget.find('strong.c_tx2').html() ) || 0;
					num += 1;
					btnTarget.html('�Ѷ���<strong class="c_tx2">' + num + '</strong>��');
				}
				else {
					return G.ui.popup.showMsg('�Բ��𣬲���ʧ��');
				}
			});
		},

		//��ʾ�����б�
		_printReviews: function(list) {
			var self = G.app.faxian_detail.review,
				$review_content = $('#review_content');
			var replies_tpl = '<div class="fx_discuss_rep"><h4><i></i>��Ѹ���ظ�</h4><div class="fx_discuss_repcont">{cnt}</div><b>��</b></div>';
			var replies_cnt;
			$.each(list, function(k, v) {
				v = self._encode(v);
				v.content_displayed = v.content.replace(/\n/g, " ").replace(/\s{4,}/g, ' ');
				v.datetime = self.timeFormat(v.create_time, 'y-m-d h:i:s');
				if (('replies' in v) && (v['replies'].length > 0) && ('content' in v['replies'][0])) {
					v.replies_content = G.ui.template.fillWithTPL(false, { cnt: v['replies'][0]['content'] }, false, replies_tpl, true);
				}

				list[k] = v;
			});

			//unbind event
			$('a[rup]', $review_content).unbind('click', self.setLike);
			if (list.length < 1) {
				$review_content.empty().html('��ǰ��û�и���Ʒ������Ŷ');
			}
			else {
				$review_content.hide().empty();
				$review_content.html( G.ui.template.fillWithTPL(false, { list: list }, 'review_content_tpl'));
				$review_content.show();

				//bind event
				$('a[rup]', $review_content).bind('click', self.setLike);
			}
		},

		clear: function() {
			var self = this;
			self.data = {};
			self.currentpage = 1;
			self.discussiontotal = 0;
			//_jhistory ����
		},

		_encode: function(arr) {
			var self = this,
				newArr = {};
			$.each(arr, function(_k, _v) {
				newArr[_k] = typeof _v == 'string' ? self._encodeHtml(_v) : _v;
			});
			return newArr;
		},

		_encodeHtml: function(str) {
			return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, "&#039;").replace(/"/g, "&quot;");
		},

		/**
		 * ��ʽ��ʱ���
		 * @param {Integer} ts ��ת��ʱ���
		 * @param {String} fstr ��ʽ����y-m-d h:i:s �����ִ�Сд
		 */
		timeFormat: function(ts, fstr) {
			var d = G.app.faxian_detail.review.getTimeInfo(ts);
			var r = {
				y: d.year,
				m: d.month,
				d: d.date,
				h: d.hour,
				i: d.minute,
				s: d.sec,
				w: d.week
			};
			$.each(r, function(k, v) {
				if (k != 'y' && v < 10) r[k] = '0' + v;
			});
			return fstr.replace(/(?!\\)(y|m|d|h|i|s|w)/gi, function(a0, a1) {
				return r[a1.toLowerCase()];
			});
		},

		/**
		 * ʱ���ת����ʱ�����
		 */
		getTimeInfo: function(t) {
			var week = ["������", "����һ", "���ڶ�", "������", "������", "������", "������"];
			var d = new Date(t * 1000);
			return {
				year: d.getFullYear(),
				month: d.getMonth() + 1,
				date: d.getDate(),
				hour: d.getHours(),
				minute: d.getMinutes(),
				sec: d.getSeconds(),
				week: week[d.getDay()]
			};
		}
	},

	shareweibo: function(name, page) {
		var url = "http://v.t.qq.com/share/share.php?title=";
		var s = '����#��Ѹ����#������һ���ö���,��' + name + '����';
		page = page + '?YTAG=0.190500001300000';
		url += encodeURIComponent(s);
		url += "&url=" + encodeURIComponent(page) + "&size=http://faxian.yixun.com";

		window.open(url);
		return false;
	},

	shareqzone: function(name, page) {
		var summary = '����#��Ѹ����#������һ���ö���,��' + name + '����' + page;
		page = page + '?YTAG=0.190500002300000';
		var p = {
			url: page,
			showcount: '1',
			/*�Ƿ���ʾ��������,��ʾ��'1'������ʾ��'0' */
			desc: '��Ѹ����',
			/*Ĭ�Ϸ�������(��ѡ)*/
			summary: summary,
			/*����ժҪ(��ѡ)*/
			title: '��Ѹ���֣�Ϊ��������ѡ �������ϲ��',
			/*�������(��ѡ)*/
			site: 'http://faxian.yixun.com/',
			/*������Դ �磺��Ѷ��(��ѡ)*/
			pics: '',
			/*����ͼƬ��·��(��ѡ)*/
			style: '203',
			width: 98,
			height: 22
		};
		var s = [];
		for (var i in p) {
			s.push(i + '=' + encodeURIComponent(p[i] || ''));
		}
		var url = "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?" + s.join('&');
		window.open(url);
		return false;
	}
};

$(function() {
	G.app.faxian_detail.init()
});

/*  |xGv00|97c833d58c1d7c0b4d251225579b5517 */