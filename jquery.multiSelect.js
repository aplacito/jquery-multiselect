/*
 * jQuery multiSelect 0.1
 *
 * Original code and logic by Cory S.N. LaViska, A Beautiful Site (http://abeautifulsite.net/) 2009 * Rewritten 2009 by Eric Hynds
 *
 * Licensing & Terms of Use
 * 
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
*/

(function($){
	
	$.fn.multiSelect = function(options){
		
		var o = $.extend({}, $.fn.multiSelect.options, options);

		 // Initialize each multiSelect
		$(this).each(function(){
			var $select = $(this), html = '';
			html += '<input type="text" readonly="readonly" class="multiSelect ui-corner-all" value="" style="cursor: default;" />';
			html += '<div class="multiSelectOptions">';
			if(o.selectAll) html += '<label class="selectAll ui-widget-header"><a href="">Check All</a> &nbsp;/&nbsp; <a href="">Uncheck All</a></label>';
			
			$select.find('option').each(function(el,val){
				var $this = $(this);
				var value = $this.val();

				if(value.length > 0){
					html += '<label><span><input type="checkbox" name="' + $select.attr('name') + '" value="' + value.length + '"';
					if($this.is(':selected')) html += ' checked="checked"';
					html += ' />' + $this.html() + '</span></label>';
				}
			});
			html += '</div>';

			// cache objects
			$select  = $select.after(html).next('input.multiSelect');
			$options = $select.next('div.multiSelectOptions').addClass('ui-widget-content ui-corner-all');
			$inputs  = $options.find('input:checkbox');
			
			// Determine if Select All should be checked initially
			if(o.selectAll){
				var sa = true;
				
				$inputs.not('.selectAll').each(function(){
					if(!$(this).is(':checked')) sa = false;
				});
				
				if(sa) $inputs.filter('input.selectAll').attr('checked', 'checked').parent().addClass('ui-state-active');
			};
			
			// the select box events
			$select
			.addClass('ui-state-default')
			.mouseover(function(){
				$(this).addClass('ui-state-hover');
			})
			.mouseout(function() {
				$(this).removeClass('ui-state-hover');
			})
			.click(function(){
				// Show/hide on click
				if($(this).hasClass('ui-state-active') ) {
					hideOptions($(this));
				} else {
					showOptions($(this));
				};
				return false;
			})
			.focus(function() {
				// So it can be styled with CSS
				$(this).addClass('ui-state-focus');
			})
			.blur(function() {
				// So it can be styled with CSS
				$(this).removeClass('ui-state-focus');
			});
			

			// option events
			$options
			.each(function(){
				var $this = $(this);
				$this.find('input:checked').parent();
				updateSelected($this,o);
			})
			.find('label:not(label.selectAll)')
			.addClass('ui-state-default')
			.mouseover(function(){
				$(this).addClass('ui-state-hover');
			})
			.mouseout(function() {
				$(this).removeClass('ui-state-hover');
			})
			.find('input:checkbox:not(input.selectAll)')
			.click(function(){
				var $this = $(this), $container = $(this).closest('div.multiSelectOptions');
				
				updateSelected($container,o);
				
				//$this.parent().addClass('ui-state-active');
				$container.find('label').find('input:checked').parent();
				$container.prev('.multiSelect').focus();
				//if(!$this.is(':checked')) $container.find('input:checkbox.selectAll').attr('checked', 'checked').parent().removeClass('ui-state-active');
				o.callback.call($this);
			})
			.parent()
			.siblings('label.selectAll')
			.find('input:checkbox')
			.click(function(){
				var $this = $(this),
					$container = $this.closest('div.multiSelectOptions'),
					$inputs = $container.find('input:checkbox');
				
				if(this.checked){
					$inputs.attr('checked', 'checked'); 
				} else {
					$inputs.removeAttr('checked');
				};
				
				updateSelected($container,o);
			});
			
			
			// Keyboard
			$select
			.next('.multiSelect')
			.keydown(function(e){
				var $this = $(this);
				var $container = $this.next('.multiSelectOptions');
				var $checkbox;
				
				// Is dropdown visible?
				if($container.is(':visible')){
				
					switch(e.keyCode){
						
						// tab
						case 9:
							$this.addClass('focus').trigger('click');
							$this.focus().next(':input').focus();
							return true;
							break;
					
						// esc, left, right
						case 27:
						case 37:
						case 39:
							$this.addClass('focus').trigger('click');
							break;
					
						// down
						case 40:
							if(!$container.find('label').hasClass('hover')){
								// Default to first item
								$container.find('label:first').addClass('hover');
							} else {
								// Move down, cycle to top if on bottom
								$container.find('label.hover').removeClass('hover').next('label').addClass('hover');
								if( !$container.find('label').hasClass('hover') ) {
									$container.find('label:first').addClass('hover');
								}
							};
						
							// adjust the viewport if necessary
							adjustViewport($this);
							return false;
							break;
						
						// up
						case 38:
							if(!$container.find('label').hasClass('hover')){
								// Default to first item
								$container.find('label:first').addClass('hover');
							} else {
								// Move up, cycle to bottom if on top
								$container.find('label.hover input:checkbox').removeClass('hover').prev('label').addClass('hover');
							
								if(!$container.find('label').hasClass('hover')){
									$container.find('label:last').addClass('hover');
								};
							};
							
							// adjust the viewport if necessary
							adjustViewport($this);
							return false;
							break;
						
						// enter, space
						case 13:
						case 32:
							$checkbox = $container.find('label.hover input:checkbox');
							
							if($checkbox.hasClass('selectAll')){
								if($checkbox.is(':checked')){
									// uncheck all
									$container.find('input:checkbox').removeAttr('checked').parent().removeClass('checked');
								} else {
									// check all
									$container.find('input:checkbox').attr('checked','checked').parent().addClass('checked');
								};
								updateSelected($container,o);
								o.callback.call($this);
								return false;
							};
						
							if($checkbox.is(':checked')){
								// Uncheck
								$checkbox.removeAttr('checked');
								$container.find('label').removeClass('checked').find('input:checked').parent().addClass('checked');
								updateSelected($container,o);
								
								// Select all status can't be checked at this point
								$container.find('label:checkbox.selectAll').attr('checked', 'checked').parent().removeClass('checked');
								o.callback.call($this);
							} else {
								// Check
								$checkbox.attr('checked', 'checked');
								$container.find('label').removeClass('checked').find('label:checked').parent().addClass('checked');
								updateSelected($container,o);
								o.callback.call($this);
							};
							return false;
							break;
					};
				
				// Dropdown is not visible
				} else {
					
					switch(e.keyCode){
					
						 // down, enter, space
						case 38:
						case 40:
						case 13:
						case 32:
							// show dropdown
							$this.removeClass('focus').trigger('click');
							$container.find('label:first').addClass('hover');
							return false;
							break;
						
						//  Tab key
						case 9:
							// Shift focus to next INPUT element on page
							$this.focus().next(':input').focus();
							return true;
							break;
					};
				};
			});
			
			// Apply bgiframe if available on IE6
			if($.fn.bgiframe) $options.bgiframe();
			
			// Eliminate the original form element
			$select.prev().remove();
		});
		
	};
	
	// Hide the dropdown
	this.hideOptions = function($this){
		$this.removeClass('ui-state-active').next('.multiSelectOptions').hide();
	};
	
	// Show the dropdown
	this.showOptions = function($this){
		var offset, timer, listHeight = 0;
		offset = $this.position();
		
		// Hide any open option boxes
		hideOptions( $('.multiSelect') );
		
		// show the options div, position it, add classes
		$this
		.addClass('ui-state-active')
		.next('.multiSelectOptions')
		.css({ position:'absolute', top: offset.top + $this.outerHeight() + 'px', left: offset.left + 'px' })
		.show()
		.find('label')
		.removeClass('ui-state-hover');
		
		/* IE6 does not support max-height */
		if($.browser.msie && typeof document.body.style.maxHeight === "undefined"){
			var $options = $this.next('.multiSelectOptions');
			
			$options.children().each(function(){
				listHeight += this.offsetHeight;
			});
			
			// TODO - made this height configurable
			if(listHeight > 150) $options.css({ height: '150px' });
		};
		
		// Disappear on hover out
		multiSelectCurrent = $this;
		$this.next('.multiSelectOptions').hover(function(){
			clearTimeout(timer);
		}, function(){
			timer = setTimeout('hideOptions(multiSelectCurrent); multiSelectCurrent.unbind("hover");', 250);
		});
		
	};
	
	// Update the textbox with the total number of selected items
	this.updateSelected = function($container,o){
		var s = '', display = '';
		var $checked = $container.find('input:checkbox:checked');
		var $select = $container.prev('input.multiSelect');
		var count = $checked.not('.selectAll').length;
		
		if(count == 0){
			$select.val( o.noneSelected );
		} else {
			if(o.oneOrMoreSelected === '*'){
				$checked.each(function(){
					var text = $(this).parent().text();
					if(text !== o.selectAllText) display += text + ', ';
				});
				display = display.substr(0, display.length - 2);
				$select.val( display );
			} else {
				$select.val( o.oneOrMoreSelected.replace('%', count) );
			}
		}
	};
	
	// Ensures that the selected item is always in the visible portion of the dropdown (for keyboard controls)
	this.adjustViewport = function(el){
		// Calculate positions of elements
		var $el = $(el), $container = $el.next('.multiSelectOptions'), i = 0, selectionTop = 0, selectionHeight = 0;
		
		$el
		.next('.multiSelectOptions')
		.find('label')
		.each(function(){
			var $this = $(this);
			if($this.hasClass('ui-state-hover')){ selectionTop = i; selectionHeight = $this.outerHeight(); return; }
			i += $this.outerHeight();
		});
		var divScroll = $container.scrollTop();
		var divHeight = $container.height();
		
		// Adjust the dropdown scroll position
		$container.scrollTop(selectionTop - ((divHeight / 2) - (selectionHeight / 2)));
	};
	
	// default options
	$.fn.multiSelect.options = {
		selectAll: true,
		selectAllText: 'Select all',
		noneSelected: 'Select options',
		oneOrMoreSelected: '% selected',
		height: 200,
		callback: function(){}
	};

})(jQuery);
