/*
 * jQuery multiSelect 0.1
 * by Eric Hynds, 2010
 *
 * Based off of Cory S.N. LaViska's implementation, A Beautiful Site (http://abeautifulsite.net/) 2009
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
			opts = $.extend({}, MultiSelect.defaults, opts);

			return this.each(function(){
				new MultiSelect(this, opts);
			});
		}
	});
		var MultiSelect = function(select,o){
		var $select = $original = $(select), $options, $labels, html = '', optgroups = [];
		
		//html += '<a class="multiSelect ui-state-default ui-corner-all"><input readonly="readonly" type="text" value="" /><img src="arrow.gif" class="multiSelect-arrow" alt="" /></a>';
		html += '<a class="ui-multiselect ui-state-default ui-corner-all"><input readonly="readonly" type="text" value="" /><span class="ui-icon ui-icon-triangle-1-s"></span></a>';
		html += '<div class="ui-multiselect-options' + (o.shadow ? ' ui-multiselect-shadow' : '') + ' ui-widget ui-widget-content ui-corner-bl ui-corner-br ui-corner-tr">';
	
		if(o.showHeader){
			html += '<div class="ui-widget-header ui-helper-clearfix ui-corner-all ui-multiselect-header">';
			html += '<ul class="ui-helper-reset">';
			html += '<li><a class="ui-multiselect-all" href=""><span class="ui-icon ui-icon-check"></span>' + o.checkAllText + '</a></li>';
			html += '<li><a class="ui-multiselect-none" href=""><span class="ui-icon ui-icon-closethick"></span>' + o.unCheckAllText + '</a></li>';
			html += '<li class="ui-multiselect-close"><a href="" class="ui-multiselect-close ui-icon ui-icon-circle-close"></a></li>';
			html += '</ul>';
			html += '</div>';
		}
		
		// build options
		html += '<ul class="multiselect-checkboxes ui-helper-reset">';
		$select.find('option').each(function(i){
			var $this = $(this), value = $this.val(), len = value.length, $parent = $this.parent();
			
			if($parent.is("optgroup")){
				var label = $parent.attr("label");
				
				if($.inArray(label, optgroups) === -1){
					html += '<li class="multiselect-optgroup-label"><span>' + label + '</span></li>';
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
		$select  = $select.after(html).next('a.ui-multiselect');
		$options = $select.next('div.ui-multiselect-options');
		$header  = $options.find('div.ui-multiselect-header');
		$labels  = $options.find("label");
		
		// the select box events
		$select
		.bind('mouseover mouseout', function(e){
			$(this)[(e.type === 'mouseover') ? 'addClass' : 'removeClass']('ui-state-hover');
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
		
		
		// header links
		if(o.showHeader){
			$header.find("a").click(function(e){
				var $target = $(e.target);
			
				// close link
				if($target.hasClass("ui-multiselect-close")){
					$options.trigger('close');
			
				// check all / uncheck all
				} else {
					$options.trigger('toggleChecked', [($target.hasClass("ui-multiselect-all") ? true : false)]);
				}
			
				e.preventDefault();
			});
		}
		
		// bind custom events to the options div
		$options.bind({
			'close': function(e, others){
				others = others || false;
			
				// hides all other options but the one clicked
				if(others === true){
					$('div.ui-multiselect-options')
					.filter(':visible')
					.fadeOut(o.fadeSpeed)
					.prev("a.ui-multiselect")
					.removeClass('ui-state-active')
					.trigger('mouseout');
					
				// hides the clicked options
				} else {
					$select.removeClass('ui-state-active').trigger('mouseout');
					$options.fadeOut(o.fadeSpeed);
				};
			},
			'open': function(e){
				var offset = $select.position(), timer, listHeight = 0, top;
				
				// calling select is active
				$select.addClass('ui-state-active');
				
				// hide all other options
				$options.trigger("close", [true]);
				
				// determine positioning
				if(o.position === 'middle'){
					top = (offset.top-$options.outerHeight()/2);
					
				} else if(o.position === 'top'){
					top = (offset.top-$options.outerHeight());
					
				} else {
					top = (offset.top + $select.outerHeight());
				}
				
				// select the first option
				$labels.filter("label:first").trigger("mouseenter");
				
				// show the options div + position it
				$options
				.css({ 
					position: 'absolute',
					top: top+'px',
					left: offset.left + 'px',
					width: $select.outerWidth()-8 + 'px' // TODO get actual padding
					//width:$select.width()-($options.outerWidth()-$options.width())+'px'
				})
				.show()
				.scrollTop(0);
				
				// set the height of the checkbox container
				if(o.maxHeight){
					$options.find("ul.multiselect-checkboxes").css("height", o.maxHeight );
				}
				
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

				e.preventDefault();
			},
			'toggleChecked': function(e, flag){
				if(flag){
					$labels.find("input").attr("checked","checked"); 
				} else {
					$labels.find("input").removeAttr("checked");
				}
				
				updateSelected();
			}
		});
		
		
		// labels
		$labels
		.bind('mouseenter', function(e){
			$labels.removeClass('ui-state-hover');
			$(this).addClass('ui-state-hover').find("input").focus();
		})
		.bind('click', function(e){
			var $target = $(e.target);

			// only perform logic on the checkbox
			if( $target.is("label") ){
				return;
			}
			
			o.onCheck.call( $target[0] );
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
						$label.trigger('click', [e.keyCode]);
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

		function updateSelected(){
			var $input = $options.prev('a.ui-multiselect').find('input'),
			    $inputs = $labels.find('input'),
			    $checked = $inputs.filter('input:checked'),
			    value = '',
			    numChecked = $checked.length;
			
			if(numChecked === 0){
				$input.val( o.noneSelected );
			} else {
			
				// list items?
				if(o.selectedList){
					$checked.each(function(){
						var text = $(this).parent().text();
						value = (value.length) ? (value += ', ' + text) : text;
					});
					
				} else {
					value = o.selectedText.replace('%', numChecked);
					
				};
				
				$input.val( value ).attr("title", value);
			};
		};
	}
	
	// close each select when clicking on any other element/anywhere else on the page
	$(document).bind("click", function(e){
		var $target = $(e.target);

		if(!$target.closest("div.ui-multiselect-options").length && !$target.parent().hasClass("ui-multiselect")){
			$("div.ui-multiselect-options").trigger("close", [true]);
		}
	});
	
	// default options
	MultiSelect.defaults = {
		showHeader: true,
		maxHeight: 175, /* max height of the checkbox container (scroll) in pixels */
		checkAllText: 'Check all',
		unCheckAllText: 'Uncheck all',
		noneSelected: 'Select options',
		selectedList: false,
		selectedText: '% selected',
		position: 'bottom', /* top|middle|bottom */
		shadow: false,
		fadeSpeed: 200,
		onCheck: function(){},
		onOpen: function(){}
	};

})(jQuery);
