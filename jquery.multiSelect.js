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
		var $select = $(select), $options, html = '', optgroups = [];
		
		html += '<a class="multiSelect ui-state-default ui-corner-all"><input readonly="readonly" type="text" value="" /><img src="arrow.gif" class="multiSelect-arrow" alt="" /></a>';
		html += '<div class="multiSelectOptions multiSelectOptionsShadow ui-widget ui-widget-content ui-corner-bl ui-corner-br ui-corner-tr">';
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
				html += '<label class="ui-corner-all"><input type="checkbox" name="' + $select.attr('name') + '" value="' + len + '"';
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
		.bind('mouseover mouseout focus blur', function(e){
			$(this)[(e.type === 'mouseover') ? 'addClass' : 'removeClass']('ui-state-hover');
			toggleArrow();
			e.preventDefault();
		})
		.bind('click', function(e){
			if($options.is(':hidden')){
				$(this).addClass('ui-state-active');
				open();
			} else {
				$(this).removeClass('ui-state-active');
				close();
			};
			
			e.preventDefault();
		})
		.bind('keydown', function(e){
			switch(e.keyCode){
				case 40: // down
				case 32: // space
					if(!$options.is(':visible')){
					
						// go to the first option
						$options.find('li:first label').trigger('mouseenter');
						
						open();
					} else { 
						close();
					}
					e.preventDefault();
					break;
					
				case 27: // esc
					close();
					break;
			};
		})
		.find("input").bind('focus blur', function(e){
			$(this)
			.parent()
			[(e.type === 'focus') ? 'addClass' : 'removeClass']('ui-state-focus')
			[(e.type === 'focus') ? 'focus' : 'blur']();
			toggleArrow();
		});
		
		// options
		$options
		.each(function(){
			updateSelected();
		})
		.bind("mouseleave", function(){
			setTimeout(function(){
				close(); 
				$select.unbind("hover");
			}, o.hideDelay);
		})
		.find("label")
		.bind('mouseenter mouseleave', function(e){
			var $target = $(e.target);
			$target.focus()[ (e.type === 'mouseenter') ? 'addClass' : 'removeClass' ]('ui-state-hover');
		})
		.bind('click', function(e){
			var $target = $(e.target),
			    $inputs = $options.find('input').not('input.ui-multiselect-all'),
			    $checkall, numInputs, numChecked;
			
			// select all?
			if($target.hasClass('ui-multiselect-all')){
			
				if($target.is(":checked")){
					$inputs.attr('checked', 'checked');
				} else {
					$inputs.removeAttr('checked');
				};
				
			} else {
			
				$checkall = $options.find('input.ui-multiselect-all');
				numInputs = $inputs.length;
				numChecked = $inputs.filter(':checked').length;

				if(numChecked < numInputs){
					$checkall.removeAttr('checked');
				} else if(numChecked === numInputs){
					$checkall.attr('checked','checked');
				};
		
				//$container.prev('a.multiSelect').focus();
				o.onCheck.call( $target );
			};
			
			updateSelected();
		})
		.bind('keypress', function(e){
			var $this = $(this), $next;

			if($options.is(':visible')){
			
				switch(e.keyCode){
					
					case 9: // tab
						close();
						$select.next(":input").focus();
						break;
				
					case 27: // esc
						close();
						break;
				
					case 38: // up
					case 40: // down
					case 37: // left
					case 39: // right
					
						// remove hover class from all other options
						$options.find("label").removeClass('ui-state-hover');
					
						$next = $this
							//.removeClass('ui-state-hover')
							.parent()[ (e.keyCode === 38 || e.keyCode === 37) ? 'prev' : 'next' ]('li')
							.find('label')
							.trigger('mouseover');
							
						// if up and at the bottom, move to the top
						if(!$next.length){
							switch(e.keyCode){
								case 38: $options.find('label:last').trigger('mouseover'); break;
								case 40: $options.find('label:first').trigger('mouseover'); break;
							};
						};

						// adjust the viewport if necessary
						adjustViewport();
						e.preventDefault();
						break;
					
					case 13: // enter
					case 32: // space
						$label.find('input').trigger('click');
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
		$select.prev().remove();
		
		function toggleArrow(){
			$select.find("img").attr('src', ($select.hasClass('ui-state-hover') || $select.hasClass('ui-state-focus') ? 'arrow_hover.gif' : 'arrow.gif') );
		};
		
		function open(){
			var offset = $select.position(), timer, listHeight = 0;
			
			// hide all other options
			close(true);
			
		
			// show the options div + position it
			$options
				//.css({ position:'absolute', top:(offset.top + $select.outerHeight())+'px', left: offset.left+'px' })
				.css({
					position: 'absolute',
					top: (offset.top - $options.outerHeight()/2) + 'px',
					left: offset.left + 'px'
				})
				.show();
				//.slideDown(o.slideSpeed);
				//.find('label')
				//.removeClass('ui-state-hover');
				
			adjustViewport();
			
			/* IE6 does not support max-height */
			if($.browser.msie && typeof document.body.style.maxHeight === "undefined"){
				$options.children().each(function(){
					listHeight += this.offsetHeight;
				});
		
				// TODO - made this height configurable
				if(listHeight > 175) $options.css({ height: '175px' });
			};
		};

		function close(others){
			others = others || false;
			
			// hides all other options but the one clicked
			if(others){
			
				$('div.multiSelectOptions')
				.filter(':visible')
				.fadeOut(o.slideSpeed)
				.prev("a.multiSelect")
				.removeClass('ui-state-active ui-state-focus');
			
			// hides the clicked options
			} else {
				$select.removeClass('ui-state-active ui-state-focus');
				$options.fadeOut(o.slideSpeed);
			};
		};
		
		function check(e){
			var $this = $(this), 
			    $checkall = $options.find('input.ui-multiselect-all'),
			    $inputs = $options.find('input').not('.ui-multiselect-all'),
			    numInputs = $inputs.length,
			    numChecked = $inputs.filter(':checked').length;
			
			updateSelected();
			
			if(numChecked < numInputs){
				$checkall.removeAttr('checked');
			} else if(numChecked === numInputs){
				$checkall.attr('checked','checked');
			};
			
			$container.prev('a.multiSelect').focus();
			o.onCheck.call($this);
		};
		
		function updateSelected(){
			var display = '',
			    $inputs = $options.find('input:checkbox').not('input.ui-multiselect-all'),
			    $checked = $inputs.filter('input:checked'),
			    $input = $options.prev('a.multiSelect').find('input'),
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

	
	// default options
	$.MultiSelect.defaults = {
		selectAll: true,
		selectAllText: 'Check all',
		noneSelected: 'Select options',
		oneOrMoreSelected: '% selected',
		slideSpeed: 200,
		height: 200,
		hideDelay: 500,
		onCheck: function(){}
	};

})(jQuery);
