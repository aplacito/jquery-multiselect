/*
 * jQuery MultiSelect Plugin 0.2
 * Copyright (c) 2010 Eric Hynds
 *
 * Inspired by Cory S.N. LaViska's implementation, A Beautiful Site (http://abeautifulsite.net/) 2009
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
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
		var $select = $original = $(select), $options, $labels, html = [], optgroups = [];
		
		html.push('<a class="ui-multiselect ui-state-default ui-corner-all"><input readonly="readonly" type="text" value="" /><span class="ui-icon ui-icon-triangle-1-s"></span></a>');
		html.push('<div class="ui-multiselect-options' + (o.shadow ? ' ui-multiselect-shadow' : '') + ' ui-widget ui-widget-content ui-corner-bl ui-corner-br ui-corner-tr">');
	
		if(o.showHeader){
			html.push('<div class="ui-widget-header ui-helper-clearfix ui-corner-all ui-multiselect-header">');
			html.push('<ul class="ui-helper-reset">');
			html.push('<li><a class="ui-multiselect-all" href=""><span class="ui-icon ui-icon-check"></span>' + o.checkAllText + '</a></li>');
			html.push('<li><a class="ui-multiselect-none" href=""><span class="ui-icon ui-icon-closethick"></span>' + o.unCheckAllText + '</a></li>');
			html.push('<li class="ui-multiselect-close"><a href="" class="ui-multiselect-close ui-icon ui-icon-circle-close"></a></li>');
			html.push('</ul>');
			html.push('</div>');
		};
		
		// build options
		html.push('<ul class="ui-multiselect-checkboxes ui-helper-reset">');
		$select.find('option').each(function(){
			var $this = $(this), value = $this.val(), len = value.length, $parent = $this.parent(), hasOptGroup = $parent.is("optgroup");
			
			if(hasOptGroup){
				var label = $parent.attr("label");
				
				if($.inArray(label, optgroups) === -1){
					html.push('<li class="ui-multiselect-optgroup-label"><span>' + label + '</span></li>');
					optgroups.push(label);
				};
			};
			
			if(len > 0){
				html.push(hasOptGroup ? '<li class="multiSelect-optgroup">' : '<li>');
				html.push('<label class="ui-corner-all"><input type="checkbox" name="' + $select.attr('name') + '" value="' + value + '"');
				if($this.is(':selected')){
					html.push(' checked="checked"');
				};
				html.push(' />' + $this.html() + '</label></li>');
			};
		});
		html.push('</ul></div>');
		
		// cache queries
		$select  = $select.after( html.join('') ).next('a.ui-multiselect');
		$options = $select.next('div.ui-multiselect-options');
		$header  = $options.find('div.ui-multiselect-header');
		$labels  = $options.find("label");

		// build header links
		if(o.showHeader){
			$header.find("a").click(function(e){
				var $target = $(e.target);
			
				// close link
				if($target.hasClass("ui-multiselect-close")){
					$options.trigger('close');
			
				// check all / uncheck all
				} else {
					$options.trigger('toggleChecked', [($target.hasClass("ui-multiselect-all") ? true : false)]);
				};
			
				e.preventDefault();
			});
		};
		
		// the select box events
		$select.bind({
			click: function(){
				$options.trigger( $options.is(':hidden') ? 'open' : 'close' );
			},
			keypress: function(e){
				if(e.keyCode === 27){ // esc
					$options.trigger('close');
				};
			},
			mouseover: function(){
				$(this).addClass('ui-state-hover');
			},
			mouseout: function(){
				$(this).removeClass('ui-state-hover');
			},
			focus: function(){
				$(this).addClass('ui-state-focus');
			},
			blur: function(){
				$(this).removeClass('ui-state-focus');
			}
		});
		
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
				var offset = $select.position(), $container = $options.find("ul:eq(1)"), timer, listHeight = 0, top;
				
				// calling select is active
				$select.addClass('ui-state-active');
				
				// hide all other options
				$options.trigger("close", [true]);
				
				// calculate positioning
				if(o.position === 'middle'){
					top = ( offset.top+($select.height()/2)-($options.outerHeight()/2) );
				} else if(o.position === 'top'){
					top = (offset.top-$options.outerHeight());
				} else {
					top = (offset.top+$select.outerHeight());
				};
				
				// calculate the width
				width = $select.width()-parseInt($options.css('padding-left'))-parseInt($options.css('padding-right'));
				
				// select the first option
				$labels.filter("label:first").trigger("mouseenter");
				
				// show the options div + position it
				$options.css({ 
					position: 'absolute',
					top: top+'px',
					left: offset.left+'px',
					width: width+'px'
				}).show();
				
				// set the scroll of the checkbox container
				$container.scrollTop(0);
				
				// set the height of the checkbox container
				if(o.maxHeight){
					$container.css("height", o.maxHeight );
				};
				
				o.onOpen.call($options[0]);
			},
			'traverse': function(e, start, keycode){
				var $start = $(start), moveToLast = (keycode === 38 || keycode === 37) ? true : false; 
				
				// attempt to move to the next label
				var $next = $start.parent()[ moveToLast ? 'prev' : 'next' ]('li').find('label').trigger('mouseenter');
				
				// if at the first/last element
				if(!$next.length){
					var $container = $options.find("ul:eq(1)");
					
					// move to the first/last
					$options.find('label')[ moveToLast ? 'last' : 'first' ]().trigger('mouseover');
					
					// set scroll position
					$container.scrollTop( moveToLast ? $container.height() : 0 );
				};
			},
			'toggleChecked': function(e, flag){
				var $inputs = $labels.find("input");
				if(flag){
					$inputs.attr("checked","checked"); 
				} else {
					$inputs.removeAttr("checked");
				}
				
				updateSelected();
			}
		});
		
		// labels/checkbox events
		$labels.bind({
			mouseenter: function(){
				$labels.removeClass('ui-state-hover');
				$(this).addClass('ui-state-hover').find("input").focus();
			},
			click: function(e,caller){
				// if the label was clicked, trigger the click event on the checkbox.  IE6 fix
				e.preventDefault();
				$(this).find("input").trigger("click", [true]); 
			},
			keyup: function(e){
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
						e.preventDefault();
						$(this).click();
						break;
				};
			}
		})
		.find('input')
		.bind('click', function(e, label){
			var $this = $(this);
			label = label || false;
			
			// stop this click from bubbling up to the label
			e.stopPropagation();
			
			// if the click originated from the label, stop the click event and manually toggle the checked state
			if(label){
				e.preventDefault();
				if($this.is(":checked")){
					$this.removeAttr("checked");
				} else {
					$this.attr("checked","checked");
				};
			};
			
			o.onCheck.call( $this[0] );
			updateSelected();
		});
		// apply bgiframe if available
		if($.fn.bgiframe){
			$options.bgiframe();		};
		
		// remove the original input element
		$original.remove();

		// update the number of selected elements when the page initally loads
		updateSelected();
		
		function updateSelected(){
			var $input = $select.find("input"),
			    $inputs = $labels.find('input'),
			    $checked = $inputs.filter(":checked"),
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
					value = o.selectedText.replace('#', numChecked).replace('#', $inputs.length);
				};
				
				$input.val( value ).attr("title", value);
			};
		};

		return $options;
	};
	
	// close each select when clicking on any other element/anywhere else on the page
	$(document).bind("click", function(e){
		var $target = $(e.target);

		if(!$target.closest("div.ui-multiselect-options").length && !$target.parent().hasClass("ui-multiselect")){
			$("div.ui-multiselect-options").trigger("close", [true]);
		};
	});
	
	// default options
	MultiSelect.defaults = {
		showHeader: true,
		maxHeight: 175, /* max height of the checkbox container (scroll) in pixels */
		checkAllText: 'Check all',
		unCheckAllText: 'Uncheck all',
		noneSelected: 'Select options',
		selectedList: false,
		selectedText: '# selected',
		position: 'bottom', /* top|middle|bottom */
		shadow: false,
		fadeSpeed: 200,
		onCheck: function(){},
		onOpen: function(){}
	};

})(jQuery);
