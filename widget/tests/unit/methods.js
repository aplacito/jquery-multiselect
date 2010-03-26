(function($){

	module("multiselect", "methods");

	test("disable", function(){
		expect(1);
	 
		el = $(template).multiselect().multiselect("disable");
		equals( widget().is(":disabled"), true, 'Disable widget');
		el.remove();
	});
	
	test("enable", function(){
		expect(1);
	 
		el = $(template).multiselect().multiselect("disable").multiselect("enable");
		equals( widget().is(":disabled"), false, 'widget disabled after disabling then re-enabling?');
		el.remove();
	});
	
	test("checkAll", function(){
		expect(1);
	 
		el = $(template).multiselect().multiselect("checkAll");
		equals( el.find("option").filter(":selected") === el.find("option").length, true, 'All options checked on the original?');
		el.remove();
	});

})(jQuery);
