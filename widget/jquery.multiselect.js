/*
 * jQuery MultiSelect UI Widget 0.1
 * Copyright (c) 2010 Eric Hynds
 *
 * http://www.erichynds.com/jquery/jquery-multiselect-plugin-with-themeroller-support/
 * Inspired by Cory S.N. LaViska's implementation, A Beautiful Site (http://abeautifulsite.net/) 2009
 *
 * Depends:
 *   - jQuery 1.4.3pre+
 *   - jQuery UI 1.8 (widget, position, and effects if you want to use them)
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 *
 * **** NOT READY FOR PRODUCTION ****
*/
(function($){

$.widget("ui.multiselect", {
	
	// default options
	options: {
		header: false,
		maxHeight: 175, /* max height of the checkbox container (scroll) in pixels */
		minWidth: 210, /* min width of the entire widget in pixels. setting to 'auto' will disable */
		checkAllText: 'Check all',
		unCheckAllText: 'Uncheck all',
		noneSelectedText: 'Select options',
		selectedText: '# selected',
		selectedList: 0,
		show: '',
		hide: '',
		autoOpen: false,
		check: function(){}, /* when an individual checkbox is clicked */
		open: function(){}, /* when the select menu is opened */
		close: function(){}, /* when the select menu is closed */
		checkAll: function(){}, /* when the check all link is clicked */
		uncheckAll: function(){}, /* when the uncheck all link is clicked */
		optgroupToggle: function(){} /* when the optgroup heading is clicked */
	},

	_create: function(){
		var self = this, 
			el = this.element, 
			o = this.options, 
			html = [], 
			optgroups = [], 
			isDisabled = el.is(':disabled');

		this.speed = 400; // default speed for effects. UI's default is 400.
		this._isOpen = false;
		
		// the actual button
		html.push('<button type="button" class="ui-multiselect ui-widget ui-state-default ui-corner-all'+ (isDisabled ? ' ui-state-disabled' : '') +'"><span>'+o.noneSelectedText+'</span><span class="ui-icon ui-icon-triangle-1-s"></span></button>');
		
		// start menu contaner
		html.push('<div class="ui-multiselect-options ui-widget ui-widget-content ui-corner-all">');
	
		// header
		html.push('<div class="ui-widget-header ui-corner-all ui-multiselect-header ui-helper-clearfix">');
		html.push('<ul class="ui-helper-reset">');
		html.push('<li><a class="ui-multiselect-all" href=""><span class="ui-icon ui-icon-check"></span>' + o.checkAllText + '</a></li>');
		html.push('<li><a class="ui-multiselect-none" href=""><span class="ui-icon ui-icon-closethick"></span>' + o.unCheckAllText + '</a></li>');
		html.push('<li class="ui-multiselect-close"><a href="" class="ui-multiselect-close"><span class="ui-icon ui-icon-circle-close"></span></a></li>');
		html.push('</ul>');
		html.push('</div>');

		// checkboxes
		html.push('<ul class="ui-multiselect-checkboxes ui-helper-reset">');
		
		// loop through each option tag
		el.find('option').each(function(){
			var $this = $(this), title = $this.html(), value = this.value, len = value.length, $parent = $this.parent(), hasOptGroup = $parent.is('optgroup'), isDisabled = $this.is(':disabled'), labelClasses = ['ui-corner-all'], liClasses = [];
			
			if(hasOptGroup){
				var label = $parent.attr('label');
				
				if($.inArray(label,optgroups) === -1){
					html.push('<li class="ui-multiselect-optgroup-label"><a href="#">' + label + '</a></li>');
					optgroups.push(label);
				}
			}
		
			if(len > 0){
				if(isDisabled){
					labelClasses.push('ui-state-disabled');
					liClasses.push('ui-multiselect-disabled');
				}
				
				html.push('<li class="' + liClasses.join(' ') + '">');
				html.push('<label class="' + labelClasses.join(' ') + '"><input type="checkbox" name="' + self.element.name + '" value="' + value + '" title="' + title + '"');
				if($this.is(':selected')){
					html.push(' checked="checked"');
				}
				if(isDisabled){
					html.push(' disabled="disabled"');
				}
				html.push(' />' + title + '</label></li>');
			}
		});
		
		// close everything off
		html.push('</ul></div>');
		
		this.button		= el.after( html.join('') ).hide().next('button').data('selectelement', el);
		this.menu		= this.button.next('div.ui-multiselect-options');
		this.labels		= this.menu.find('label');
		
		// calculate widths
		this.width = this.element.outerWidth();
		if( /\d/.test(o.minWidth) && this.width < o.minWidth){
			this.width = o.minWidth;
		}
		
		// set widths
		this.button.width( this.width );
		
		this._bindEvents();

		// update the number of selected elements when the page initially loads, and use that as the defaultValue.  necessary for form resets when options are pre-selected.
		this.button[0].defaultValue = this._updateSelected();
	
		// close each select when clicking on any other element/anywhere else on the page
		$(document).bind('click', function(e){
			var $target = $(e.target);

			if(self._isOpen && !$target.closest('div.ui-multiselect-options').length && !$target.is('button.ui-multiselect')){
				self.close('all');
			}
		});
		
		return this;
	},
	
	_init: function(){
		if(!this.options.header){
			this.menu.find("div.ui-multiselect-header").hide();
		}
		if(this.options.autoOpen){
			this.open();
		}
	},
	
	widget: function(){
		return this.button;
	},
	
	// binds events. duh
	_bindEvents: function(){
	
		var self = this,
			menu = this.menu,
			labels = this.labels,
			button = this.button;

		// expose custom events
		this.element.bind({
			'multiselectclose': function(){
				self.close();
			},
			'multiselectopen': function(){
				self.open();
			},
			'multiselectcheckall': function(){
				self.checkAll();
			},
			'multiselectuncheckall': function(){
				self.uncheckAll();
			}
		});
		
		// button events
		button.bind({
			click: function(){
				self[ self._isOpen ? 'close' : 'open' ]();
			},
			keypress: function(e){
				switch(e.keyCode){
					case 27: // esc
					case 38: // up
					case 37: // left
						self.close();
						break;
					case 39: // right
					case 40: // down
						self.open();
						break;
				}
			},
			mouseenter: function(){
				if(!self.button.hasClass('ui-state-disabled')){
					$(this).addClass('ui-state-hover');
				}
			},
			mouseleave: function(){
				$(this).removeClass('ui-state-hover');
			},
			focus: function(){
				if(!self.button.hasClass('ui-state-disabled')){
					$(this).addClass('ui-state-focus');
				}
			},
			blur: function(){
				$(this).removeClass('ui-state-focus');
			}
		});

		// header links
		this.menu.find('div.ui-multiselect-header a').bind('click', function(e){
			var $this = $(this);
		
			// close link
			if($this.hasClass('ui-multiselect-close')){
				self.close();
		
			// check all / uncheck all
			} else {
				self[ $this.hasClass('ui-multiselect-all') ? 'checkAll' : 'uncheckAll' ]();
			}
		
			e.preventDefault();
		});

		
		// optgroup label toggle support
		menu.find('li.ui-multiselect-optgroup-label a').bind('click', function(e){
			var $inputs = $(this).parent().nextUntil('li.ui-multiselect-optgroup-label').find('input');
			self._toggleChecked( $inputs.filter(':checked').length !== $inputs.length, $inputs );
			self.options.optgroupToggle.call(this, $inputs.get());
			e.preventDefault();
		});
		
		// labels/checkbox events
		menu.delegate('label', 'mouseenter', function(){
			if(!$(this).hasClass('ui-state-disabled')){
				labels.removeClass('ui-state-hover');
				$(this).addClass('ui-state-hover').find('input').focus();
			}
		})
		.delegate('label', 'click', function(e){
			// if the label was clicked, trigger the click event on the checkbox.  way to ruin the party, IE6
			e.preventDefault();
			$(this).find('input').trigger('click', [true]); 
		})
		.delegate('label', 'keyup', function(e){
			switch(e.keyCode){
				case 27: // esc
					self.close();
					break;
		
				case 38: // up
				case 40: // down
				case 37: // left
				case 39: // right
					self._traverse(e.keyCode, this);
					break;
			
				case 13: // enter
					e.preventDefault();
					$(this).trigger('click');
					break;
			}
		})
		.delegate('input', 'click', function(e, label){
			label = label || false;
			
			// bail if this input is disabled
			if($(this).is(':disabled')){
				return;
			}
			
			// stop this click from bubbling up to the label
			e.stopPropagation();

			// if the click originated from the label, stop the click event and manually toggle the checked state
			if(label){
				e.preventDefault();
				this.checked = this.checked ? false : true;
			}
		
			self.options.check.call(this);
			self._updateSelected();
		});
	},

	// updates the number of selected items in the button
	_updateSelected: function(){
		var o = this.options,
			$inputs = this.labels.find('input'),
			$checked = $inputs.filter(':checked'),
			value, numChecked = $checked.length;
		
		if(numChecked === 0){
			value = o.noneSelectedText;
		} else {
			if($.isFunction(o.selectedText)){
				value = o.selectedText.call(this, numChecked, $inputs.length, $checked.get());
			} else if( /\d/.test(o.selectedList) && o.selectedList > 0 && numChecked <= o.selectedList){
				value = $checked.map(function(){ return this.title; }).get().join(', ');
			} else {
				value = o.selectedText.replace('#', numChecked).replace('#', $inputs.length);
			}
		}
		
		this.button.attr('title', value).find('span:first').text(value);
		return value;
	},
	
	// open the menu
	open: function(){
		
		// bail if this widget is disabled
		if( this.button.hasClass('ui-state-disabled') || this._isOpen ){
			return;
		}
		
		if(!this.options.autoOpen){
			this.close('others');
		}
		
		// use position() if inside ui-widget-content, because offset() won't cut it.
		var self = this,
			$container = this.menu.find('ul:last'),
			o = this.options,
			effect = o.show,
			speed = this.speed;
		
		// calling select is active
		this.button.addClass('ui-state-active');
		
		// select the first option
		// triggering both mouseover and mouseover because 1.4.2+ has a bug where triggering mouseover
		// will actually trigger mouseenter.  the mouseenter trigger is there for when it's eventually fixed
		this.labels.first().trigger('mouseover').trigger('mouseenter').find('input').trigger('focus');
		
		// figure out opening effects/speeds
		if($.isArray(o.show)){
			effect = o.show[0];
			speed = o.show[1] || self.speed;
		}

		// show the options div + position it.
		// 2 positions are necessary for some effects.  very buggy to support all cases otherwise, unfortunately
		this.menu
		.css({ top:0, left:0 })
		.width( self.width-parseInt(self.menu.css('padding-left'),10)-parseInt(self.menu.css('padding-right'),10)-2 )
		.position({ my:"left top", at:"left bottom", of:self.menu.prev() })
		.show(effect, speed);
		//.position({ my:"left top", at:"left bottom", of:self.menu.prev() });
		
		this._isOpen = true;
		
		// set the scroll of the checkbox container
		$container.scrollTop(0).height(o.maxHeight);
		
		o.open.call( this.menu[0] );
	},
	
	// close the menu
	close: function(which){
		
		// close all but the open one
		if(which === "others" || which === "all"){
			var $open = $('button.ui-multiselect.ui-state-active');
			
			// do not include this instance if closing others
			if(which === "others"){
				$open = $open.not(this.button);
			}
			
			$open.each(function(){
				$(this).data('selectelement').multiselect('close');
			});
			
		// close this one
		} else {
		
			var self = this, o = this.options, effect = o.hide, speed = this.speed;
			
			// figure out opening effects/speeds
			if($.isArray(o.hide)){
				effect = o.hide[0];
				speed = o.hide[1] || this.speed;
			}
		
			this.menu.hide(effect, speed);
			this.button.removeClass('ui-state-active').trigger('blur').trigger('mouseleave');
			self._isOpen = false;
		
			o.close.call( this.menu[0] );
		}
	},

	// move up or down within the menu.  TODO make private?
	_traverse: function(keycode, start){
		var $start = $(start),
			moveToLast = (keycode === 38 || keycode === 37) ? true : false,
			
			// select the first li that isn't an optgroup label / disabled
			$next = $start.parent()[moveToLast ? 'prevAll' : 'nextAll']('li:not(.ui-multiselect-disabled, .ui-multiselect-optgroup-label)')[ moveToLast ? 'last' : 'first']();
		
		// if at the first/last element
		if(!$next.length){
			var $container = this.menu.find('ul:last');
			
			// move to the first/last
			this.menu.find('label')[ moveToLast ? 'last' : 'first' ]().trigger('mouseover');
			
			// set scroll position
			$container.scrollTop( moveToLast ? $container.height() : 0 );
			
		} else {
			$next.find('label').trigger('mouseover');
		}
	},

	_toggleChecked: function(flag, group){
		var $inputs = (group && group.length) ? group : this.labels.find('input');
		$inputs.not(':disabled').attr('checked', (flag ? 'checked' : '')); 
		this._updateSelected();
	},

	_toggleDisabled: function(flag){
		this.button.attr('disabled', (flag ? 'disabled' : ''))[ flag ? 'addClass' : 'removeClass' ]('ui-state-disabled');
		this.menu.find('input').attr('disabled', (flag ? 'disabled' : '')).parent()[ flag ? 'addClass' : 'removeClass' ]('ui-state-disabled');
	},
	
	enable: function(){
		this._toggleDisabled(false);
	},
	
	checkAll: function(){
		this._toggleChecked(true);
		this.options.checkAll();
	},
	
	uncheckAll: function(){
		this._toggleChecked(false);
		this.options.uncheckAll();
	},
	
	disable: function(){
		this._toggleDisabled(true);
	},
	
	header: function(value){
		this.menu.find("div.ui-multiselect-header")[ value ? 'show' : 'hide' ]();
	},
	
	destroy: function(){
		// remove classes + data
		$.Widget.prototype.destroy.call( this );
		
		this.button.remove();
		this.menu.remove();
		this.element.show();
	},

	// react to option changes after initialization
	_setOption: function( key, value ){
		this.options[ key ] = value;
		
		switch(key){
			case "enable":
				this.enable();
				break;
			case "disable":
				this.disable();
				break;
			case "header":
				this.header(value);
				break;
		}

	}
});

})(jQuery);
