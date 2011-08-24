/**
 * Spin Global Tests
 */
var SpinTests = {
	
	initTest: function (){
		module('$.spin');
	},
	
	/**
	 * $.spin.configure must be called with an argument and that
	 * argument must be a function.
	 *
	 * @author		hello@spinjs.com
	 * @date		Aug 24, 2011
	 * @since		1.0
	 * @version		1.0
	 */
	configureTest: function (){
		
		SpinTests.initTest();
		
		/*
		we must do that because test functions are not executed right away.
		they are executed after the document has finished loading!
		$.spin.configure is designed to deny calls to it after document load.
		*/
		$.holdReady(true);
		
		test('Testing bad calls to configure', function (){			
		    //wrong arguments
		    var wrong_args = [
		        null,
		        undefined,
		        [],
		        {},
		        true,
		        false,
		        0,
		        1,
		        -1,
		        Infinity,
		        -Infinity,
		        NaN,
		        'function',
				''
		    ];

		    var i=0, n=wrong_args.length;
	
			//testing the function with no argument
		    raises(function(){ $.spin.configure(); },
		        'throw if no argument at all');

		    //testing the function with wrong arguments
		    for (; i<n; i++){
		        raises(function(){ $.spin.configure( wrong_args[i] ); }, 
		            'throw if argument is not a function');
		    }

		    $.holdReady(false);                               			
		});
	},
	
	/**
	 * We should not be able to call $.spin.configure after 
	 * that the environment is initialized. (i.e. document has finished loading)
	 *
	 * @author		hello@spinjs.com
	 * @date		Aug 24, 2011
	 * @since		1.0
	 * @version		1.0
	 */
	configureAfterInitTest: function(){
		SpinTests.initTest();
		test('Trying to configure after initialization', function (){
			function dummyFn(){};
			raises(function(){
				$.spin.configure(dummyFn);
			});
		});
	}
};