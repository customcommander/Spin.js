/**
 * Environment Tests
 */
 
/**
 * @author      hello@spinjs.com
 * @date        2011-08-24
 * @since       1.0
 * @version     1.0
 */
function env_basic_test(){
    module('Env');
    
    var winWidth  = Env.winWidth,
		fullWidth = winWidth,
		minWidth  = Math.floor(winWidth / 3),
		maxWidth  = Math.floor(winWidth - minWidth);											
	
	test('Testing some environment variables', function(){
		ok(Env.hasOwnProperty('winWidth') && $.type(Env.winWidth)==='number' && Env.winWidth>0, 
			'Env.winWidth exists and is greater than 0');						
		ok(Env.hasOwnProperty('isSingle') && $.type(Env.isSingle)==='boolean', 
			'Env.isSingle exists and is a boolean');						
		ok(Env.hasOwnProperty('isDual') && $.type(Env.isDual)==='boolean', 
			'Env.isDual exists and is a boolean');						
		ok((Env.isSingle && !Env.isDual) || (Env.isDual && !Env.isSingle), 
			'Env.isSingle and Env.isDual are mutually exclusive');
	});
	
	test('Testing Env.fullCss', function (){
		strictEqual(Env.fullCss.left, 0);
		strictEqual(Env.fullCss.width, winWidth);
	});
	
	if (Env.isDual){
		test('Testing Env.minCss', function (){
			strictEqual(Env.minCss.left, 0);
			strictEqual(Env.minCss.width, minWidth);
		});					
		test('Testing Env.maxCss', function (){
			strictEqual(Env.maxCss.left, minWidth);
			strictEqual(Env.maxCss.width, maxWidth);
		});
		test('Testing Env.hideLeftCss', function (){
			strictEqual(Env.hideLeftCss.left, -maxWidth);
			strictEqual(Env.hideLeftCss.width, maxWidth);
		});
		test('Testing Env.hideRightCss', function (){
			strictEqual(Env.hideRightCss.left, winWidth);
			strictEqual(Env.hideRightCss.width, maxWidth);
		});
	} else {
		test('Testing Env.hideLeftCss', function (){
			strictEqual(Env.hideLeftCss.left, -winWidth);
			strictEqual(Env.hideLeftCss.width, winWidth);
		});
		test('Testing Env.hideRightCss', function (){
			strictEqual(Env.hideRightCss.left, winWidth);
			strictEqual(Env.hideRightCss.width, winWidth);
		});
	}
}

/**
 * @author      hello@spinjs.com
 * @date        2011-08-24
 * @since       1.0
 * @version     1.0
 */
function env_default_loader_test(){
    module('Env');
    
    test('Testing default loader', function (){            
        //making jQuery objects with wrong values for data-url attribute
        var elts = [
            $('<a></a>').data('url', null),             
            $('<a></a>').data('url', undefined),
            $('<a></a>').data('url', 0),                
            $('<a></a>').data('url', 1),                
            $('<a></a>').data('url', true),             
            $('<a></a>').data('url', false),            
            $('<a></a>').data('url', []),               
            $('<a></a>').data('url', {}),               
            $('<a></a>').data('url', '          '),     
            $('<a></a>').data('url', '          '),
            $('<a></a>').data('url', "\n"),
            $('<a></a>').data('url', "\t"),
            $('<a></a>').data('url', function(){})
        ];
        
        var i=0, n=elts.length;

		//testing with no data-url attribute at all
        raises(function(){ Env.loader( $('<a></a>') ); }, 
            'throw if clicked element has no data-url attribute');
        
        //testing with wrong values
        for (; i<n; i++){
            raises(function(){ Env.loader( elts[i] ); }, 
                'throw if clicked element has wrong value for data-url attribute');                
        }    
    });    
}