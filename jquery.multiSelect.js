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
	$.fn.extend({
		multiSelect: function(opts){
			opts = $.extend({}, $.MultiSelect.defaults, opts);

			return this.each(function(){
				new $.MultiSelect(this, opts);
			});
		}
	});
		$.MultiSelect = function(select,o){
		var $select = $original = $(select), $options, html = '', optgroups = [];
		
		html += '<a class="multiSelect ui-state-default ui-corner-all"><input readonly="readonly" type="text" value="" /><img src="arrow.gif" class="multiSelect-arrow" alt="" /></a>';
		html += '<div class="multiSelectOptions' + (o.applyShadow ? ' multiSelectOptionsShadow' : '') + ' ui-widget ui-widget-content ui-corner-bl ui-corner-br ui-corner-tr">';
		html += '<ul class="ui-helper-reset">';
		
		// add select all link?
		if(o.selectAll){
			html += '<li class="ui-multiselect-all">';
			html += '<label class="ui-corner-all">';
			html += '<input type="checkbox" class="ui-multiselect-all" />' + o.selectAllText;
			html += '</label>';
			html += '</li>';
		};
		
		// build options
		$select.find('option').each(function(i){
			var $this = $(this), value = $this.val(), len = value.length, $parent = $this.parent();
			
			if($parent.is("optgroup")){
				var label = $parent.attr("label");
				
				if($.inArray(label, optgroups) === -1){
					html += '<li class="multiSelect-optgroup-label"><span>' + label + '</span></li>';
					optgroups.push(label);
				}
			}
			
			if(len > 0){
				html += $this.parent().is("optgroup") ? '<li class="multiSelect-optgroup">' : '<li>';
				html += '<label class="ui-corner-all"><input type="checkbox" name="' + $select.attr('name') + '" value="' + value + '"';
				if($this.is(':selected')) html += ' checked="checked"';
				html += ' />' + $this.html() + '</label></li>';
			};
		});
		html += '</ul></div>';
		
		// cache queries
		$select  = $select.after(html).next('a.multiSelect');
		$options = $select.next('div.multiSelectOptions');
		
		// the select box events
		$select
		.bind('mouseover mouseout', function(e){
			$(this)[(e.type === 'mouseover') ? 'addClass' : 'removeClass']('ui-state-hover');
			toggleArrow();
		})
		.bind('focus blur', function(e){
			$(this)[(e.type === 'focus') ? 'addClass' : 'removeClass']('ui-state-focus');
		})
		.bind('click', function(e){
			$options.trigger( $options.is(':hidden') ? 'open' : 'close' );
		})
		.bind('keydown', function(e){
			switch(e.keyCode){
				case 40: // down
				case 32: // space
					if(!$options.is(':visible')){
					
						// go to the first option
						$options.find('li:first label').trigger('mouseenter open');
						
					} else { 
						$options.trigger('close');
					}
					e.preventDefault();
					break;
					
				case 27: // esc
					$options.trigger('close');
					break;
			};
		})
		.each(function(){
			// update the number of selected elements when the page initally loads
			updateSelected();
		});
		
		
		// create custom option events
		$options.bind({
			'close': function(e, others){
				others = others || false;
			
				// hides all other options but the one clicked
				if(others === true){
					$('div.multiSelectOptions')
					.filter(':visible')
					.fadeOut(o.closeSpeed)
					.prev("a.multiSelect")
					.removeClass('ui-state-active')
					.trigger('mouseout');
					
					// TODO: implement onClose for all options 
					
				// hides the clicked options
				} else {
					$select.removeClass('ui-state-active').trigger('mouseout');
					$options.fadeOut(o.closeSpeed);
					o.onClose.call($options[0]);
				};
				
			},
			'open': function(e){
				var offset = $select.position(), timer, listHeight = 0, top;
			
				// hide all other options
				$options.trigger("close", [true]);
				
				// determine positioning
				if(o.position === 'middle'){ // middle
					top = (offset.top - $options.outerHeight()/2);
					
				} else if(o.position === 'above'){ // above
					console.log( $options.outerHeight() - offset.top );
					top = (offset.top-$options.outerHeight());
					
				} else { // below, default
					top = (offset.top + $select.outerHeight());
				}
			
				// show the options div + position it
				$options.css({ position:'absolute', top:top+'px', left:offset.left + 'px' }).show();
				
				o.onOpen.call($options[0]);
			
			},
			'traverse': function(e, start, keycode){
				var $start = $(start), $next;
				
				// remove classes from all other labels
				$start.removeClass('ui-state-active ui-state-hover ui-state-focus');
			
				$next = $start
					.parent()[ (keycode === 38 || keycode === 37) ? 'prev' : 'next' ]('li')
					.find('label')
					.trigger('mouseenter');
					
				// if up and at the bottom, move to the top
				if(!$next.length){
					switch(keycode){
						case 38: $options.find('label:last').trigger('mouseover'); break;
						case 40: $options.find('label:first').trigger('mouseover'); break;
					};
				};

				// adjust the viewport if necessary
				// adjustViewport();
				e.preventDefault();
			}
		})
		.find("label")
		.bind('mouseenter mouseleave', function(e){
			$(e.target)[ (e.type === 'mouseenter') ? 'addClass' : 'removeClass' ]('ui-state-hover').find("input").focus();
		})
		.bind('click', function(e){
			var $target = $checkbox = $(e.target);
			
			// only perform logic on the checkbox
			if( $target.is("label") ){
				return;
			}
			
			var $inputs = $options.find('input').not('input.ui-multiselect-all');
			var $checkall, numInputs, numChecked;

			// select all?
			if($checkbox.hasClass('ui-multiselect-all')){
			
				if($checkbox.is(":checked")){
					$inputs.attr('checked', 'checked');
				} else {
					$inputs.removeAttr('checked');
				};
				
			// individual box
			} else {
			
				$checkall = $options.find('input.ui-multiselect-all');
				numInputs = $inputs.length;
				numChecked = $inputs.filter('input:checked').length;

				if(numChecked < numInputs){
					$checkall.removeAttr('checked');
				} else if(numChecked === numInputs){
					$checkall.attr('checked','checked');
				};
		
				//$container.prev('a.multiSelect').focus();
				o.onCheck.call( $checkbox[0] );
			};
			
			updateSelected();
		})
		.bind('keypress', function(e){
			if($options.is(':visible')){
			
				switch(e.keyCode){
					
					case 9: // tab
						$options.trigger('close');
						$select.next(":input").focus();
						break;
				
					case 27: // esc
						$options.trigger('close');
						break;
				
					case 38: // up
					case 40: // down
					case 37: // left
					case 39: // right
						$options.trigger('traverse', [this, e.keyCode]);
						break;
					
					case 13: // enter
					case 32: // space
						$label.trigger('click', e.keyCode);
						break;
				};
			
			// dropdown is not visible
			} else {
				
				switch(e.keyCode){
				
					 // down, enter, space
					case 38:
					case 40:
					case 13:
					case 32:
						// show dropdown
						$this.removeClass('ui-state-focus').trigger('click');
						$options.find('label:first').addClass('ui-state-hover');
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
		// apply bgiframe if available
		if($.fn.bgiframe){
			$options.bgiframe();		}
		
		// remove the original form element
		$original.remove();

		function toggleArrow(){
			$select.find("img").attr('src', ($select.hasClass('ui-state-hover') || $select.hasClass('ui-state-focus') ? 'arrow_hover.gif' : 'arrow.gif') );
		};
		
		function updateSelected(){
			var $input = $options.prev('a.multiSelect').find('input'),
			    display = '',
			    $inputs = $options.find('input:checkbox').not('input.ui-multiselect-all'),
			    $checked = $inputs.filter('input:checked'),
			    numChecked = $checked.length;
			
			if(numChecked === 0){
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
					$input.val( o.oneOrMoreSelected.replace('%', numChecked) );
				};
			};

		};
		
		function adjustViewport(){
			var $label = $options.find('label.ui-state-hover');
			
			if(!$label.length){
				$options.scrollTop(0);
				return;
			}
			
			// check for and move down
			//var selectionBottom = $options.find('label.ui-state-hover').position().top + $options.find('label.ui-state-hover').outerHeight();
		
			//if(selectionBottom > $options.innerHeight()){
			//	$options.scrollTop( $options.scrollTop() + selectionBottom - $options.innerHeight());
			//}
		
			// check for and move up
			//if($options.find('label.ui-state-hover').position().top < 0){		
			//	$options.scrollTop($options.scrollTop() + $options.find('label.ui-state-hover').position().top);
			//}
			
			/*
			var i = 0,
			    selectionTop = 0,
			    selectionHeight = 0,
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
			*/
		};
	};
	
	// close each select when clicking on any other element
	$(document).bind("click", function(e){
		var $target = $(e.target);

		if($target.closest("div.multiSelectOptions").length === 0 && !$target.parent().hasClass("multiSelect")){
			$("div.multiSelectOptions").trigger("close", [true]);
		}
	});
	
	// default options
	$.MultiSelect.defaults = {
		selectAll: true,
		selectAllText: 'Check all',
		noneSelected: 'Select options',
		oneOrMoreSelected: '% selected',
		position: 'middle', /* above|middle|below */
		applyShadow: true,
		closeSpeed: 200,
		onCheck: function(){},
		onOpen: function(){},
		onClose: function(){}
	};

})(jQuery);
