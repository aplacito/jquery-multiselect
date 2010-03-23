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
*/
(function($){

$.widget("ui.multiselect", {

	speed: 400, // default speed for effects.  UI's default is 400
	_isOpen: false, 
	
	// default options
	options: {
		showHeader: true,
		maxHeight: 175, /* max height of the checkbox container (scroll) in pixels */
		minWidth: 210, /* min width of the entire widget in pixels. setting to 'auto' will disable */
		checkAllText: 'Check all',
		unCheckAllText: 'Uncheck all',
		noneSelectedText: 'Select options',
		selectedText: '# selected',
		selectedList: 0,
		show: '',
		hide: '',
		state: 'closed',
		check: function(){}, /* when an individual checkbox is clicked */
		open: function(){}, /* when the select menu is opened */
		close: function(){}, /* when the select menu is closed */
		checkAll: function(){}, /* when the check all link is clicked */
		uncheckAll: function(){}, /* when the uncheck all link is clicked */
		optgroupToggle: function(){} /* when the optgroup heading is clicked */
	},

	_create: function(){
		var self = this;
		
		this._generate();
		this._bindEvents();
		
		// update the number of selected elements when the page initially loads, and use that as the defaultValue.  necessary for form resets when options are pre-selected.
		this.$button[0].defaultValue = this._updateSelected();
	
		// close each select when clicking on any other element/anywhere else on the page
		$(document).bind('click', function(e){
			var $target = $(e.target);

			if(self._isOpen && !$target.closest('div.ui-multiselect-options').length && !$target.is('button.ui-multiselect')){
				self.close(e);
			}
		});
	},
	
	// generates new markup, and caches references to important queries in widget properties
	_generate: function(){
		var self = this, el = this.element, o = this.options, html = [], optgroups = [], isDisabled = el.is(':disabled');
		
		html.push('<button type="button" class="ui-multiselect ui-widget ui-state-default ui-corner-all'+isDisabled+'"><span>'+o.noneSelectedText+'</span><span class="ui-icon ui-icon-triangle-1-s"></span></button>');
		html.push('<div class="ui-multiselect-options' + (o.shadow ? ' ui-multiselect-shadow' : '') + ' ui-widget ui-widget-content ui-corner-all">');
	
		if(o.showHeader){
			html.push('<div class="ui-widget-header ui-helper-clearfix ui-corner-all ui-multiselect-header">');
			html.push('<ul class="ui-helper-reset">');
			html.push('<li><a class="ui-multiselect-all" href=""><span class="ui-icon ui-icon-check"></span>' + o.checkAllText + '</a></li>');
			html.push('<li><a class="ui-multiselect-none" href=""><span class="ui-icon ui-icon-closethick"></span>' + o.unCheckAllText + '</a></li>');
			html.push('<li class="ui-multiselect-close"><a href="" class="ui-multiselect-close ui-icon ui-icon-circle-close"></a></li>');
			html.push('</ul>');
			html.push('</div>');
		}
		
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
		html.push('</ul></div>');
		
		this.$button	= el.after( html.join('') ).hide().next('button').data('selectelement', el);
		this.$menu		= this.$button.next('div.ui-multiselect-options');
		this.$labels	= this.$menu.find('label');
		
		// calculate widths
		this.width = this.$button.outerWidth();
		if( /\d/.test(o.minWidth) && this.width < o.minWidth){
			this.width = o.minWidth;
		}

		// set widths
		this.$button.width( this.width );
	},
	
	// binds events. duh
	_bindEvents: function(){
	
		var self = this,
			$menu = this.$menu,
			$labels = this.$labels,
			$button = this.$button;
		
		// button
		$button.bind({
			click: function(){
				$menu.trigger('toggle');
			},
			keypress: function(e){
				switch(e.keyCode){
					case 27: // esc
					case 38: // up
						self.$menu.trigger('close');
						break;
					case 40: // down
					case 0: // space
						self.$menu.trigger('toggle');
						break;
				}
			},
			mouseenter: function(){
				if(!self.$button.hasClass('ui-state-disabled')){
					$(this).addClass('ui-state-hover');
				}
			},
			mouseleave: function(){
				$(this).removeClass('ui-state-hover');
			},
			focus: function(){
				if(!self.$button.hasClass('ui-state-disabled')){
					$(this).addClass('ui-state-focus');
				}
			},
			blur: function(){
				$(this).removeClass('ui-state-focus');
			}
		});

		// header links
		if(this.options.showHeader){
			this.$menu.find('div.ui-multiselect-header a').click(function(e){
				var $this = $(this);
			
				// close link
				if($this.hasClass('ui-multiselect-close')){
					self.$menu.trigger('close');
			
				// check all / uncheck all
				} else {
					var checkAll = $this.hasClass('ui-multiselect-all');
					self.$menu.trigger('toggleChecked', [(checkAll ? true : false)]);
					self.options[ checkAll ? 'checkAll' : 'uncheckAll']['call'](this);
				}
			
				e.preventDefault();
			});
		}

		// bind custom events to the menu
		$menu.bind({
			'close': function(){
				self.close();
			},
			'open': function(){
				self.open();
			},
			'toggle': function(){
				self.toggle();
			},
			'traverse': function(e, start, keycode){
				var $start = $(start), 
					moveToLast = (keycode === 38 || keycode === 37) ? true : false,
					
					// select the first li that isn't an optgroup label / disabled
					$next = $start.parent()[moveToLast ? 'prevAll' : 'nextAll']('li:not(.ui-multiselect-disabled, .ui-multiselect-optgroup-label)')[ moveToLast ? 'last' : 'first']();

				// if at the first/last element
				if(!$next.length){
					var $container = this.$menu.find('ul:last');
					
					// move to the first/last
					this.$menu.find('label')[ moveToLast ? 'last' : 'first' ]().trigger('mouseover');
					
					// set scroll position
					$container.scrollTop( moveToLast ? $container.height() : 0 );
					
				} else {
					$next.find('label').trigger('mouseenter');
				}
			},
			'toggleChecked': function(e, flag, group){
				var $inputs = (group && group.length) ? group : $labels.find('input');
				$inputs.not(':disabled').attr('checked', (flag ? 'checked' : '')); 
				self._updateSelected();
			}
		})
		.find('li.ui-multiselect-optgroup-label a')
		.click(function(e){
			// optgroup label toggle support
			var $checkboxes = $(this).parent().nextUntil('li.ui-multiselect-optgroup-label').find('input');
			
			$menu.trigger('toggleChecked', [ ($checkboxes.filter(':checked').length === $checkboxes.length) ? false : true, $checkboxes]);
			self.options.optgroupToggle.call(this, $checkboxes.get());
			e.preventDefault();
		});
		
		// labels/checkbox events
		$menu.delegate('label', 'mouseenter', function(){
			if(!$(this).hasClass('ui-state-disabled')){
				$labels.removeClass('ui-state-hover');
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
					$menu.trigger('close');
					break;
		
				case 38: // up
				case 40: // down
				case 37: // left
				case 39: // right
					$menu.trigger('traverse', [this, e.keyCode]);
					break;
			
				case 13: // enter
					e.preventDefault();
					$(this).click();
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

	_updateSelected: function(){
		var o = this.options,
			$inputs = this.$labels.find('input'),
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
		
		this.$button.attr('title', value).find('span:first').text(value);
		return value;
	},
	
	open: function(){
		
		// bail if this widget is disabled
		if( this.$button.hasClass('ui-state-disabled') || this._isOpen ){
			return;
		}
		
		this._closeOthers();

		// use position() if inside ui-widget-content, because offset() won't cut it.
		var self = this,
			$container = this.$menu.find('ul:last'),
			o = this.options,
			effect = o.show,
			speed = this.speed;
		
		// calling select is active
		this.$button.addClass('ui-state-active');
		
		// select the first option
		this.$labels.filter('label:first').trigger('mouseenter').trigger('focus');
		
		// figure out opening effects/speeds
		if($.isArray(o.show)){
			effect = o.show[0];
			speed = o.show[1] || self.speed;
		}

		// show the options div + position it.
		// 2 positions are necessary for some effects.  very buggy to support all cases otherwise, unfortunately
		this.$menu
		.css({ top:0, left:0 })
		.width( self.width-parseInt(self.$menu.css('padding-left'),10)-parseInt(self.$menu.css('padding-right'),10)-parseInt(self.$button.css('padding-left'),10) )
		.position({ my:"left top", at:"left bottom", of:self.$menu.prev() })
		.show(effect, speed)
		.position({ my:"left top", at:"left bottom", of:self.$menu.prev() });
		
		this._isOpen = true;
		
		// set the scroll of the checkbox container
		$container.scrollTop(0).height(o.maxHeight);
		
		o.open.call( this.$menu[0] );
	},
	
	close: function(){
		var self = this, o = this.options, effect = o.hide, speed = this.speed;
		
		// figure out opening effects/speeds
		if($.isArray(o.hide)){
			effect = o.hide[0];
			speed = o.hide[1] || this.speed;
		}
		
		this.$menu.hide(effect, speed);
		this.$button.removeClass('ui-state-active').trigger('blur').trigger('mouseleave');
		self._isOpen = false;
		
		o.close.call( this.$menu[0] );
	},
	
	_closeOthers: function(){
		$('button.ui-multiselect.ui-state-active').not(this.$button).each(function(){
			$(this).data('selectelement').multiselect('close');
		});
	},
	
	toggle: function(){
		this.$menu.trigger( this._isOpen ? 'close' : 'open' );
	},
	
	// disable entire widget
	disable: function(flag){
		// toggles the disabled attribute & the ui-state-disabled class.
		this.$button.attr('disabled', (flag ? 'disabled' : ''))[ flag ? 'addClass' : 'removeClass' ]('ui-state-disabled');
		
		// also disable the inputs so they aren't passed via form submission
		this.$menu.find('input').attr('disabled', (flag ? 'disabled' : '')).parent()[ flag ? 'addClass' : 'removeClass' ]('ui-state-disabled');
	},
	
	destroy: function(){
		// remove classes and such here

		// **CHANGE** call the base destroy function
		$.Widget.prototype.destroy.call( this );
	},


	// react to option changes after initialization
	_setOption: function( key, value ){
		var self = this;
		
		this.options[ key ] = value;
		
		switch(key){
			case "open":
				self.open();
				break;
			case "close":
				self.close();
				break;
			case "disable":
				self.disable(value);
				break;
		}

	}
});

})(jQuery);
