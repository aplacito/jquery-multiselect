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
			html += '<a class="multiSelect ui-state-default ui-corner-all"><input readonly="readonly" type="text" value="" /><img src="arrow.gif" class="multiSelect-arrow" alt="" /></a>';
			html += '<div class="multiSelectOptions ui-widget-content ui-corner-all">';
			if(o.selectAll) html += '<label class="selectAll ui-widget-header"><a href="" class="multiselect-checkall">Check All</a> &nbsp;/&nbsp; <a href="" class="multiselect-uncheckall">Uncheck All</a></label>';
			
			$select.find('option').each(function(el,val){
				var $this = $(this), value = $this.val();

				if(value.length > 0){
					html += '<label><input type="checkbox" name="' + $select.attr('name') + '" value="' + value.length + '"';
					if($this.is(':selected')) html += ' checked="checked"';
					html += ' />' + $this.html() + '</label>';
				}
			});
			html += '</div>';
			
			// cache objects
			$select  = $select.after(html).next('a.multiSelect');
			$options = $select.next('div.multiSelectOptions');
			$inputs  = $options.find('input:checkbox');
			
			// the select box events
			$select
			.mouseover(function(){
				$(this).addClass('ui-state-hover');
				toggleArrow();
			})
			.mouseout(function() {
				$(this).removeClass('ui-state-hover');
				toggleArrow();
			})
			.click(function(e){
				if($(this).hasClass('ui-state-active') ) {
					hideOptions($(this));
				} else {
					showOptions($(this));
				};
				e.preventDefault();
			})
			.focus(function(){
				$(this).addClass('ui-state-focus');
			})
			.blur(function(){
				$(this).removeClass('ui-state-focus');
			})
			.find("input")
			.keydown(function(e){
				var $this = $(this);
				var $container = $this.parent().next('.multiSelectOptions');
				var $checkbox;

				if($container.is(':visible')){
				
					switch(e.keyCode){
						
						// tab
						case 9:
							$this.addClass('ui-state-focus').trigger('click');
							$this.focus().next(':input').focus();
							return true;
							break;
					
						// esc, left, right
						case 27:
						case 37:
						case 39:
							$this.addClass('ui-state-focus').trigger('click');
							break;
					
						// down
						case 40:
							if(!$container.find('label').hasClass('ui-state-hover')){
								$container.find('label:first').addClass('ui-state-hover');
							} else {								// Move down, cycle to top if on bottom
								$container.find('label.ui-state-hover').removeClass('ui-state-hover').next('label').addClass('ui-state-hover');
								if( !$container.find('label').hasClass('ui-state-hover') ) {
									$container.find('label:first').addClass('ui-state-hover');
								};							};
						
							// adjust the viewport if necessary
							adjustViewport($this);
							e.preventDefault();
							break;
						
						// up
						case 38:
							if(!$container.find('label').hasClass('ui-state-hover')){
								// Default to first item								$container.find('label:first').addClass('ui-state-hover');
							} else {
								// Move up, cycle to bottom if on top
								$container.find('label.ui-state-hover input:checkbox').removeClass('ui-state-hover').prev('label').addClass('ui-state-hover');
							
								if(!$container.find('label').hasClass('ui-state-hover')){
									$container.find('label:last').addClass('ui-state-hover');
								};
							};
							
							// adjust the viewport if necessary
							adjustViewport($this);
							return false;
							break;
						
						// enter, space
						case 13:
						case 32:
							$checkbox = $container.find('label.ui-state-hover input:checkbox');
							
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
								$container.find('label').removeClass('ui-state-active').find('input:checked').parent().addClass('ui-state-active');
								updateSelected($container,o);
								
								// Select all status can't be checked at this point
								$container.find('label:checkbox.selectAll').attr('checked', 'checked').parent().removeClass('ui-state-active');
								o.callback.call($this);
							} else {
								// Check
								$checkbox.attr('checked', 'checked');
								$container.find('label').removeClass('ui-state-active').find('label:checked').parent().addClass('ui-state-active');
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
							$this.removeClass('ui-state-focus').trigger('click');
							$container.find('label:first').addClass('ui-state-hover');
							e.preventDefault();
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
				var $this = $(this), $container = $(this).closest('div.multiSelectOptions'), $label = $this.parent();
				
				updateSelected($container,o);
				
				if(this.checked){
					$label.addClass('ui-state-active');
				} else {
					$label.removeClass('ui-state-active');
				}
								$container.prev('a.multiSelect').focus();
				//$container.find('label').find('input:checked').parent();
				//if(!this.checked) $container.find('input:checkbox.selectAll').attr('checked', 'checked').parent().removeClass('ui-state-active');
				o.callback.call($this);
			})
			.parent()
			.siblings('label.selectAll')
			.find('a')
			.click(function(){
				var $this = $(this),
					$container = $this.closest('div.multiSelectOptions'),
					$inputs = $container.find('input:checkbox');
				
				if($this.hasClass("multiselect-checkall")){
					$inputs.attr('checked', 'checked').parent().addClass('ui-state-active'); 
				} else {
					$inputs.removeAttr('checked').parent().removeClass('ui-state-active');
				};
				
				updateSelected($container,o);
				return false;
			});
			
			// apply bgiframe if available on IE6
			if($.fn.bgiframe) $options.bgiframe();
			
			// remove the original form element
			$select.prev().remove();
			
			function toggleArrow(){
				var $arrow = $select.find("img");
				if($select.hasClass('ui-state-hover')){
					$arrow.attr('src', 'arrow_hover.gif');
				} else {
					$arrow.attr('src', 'arrow.gif');
				};
			};
		});

	};
	
	// Hide the dropdown
	this.hideOptions = function($this){
		$this.removeClass('ui-state-active').next('div.multiSelectOptions').hide();
	};
	
	// Show the dropdown
	this.showOptions = function($this){
		var offset, timer, listHeight = 0;
		offset = $this.position();
		
		// Hide any open option boxes
		hideOptions( $('a.multiSelect') );
		
		// show the options div, position it, add classes
		$this
		.addClass('ui-state-active')
		.next('div.multiSelectOptions')
		.css({ position:'absolute', top: offset.top + $this.outerHeight() + 'px', left: offset.left + 'px' })
		.show()
		.find('label')
		.removeClass('ui-state-hover');
		
		/* IE6 does not support max-height */
		if($.browser.msie && typeof document.body.style.maxHeight === "undefined"){
			var $options = $this.next('div.multiSelectOptions');
			
			$options.children().each(function(){
				listHeight += this.offsetHeight;
			});
			
			// TODO - made this height configurable
			if(listHeight > 175) $options.css({ height: '175px' });
		};
		
		// close on hover out
		multiSelectCurrent = $this;
		$this.next('.multiSelectOptions').hover(function(){
			clearTimeout(timer);
		}, function(){
			// TODO make the ms option configurable
			timer = setTimeout('hideOptions(multiSelectCurrent); multiSelectCurrent.unbind("hover");', 100);
		});
		
	};
	
	// Update the textbox with the total number of selected items
	this.updateSelected = function($container,o){
		var s = '', display = '';
		var $checked = $container.find('input:checkbox:checked');
		var $input = $container.prev('a.multiSelect').find('input');
		var count = $checked.not('.selectAll').length;
		
		if(count == 0){
			$input.val( o.noneSelected );
		} else {
			if(o.oneOrMoreSelected === '*'){
				$checked.each(function(){
					var text = $(this).parent().text();
					if(text !== o.selectAllText) display += text + ', ';
				});
				display = display.substr(0, display.length - 2);
				$input.val( display );
			} else {
				$input.val( o.oneOrMoreSelected.replace('%', count) );
			};
		};
	};
	
	// Ensures that the selected item is always in the visible portion of the dropdown (for keyboard controls)
	this.adjustViewport = function(el){
		// Calculate positions of elements
		var $container = $(el).parent().next('div.multiSelectOptions'), i = 0, selectionTop = 0, selectionHeight = 0;
		
		$container
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
