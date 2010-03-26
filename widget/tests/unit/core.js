var el;
var template = '<select title="MultiSelect" multiple="multiple"><option value="1">One</option><option value="2">Two</option><option value="3">Three</option></select>';

function widget(){
	return el.multiselect("widget");
}

(function($){

	module("multiselect", "core");

	test("default", function(){
		expect(1);
	 
		el = $(template).multiselect();
			equals( el.is(":hidden"), true, 'Old select is hidden');
		el.remove();
	});

})(jQuery);
