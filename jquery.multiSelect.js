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

(function($){	$.fn.multiSelect = function(options){
		var o = $.extend({}, $.fn.multiSelect.options, options);

		return this.each(function(){
			var $select = $(this), html = '';
			
			html += '<a class="multiSelect ui-state-default ui-corner-all"><input readonly="readonly" type="text" value="" /><img src="arrow.gif" class="multiSelect-arrow" alt="" /></a>';
			//html += '<div class="multiSelectOptions ui-widget-content ui-corner-all">';
			html += '<div class="multiSelectOptions ui-widget ui-widget-content ui-corner-bl ui-corner-br ui-corner-tr">';
			html += '<ul class="ui-helper-reset">';
			
			if(o.selectAll){
				html += '<li class="ui-multiselect-header">';
				html += '<label class="ui-widget-header ui-corner-all">';
				html += '<a href="" class="ui-multiselect-checkall"><span class="ui-icon ui-icon-check">&nbsp;</span>'+o.selectAllText+'</a>'; 
				html += '<a href="" class="ui-multiselect-uncheckall"><span class="ui-icon ui-icon-close">&nbsp;</span>'+o.deSelectAllText+'</a>';
				html += '</label>';
				html += '</li>';
			};
			
			$select.find('option').each(function(){
				var $this = $(this), value = $this.val(), len = value.length;

				if(len > 0){
					html += '<li><label class="ui-corner-all"><input type="checkbox" name="' + $select.attr('name') + '" value="' + len + '"';
					if($this.is(':selected')) html += ' checked="checked"';
					html += ' />' + $this.html() + '</label></li>';
				};
			});
			html += '</div>';
			
			// cache objects
			$select  = $select.after(html).next('a.multiSelect');
			$options = $select.next('div.multiSelectOptions');
			
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
				showOptions();
				e.preventDefault();
			})
			.focus(function(){
				$(this).addClass('ui-state-focus');
			})
			.blur(function(){
				$(this).removeClass('ui-state-focus');
			})
			.keydown(function(e){
				var $this = $(this), // ref to the select box
				    $label = $options.find('label.ui-state-hover'), // currently highlighted label
				    $next;
				
				if($options.is(':visible')){
				
					switch(e.keyCode){
						
						// tab
						case 9:
							$this.focus().addClass('ui-state-focus').trigger('click').find('input:checkbox:first').focus();
							$this.focus().next(':input').focus();
							//return true;
							break;
					
						// esc, left, right
						case 27:
						case 37:
						case 39:
							$this.addClass('ui-state-focus').trigger('click');
							break;
					
						// up + down
						case 38:
						case 40:
							action = (e.keyCode === 38) ? 'prev' : 'next';
							$label = !$label.length ? $options.find('label:first').addClass('ui-state-hover') : $label;
	
							var $next = $label
								.removeClass('ui-state-hover')
								.parent()
								[action]('li')
								.find('label')
								.trigger('mouseover');

							// if up and at the bottom, move to the top
							if(e.keyCode === 38 && $next.length === 0){
								$options.find('label:last').trigger('mouseover');
							};

							// adjust the viewport if necessary
							adjustViewport($this);
							e.preventDefault();
							break;
						
						// enter, space
						case 13:
						case 32:
							$checkbox = $label.find('input');
							
							if( $checkbox.is(':checked') ){
								$checkbox.removeAttr('checked');
							} else {
								$checkbox.attr('checked','checked');
							}
							
							updateSelected();
							o.onCheck.call($this);
							e.preventDefault(); // so hitting enter doesn't submit the form 
							
							/*
							$checkbox = $container.find('label.ui-state-hover input:checkbox');
							
							if($checkbox.hasClass('selectAll')){
								if($checkbox.is(':checked')){
									// uncheck all
									$container.find('input:checkbox').removeAttr('checked').parent().removeClass('checked');
								} else {
									// check all
									$container.find('input:checkbox').attr('checked','checked').parent().addClass('checked');
								};
								updateSelected();
								o.onCheck.call($this);
								e.preventDefault();
							};
						
							if($checkbox.is(':checked')){
								// Uncheck
								$checkbox.removeAttr('checked');
								$container.find('label').removeClass('ui-state-active').find('input:checked').parent().addClass('ui-state-active');
								updateSelected();
								
								// Select all status can't be checked at this point
								$container.find('label:checkbox.selectAll').attr('checked', 'checked').parent().removeClass('ui-state-active');
								o.onCheck.call($this);
							} else {
								// Check
								$checkbox.attr('checked', 'checked');
								$container.find('label').removeClass('ui-state-active').find('label:checked').parent().addClass('ui-state-active');
								updateSelected();
								o.onCheck.call($this);
							};
							e.preventDefault();
							*/
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
							//return true;
							break;
					};
				};
			});
			

			// option events
			$options
			.each(function(){
				var $this = $(this);
				$this.find('input:checked').parent();
				updateSelected();
			})
			.find('li:not(.ui-multiselect-header) label')
			.mouseover(function(){
				$(this).addClass('ui-state-hover');
			})
			.mouseout(function(){
				$(this).removeClass('ui-state-hover');
			})
			.find('input:checkbox')
			/*.click(function(){
				var $this = $(this), $container = $(this).closest('div.multiSelectOptions');
				
				updateSelected();
				
				$container.prev('a.multiSelect').focus();
				//$container.find('label').find('input:checked').parent();
				//if(!this.checked) $container.find('input:checkbox.selectAll').attr('checked', 'checked').parent().removeClass('ui-state-active');
				o.onCheck.call($this);
			})*/
			.click(check)
			.find("input")
			.closest('li')
			.siblings('li.ui-multiselect-header')
			.find('a')
			.click(function(e){
				var $inputs = $options.find('input:checkbox');
				
				if($(this).hasClass("ui-multiselect-checkall")){
					$inputs.attr('checked', 'checked');
				} else {
					$inputs.removeAttr('checked');
				};
				
				updateSelected();
				e.preventDefault();
			});
			
			// apply bgiframe if available
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
			
			function showOptions(){
				var offset = $select.position(), timer, listHeight = 0;
				
				// FIXME: why??
				$options = $select.next('div.multiSelectOptions');
				
				// hide options if open
				//if($select.hasClass('ui-state-active')){
				
					hideOptions(true);
					
				//	return;
				//};
				
				// show the options div, position it, add classes
				$select
				.addClass('ui-state-active')
				.next('div.multiSelectOptions')
				.css({ position:'absolute', top: offset.top + $select.outerHeight() + 'px', left: offset.left + 'px' })
				.slideDown()
				.find('label')
				.removeClass('ui-state-hover');
		
				/* IE6 does not support max-height */
				if($.browser.msie && typeof document.body.style.maxHeight === "undefined"){
					//var $options = $select.next('div.multiSelectOptions');
					
					$options.children().each(function(){
						listHeight += this.offsetHeight;
					});
			
					// TODO - made this height configurable
					if(listHeight > 175) $options.css({ height: '175px' });
				};
				
				// close on hover out
				$options.hover(
					function(){
						clearTimeout(timer);
					}, 
					function(){
						timer = setTimeout(function(){
							hideOptions(); 
							$select.unbind("hover");
						}, o.hideDelay);
					}
				);			};
			
			function check(e){
				var $this = $(this), $container = $this.closest('div.multiSelectOptions');
				
				updateSelected();
				
				$container.prev('a.multiSelect').focus();
				o.onCheck.call($this);
			};
			
			function hideOptions(hideAll){
				hideAll = hideAll || false;
				
				if(hideAll){
					$("div.multiSelectOptions").slideUp().prev(".multiSelect").removeClass('ui-state-active');
				} else {
			
					// FIXME: why??
					$options = $select.next('div.multiSelectOptions');
					$select.removeClass('ui-state-active');
					$options.slideUp();
				};
			};
			
			function updateSelected(){
				var display = '',
				    $checked = $options.find('input:checkbox:checked'),
				    $input = $options.prev('a.multiSelect').find('input'),
				    count = $checked.length;
				
				if(count === 0){
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
			
			function adjustViewport(el){
				var i = 0,
				    selectionTop = 0,
				    selectionHeight = 0,
				    //divScroll,
				    divHeight;
				
				$options
				.find('label')
				.each(function(){
					var $this = $(this);
		
					if($this.hasClass('ui-state-hover')){ 
						selectionTop = i; 
						selectionHeight = $this.outerHeight(); 
						return; 
					};
		
					i += $this.outerHeight();
				});
	
				//divScroll = $container.scrollTop();
				divHeight = $options.height();
				
				// adjust the dropdown scroll position
				$options.scrollTop( selectionTop-((divHeight/2)-(selectionHeight/2)) );
			};
			
			
		});
	};
	
	// default options
	$.fn.multiSelect.options = {
		selectAll: true,
		selectAllText: 'Check all',
		deSelectAllText: 'Uncheck all',
		noneSelected: 'Select options',
		oneOrMoreSelected: '% selected',
		height: 200,
		hideDelay: 500,
		onCheck: function(){}
	};

})(jQuery);
