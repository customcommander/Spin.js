/*!
 * Spin.js 1.0
 * http://spinjs.com
 * 
 * Copyright 2011, Julien Gonzalez
 *
 * Includes jQuery JavaScript Library v1.6.1
 * http://jquery.com/
 * Copyright 2011, John Resig                                                 
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license   
 *
 * Includes CSS Reset, CSS Base, CSS Fonts
 * Copyright (c) 2010, Yahoo! Inc. All rights reserved.
 * Code licensed under the BSD License:
 * http://developer.yahoo.com/yui/license.html                                               
 *
 * This file is part of Spin.js.
 *
 * Spin.js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Spin.js is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Spin.js.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @name $
 * @namespace jQuery
 */
 

/**
 * Spin.js allows web developers to design applications as a logical
 * and continuous flow of screens.
 *
 * @author              customcommander
 * @since               1.0.0
 */
(function ($){    
    
//------------------------------------------------------------------------------
//-- Env (Private API) ---------------------------------------------------------
//------------------------------------------------------------------------------
    
    /**
     * If at any given time the browser window becomes lower than 640px wide, 
     * the environment is put on "Single Mode".
     *
     * There is only one panel visible and it takes all the width available.
     *
     * @concept
     * @name Single Mode Environment
     */
     
    /**
     * If at any given time the browser window width is between 640px (not including)
     * and 960px (including), the environment is put on "Dual Mode".
     *
     * There are two visible panels. They equally share all the width available.
     *
     * @concept
     * @name Dual Mode Environment
     */
     
    /**
     * If at any given time the browser window becomes greater than 960px,
     * the environment is put on "Optimized Mode".
     *
     *
     * @concept
     * @name Optimized Mode Environment
     */
      
    /**
     * @spin
     * @name Env
     * @namespace Environment Management (private)
     * @private
     */
    var Env = /**@lends Env*/{
    
        winWidth:       null,        
        
        /**
         * Path to the directory containing Spin.js files
         * @type    String
         */
        basePath:       null,                
        
        /**#@+
         * @type    jQuery
         */
        /**Reference to the document body*/
        body:           null,
        
        /**Reference to the panels stack*/
        panels:         null,
        /**#@-*/
        
        /**#@+
         * @type    Boolean
         */        
        /**True if environment has been initialized*/
        initialized:    false,
        
        /**True if the next panel can be appended directly into visible range*/
        freeSlot:       false,
        
        /**True if environment is in Single mode*/
        isSingle:       false,
                
        /**True if environment is in Dual mode*/
        isDual:         false,
        
        /**True if environment is in Optimized mode*/
        isOptimized:    false,
        
        /**True if environment was 'Single' before resizing*/
        wasSingle:      false,
        
        /**True if environment was 'Dual' before resizing*/
        wasDual:        false,
        
        /**True if environment was 'Optimized' before resizing*/
        wasOptimized:   false,
        /**#@-*/
        
        /**#@+
         * @type    Object  CSS key/value pairs
         */        
        /**CSS applied to the panel sitting at Stack.min index*/
        minCss:         null,
        
        /**CSS applied to the panel sitting at Stack.max index*/
        maxCss:         null,
        
        /**CSS applied to panels that must be hidden at left*/
        hideLeftCss:    null,
        
        /**CSS applied to panels that must be hidden at right*/
        hideRightCss:   null,
        
        /**CSS applied to panels that must be shown at full width*/
        fullCss:        null,
        /**#@-*/
        
        configure: function (){
            var winWidth = $(window).width(), //window width
                minWidth,                     //panel width at min index
                maxWidth;                     //panel width at max index                

            this.winWidth     = winWidth;
            
            this.wasSingle    = this.isSingle;
            this.wasDual      = this.isDual;
            this.wasOptimized = this.wasOptimized;

            this.isSingle     = (winWidth<640);                                    
            this.isDual       = (winWidth>=640 && winWidth<960);
            this.isOptimized  = (winWidth>=960);
            
            if (this.isSingle){                
                this.hideLeftCss  = { left:-winWidth, width: winWidth };
                this.hideRightCss = { left: winWidth, width: winWidth };
                this.fullCss      = { left: 0,        width: winWidth };
                        
            } else if (this.isDual){
                maxWidth = Math.floor(winWidth/2);
                
                this.minCss       = { left: 0,        width: maxWidth };    
                this.maxCss       = { left: maxWidth, width: maxWidth };                
                this.hideLeftCss  = { left:-maxWidth, width: maxWidth };
                this.hideRightCss = { left: winWidth, width: maxWidth };
                this.fullCss      = { left: 0,        width: winWidth };
                            
            } else if (this.isOptimized) {
                minWidth = Math.floor(winWidth/3);
                maxWidth = Math.floor(winWidth-minWidth);
                
                this.minCss       = { left: 0,        width: minWidth };    
                this.maxCss       = { left: minWidth, width: maxWidth };                
                this.hideLeftCss  = { left:-maxWidth, width: maxWidth };
                this.hideRightCss = { left: winWidth, width: maxWidth };
                this.fullCss      = { left: 0,        width: winWidth };          
            }            
        },
        
        /**
         * Throws an Error object and displays its message into a panel.
         *
         * @author          customcommander
         * @since           1.0
         * @version         1.0
         * @param           {String} [msg]  Error message
         * @throws          {Error}
         */
        error: function (msg){
            Spin('<h2>' + msg + '</h2>', 'Error!').addClass('error');
            throw new Error(msg);
        },
        
        /**
         * Initializes Env.BASE_PATH
         *
         * <p>Finds the script tag that includes Spin.js and computes the 
         * absolute path to its base directory.</p>
         *
         * <p>The function is executed when Spin.js source file is included.</p>
         *
         * @author          customcommander
         * @since           1.0
         * @version         1.0
         */
        initBasePath: function (){        
            var fullpath  = $('script[src*="src/js/Spin"]').prop('src'); 
            this.basePath = fullpath.substring(0, fullpath.lastIndexOf('src'));
        },
        
        /**
         * Loads Environment CSS.
         *
         * <p>The function is executed when Spin.js source file is included.</p>
         * 
         * @author          customcommander
         * @since           1.0
         * @version         1.0
         */
        loadCss: function (){        
            $('head').append(
                '<link rel="stylesheet" type="text/css" href="' + this.basePath + 'src/css/fonts-min.css" />',
                '<link rel="stylesheet" type="text/css" href="' + this.basePath + 'src/css/reset-min.css" />',
                '<link rel="stylesheet" type="text/css" href="' + this.basePath + 'src/css/base-min.css" />',
                '<link rel="stylesheet" type="text/css" href="' + this.basePath + 'src/css/spin.css" />'
            );
        },
        
        initialize: function (){                    
            Env.configure();
                    
            //Spin.js takes care of its own markup
            $(document.body).append([
                '<div id="spin">',   
                '   <div id="spin-nav-controls">',
                '       <div id="spin-nav-prev"/>',
                '       <div id="spin-nav-next"/>',      
                '   </div>',
                '   <ol id="spin-panels"/>',
                '</div>'
            ].join(''));
            
            //Sets environment variables
            Env.body       = $(document.body);
            Env.panels     = $('#spin-panels');
            
            //Loads the first panel
            Env.loader(Env.body);
            
            //From here until the end, we defines global events handlers
            

            $(window).resize(function (){
                if (Env.winWidth!=$(window).width){
                    Env.configure();
                    Env.resize();
                }
            });
            
            /*
             * This allows to define non navigable zone(s) inside a navigable zone.
             * 
             * A click on a non navigable element will not propagate.
             */
            Env.body.delegate('.no-nav', 'click', function (e){
                e.stopPropagation();
            });
            
            /*
             * A click on any element with the class "nav" or that is contained by 
             * an element with such class executes the loader. 
             * 
             * Note that any default behaviour is prevented.
             */
            Env.body.delegate('.nav', 'click', function (e){
                var elt     = $(this),
                    panel   = elt.panel(),
                    idx     = Stack.indexOf(panel);
                    
                e.preventDefault();                   
                    
                if (!elt.hasClass('loaded')){
                    if (idx<Stack.last){                        
                        Spin.removeAfter(panel);                        
                    }
                                            
                    elt.removeClass('mouseover').addClass('loaded');                    
                    
                    Env.loader(elt);                
                    
                } else if (idx<Stack.last) {                
                    Spin.expand(Stack.panel(idx+1));                
                }
                
            });  
            
            $(document).keypress(function (e){
                var kc = e.keyCode;
                
                if (!$(e.target).is('html')){
                    return;
                }
                
                //left arrow key
                if (kc===37){
                    Spin.previous();
                //right arrow key
                } else if (kc===39){
                    Spin.next();
                }
            });
            
            Env.initialized = true;
        },
        
        /**
         * The loader is in charge of loading the panels.
         *
         * <p>It's probably the most interesting function!</p>
         *
         * <p>The loader is executed by Spin.js each time a click is made on
         * an element with the class 'nav' and gives that element to the loader
         * as its first parameter.</p>
         *
         * <p>The very first execution of the loader occurs after the document has
         * finished to load. Its parameter at that specific time is always the
         * body element.</p>
         *
         * <p>Spin.js defines a default loader (this one) but you can override it 
         * by supplying your own to $.spin.configure().</p>
         * 
         * <pre>
         * //This is how you set you own loader
         * $.spin.configure({
         *      loader: function (elt){
         *          //your loading logic
         *      }
         * });
         * </pre>
         *
         * @author          customcommander
         * @since           1.0
         * @version         1.0
         * @param           {jQuery Object} elt The element which has been clicked or the body when the document loads
         */
        loader: function (elt){              
            /* 
             * This is how the default loader works:
             *
             * The loader assumes that each clicked element (elt) has a data-url
             * attribute and loads that url with some ajax voodoo.
             *
             * <a class="nav" data-url="mymovies.php?genre=scifi">
             *      Click here to see my sci-fi movies
             * </a>
             */
            var url = elt.data('url');
            
            /*
             * Url must be a non empty string!
             */
            url = ($.type(url)!='string' || !$.trim(url)) ? '' : $.trim(url);        

            if (!url){
                Env.error('No url given');
            }
            
            $.ajax({
                url: url,                              
                success: function (html, status, xhr){            
                    Spin(html, elt.panelTitle());                    
                },
                error: function (xhr, status, error){                
                    Env.error(xhr.status + ' ' + error);
                }
            });
        },
        
        /**
         * Resizes the environment
         *
         * @author      customcommander
         * @since       1.0
         * @version     1.0
         */
        resize: function (){
            var min = Stack.min,
                max = Stack.max;
                    
            if (min===0 && max===0){
                Stack.panel(0  ).css(this.fullCss);
                Stack.panel([1]).css(this.hideRightCss);
                
            } else if (this.isSingle){
                if (!this.wasSingle){                                
                    min = max;
                }
                
                Stack.panel([0, max]).css(this.hideLeftCss);
                Stack.panel(max     ).css(this.fullCss);
                Stack.panel([max+1] ).css(this.hideRightCss);
                
            } else {
                if (this.wasSingle){
                    min = max-1;
                }
                
                Stack.panel([0,min]).css(this.hideLeftCss);
                Stack.panel(min    ).css(this.minCss);
                Stack.panel(max    ).css(this.maxCss);
                Stack.panel([max+1]).css(this.hideRightCss);                
            }
            
            Stack.min = min;
            Stack.max = max;
        }
        
    };//<--Env
            
//------------------------------------------------------------------------------
//-- Stack (Private API) -------------------------------------------------------
//------------------------------------------------------------------------------
 
    /**
     * Stack adds and removes panels but also allows to get information about panels.
     *
     * @spin
     * @name Stack
     * @namespace Stack Management (private)
     * @private
     */
    var Stack = /**@lends Stack*/{

        /**
         * Panels selectors (id selector)
         * @type    String[]
         */
        arr: [],
        
        /**#@+
         * @type    Number
         */
        /**Start of visible range.*/
        min: 0,
        
        /**End of visible range.*/
        max: 0,   
        
        /**Last index*/
        last: 0,
        
        /**Panel id (autoincremented).*/
        id: 1,
        /**#@-*/ 
        
        /**
         * Adds a panel both into the Stack and the DOM.
         *
         * @param       {jQuery} panel
         * @returns     {Number} panel index
         */
        push: function (panel){  
            this.last = this.arr.push('#'+panel.attr('id')) - 1; 
            Env.panels.append(panel);
            Env.body.trigger('paneladd.spin', [panel]);                          
            return this.last;
        },
        
        /**
         * Removes a panel both from the Stack and the DOM.
         */
        pop: function (){
            var selector = this.arr.pop(),       //removes from the Stack       
                panel    = $(selector).remove(); //removes from the DOM
            this.last = this.arr.length-1;            
            Env.body.trigger('panelremove.spin', [panel]);
        },                
                    
        /**
         * Returns the Stack index of given panel.
         *
         * @param       {jQuery} panel
         * @returns     {Number}
         */
        indexOf: function (panel){
            var idx,
                selector;
            
            if (!(panel instanceof jQuery) || !panel.is('li.spin-panel')){
                Env.error('no panel given');
            }
            
            selector = '#' + panel.attr('id');
            idx      = $.inArray(selector, this.arr);
            
            if (idx<0){
                Env.error('panel not found');
            }
            
            return idx;
        },
     
        /**
         * Returns panel(s) at given index or range
         *
         * @since       1.0
         * @version     1.0
         * @author      customcommander
         *
         * @param       {Number|Number[]} idx
         * @returns     jQuery
         */   
        panel: function (idx){
            var sel;
            if ($.isArray(idx)){
                sel = this.arr.slice.apply(this.arr, idx).join();
            } else {
                sel = this.arr[idx];
            }
            return $(sel);
        }    
    };
    
//------------------------------------------------------------------------------
//-- Spin (Public API) ---------------------------------------------------------
//------------------------------------------------------------------------------
            
    /**
     * Creates and appends a panel.
     *
     * @example
     * //Creates a panel with no content and no title
     * $.spin();
     *
     * @example
     * //Creates from HTML string
     * $.spin('&lt;p&gt;Hello World&lt;/p&gt;', 'Hello');
     *
     * @example
     * //Creates from jQuery object
     * var html = $('&lt;p&gt;Hello World&lt;/p&gt;');
     * $.spin(html, 'Hello');
     *
     * @spin
     * @name $.spin
     * @exports Spin as $.spin
     * @namespace       Public API to build apps with Spin.js
     * @public
     * @author          customcommander
     * @since           1.0
     * @version         1.0     
     * @param           {String|jQuery} [html]  Body of the panel. Either a HTML string or a jQuery object.
     * @param           {String}        [title] Title of the panel
     * @returns         {jQuery} The panel that has been created
     */
    function Spin(html, title){
        var panel, 
            panelId       = 'panel_' + Stack.id++,
            script,
            i,      //control var 
            n,      //control var
            js,
            expand = false;               
            
        /*
         * If the html parameter is given it must be either a string
         * or a jQuery object.
         */
        if (html && $.type(html)!='string' &&  !(html instanceof jQuery)){
            Env.error('String or jQuery object expected');
        }
        
        /*
         * Converts the html parameter to a jQuery object if it was not
         * already.
         */
        if (!(html instanceof jQuery)){
            html = $(html);
        }
        
        /*
         * If the title parameter was not given, we set it to an empty string.
         * Otherwise the string 'undefined' will be displayed.
         */
        if (title===undefined){
            title = '';
        }
            
        //Base markup of a panel
        panel = $([
            '<li class="spin-panel" id="' + panelId + '">',
            '   <div class="spin-panel-hd">',
            '       <span class="spin-title">' + title + '</span>',
            '   </div>',
            '   <div class="spin-panel-bd"/>',
            '</li>'
        ].join(''));
        
        if (!Stack.arr.length){//i.e. first panel        
            panel.css(Env.fullCss);
        } else if (!Env.isSingle && Env.freeSlot) {
            panel.css(Env.maxCss);
            Env.freeSlot = false;
            Stack.max = Stack.min+1;
        } else {
            panel.css(Env.hideRightCss);
            expand = true;
        }
        
        /*
         * We append to the panel the html without any <script/> nodes.
         * For reason explained below these nodes must be added to the DOM
         * separately.
         */
        panel.find('div.spin-panel-bd').append(html.filter(':not(script)'));                        
       
        //Adds the panel to the DOM
        Stack.push(panel);                
        
        //Gets all <script/> nodes from the original html.
        script = html.filter('script');
        
        if (script.length){
            
            js = [];          
            
            for (i=0, n=script.length; i<n; i++){
                
                /*
                 * We reinject the JavaScript defined between <script></script>
                 * into an anonymous function which "this" value is set to 
                 * the panel that we just have created. 
                 */                
                js.push([                    
                    '(function (){',                   //<-- anonymous function       
                        script.eq(i).text(),           //<-- reinjecting code
                    '}).call($("#' + panelId + '"));'  //<-- setting "this" to the panel
                ].join(''));
            }
            
            /*
             * Adding JavaScript to the DOM after the addition of the panel
             * to the DOM.
             * 
             * We have to do that in order to allow the JavaScript to access 
             * elements defined in the panel.
             * 
             * If the JavaScript has no need to access such elements, it is
             * not necessary to do that but in the other hand we cannot predict
             * what your code does ;-) 
             */
            Env.body.append([
                '<script type="text/javascript">',
                    js.join(''),
                '</script>'
            ].join(''));
        }
        
        return expand? Spin.expand(panel) : panel;
    }
    
    /**
     * 
     * @name        $.spin.configure
     * @function
     * @since       1.0
     * @version     1.0
     * @param   {Function} fn function in charge of loading your panels     
     */
    Spin.configure = function (fn){
        if (!Env.initialized){
            if (!$.isFunction(fn)){
                Env.error('missing or invalid loader');
            }
            Env.loader = fn;
        }
    };      
        
    /**
     * Expands a panel.
     *
     * @name            $.spin.expand
     * @extends         $.spin
     * @function
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @param           {jQuery} panel
     * @returns         {jQuery} panel
     */
    Spin.expand = function (panel){    
        var idx = Stack.indexOf(panel),
            min = Stack.min,
            max = Stack.max;                        
            
        if (Env.isSingle){                
            if (idx<max){
                Stack.panel([idx+1, max+1]).animate(Env.hideRightCss);
            } else if (idx>max){
                Stack.panel([max, idx]).animate(Env.hideLeftCss);
            }   
                        
            Stack.panel(idx).animate(Env.fullCss);                      
            Stack.min = idx;
            Stack.max = idx;                        
            
            return panel;
        }
                    
        if (idx>max){
            if (idx>1){
                Stack.panel([min, idx-1]).animate(Env.hideLeftCss);                        
            }
            
            Stack.panel(idx-1).animate(Env.minCss);
            Stack.panel(idx  ).animate(Env.maxCss);  
                      
            Stack.min = idx-1;
            Stack.max = idx;            
                    
        } else if (idx>0 && idx<=min){     
            Stack.panel([idx+1, max+1]).animate(Env.hideRightCss);
            Stack.panel(idx-1         ).animate(Env.minCss);
            Stack.panel(idx           ).animate(Env.maxCss);            
            
            Stack.min = idx-1;
            Stack.max = idx;
        
        //going straight to the home panel
        } else if (idx===0 && idx<max){
            Stack.panel([1]).animate(Env.hideRightCss);
            Stack.panel(0  ).animate(Env.fullCss);
            
            Stack.min = 0;
            Stack.max = 0;
        }        
        
        return panel;
    };    
    
    /**
     * Removes all panels after given panel.
     *     
     * @name            $.spin.removeAfter
     * @extends         $.spin
     * @function
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @param           {jQuery Object} Panel
     */
    Spin.removeAfter = function (panel){
        var idx      = Stack.indexOf(panel),
            removeFn = $.proxy(Stack.pop, Stack);
            
        if (idx===Stack.last){
            //there is nothing after the last panel.
            return panel;
        }
        
        if (idx<Stack.min){
            Spin.expand(panel);                        
        } else if (Stack.min<Stack.max && idx===Stack.min){
            Env.freeSlot = true;
        }
        
        $.each(Stack.arr.slice(idx+1), removeFn);
        panel.find('.loaded').removeClass('loaded');
        return panel;        
    };
    
    /**
     * Moves to the panel that is on the left of the first panel and returns it.
     * 
     * If 'move' is set to false the function simply returns the panel.
     * Any other value will be disregarded.
     * 
     * If there is no such panel the function returns false.
     *     
     * @name            $.spin.previous
     * @extends         $.spin
     * @function
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @param           {Boolean} [move] if set to false the function just returns the previous panel.
     * @returns         {jQuery|Boolean}
     */
    Spin.previous = function (move){
        var panel; 
            
        if (Stack.min===0 && Stack.max===0){
            return false;
        }                
        
        panel = Stack.panel(Stack.max-1);                               
        
        if ($.type(move)=='boolean' && !move){
            return panel;
        }        
        
        return Spin.expand(panel);        
    };        
    
    /**
     * Moves to the panel that is on the right of the last panel and returns it.    
     * 
     * If 'move' is set to false the function simply returns the panel.
     * Any other value will be disregarded.
     * 
     * If there is no such panel the function returns false.
     *     
     * @name            $.spin.next
     * @extends         $.spin
     * @function
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @param           {Boolean} [move] if set to false the function just returns the next panel.
     */
    Spin.next = function (move){
        var panel;
        
        if (Stack.max===Stack.last){
            return false;
        }
        
        panel = Stack.panel(Stack.max+1);
        
        if ($.type(move)=='boolean' && !move){
            return panel;
        }        
        
        return Spin.expand(panel);        
    };   
    
    $.fn.panel = function (){
        var panel;
        
        if (this.is('li.spin-panel')){
            panel = this;
        } else {
            panel = this.closest('li.spin-panel');
        }
        
        if (!panel.length){
            Env.error('Panel Not Found');
        }
        
        return panel;        
    };
    
    $.fn.panelTitle = function (str){
        var title;
        
        /*
         * If called from a navigable element (or from the body when the 
         * document loads) we return the title of the panel that will be
         * loaded. 
         *
         * In this case, title can be set in several different ways...
         */
        if (this.hasClass('nav') || this.is('body')){
            
            /* 
             * Title is set on a data-title attribute on the element
             *
             * <a class="nav" data-title="My Movies">
             *      Click here to see my movies
             * </a>
             */
            if (this.data('title')){
                return this.data('title');
                
            /*
             * If element also has class 'k-title' we take its text
             *
             * <a class="nav k-title">
             *      My movies
             * </a>
             */
            } else if (this.hasClass('spin-title')){            
                return this.text();
                
            /*
             * Looking for a child with class 'k-title'. We take the text of
             * the first child.
             *
             * <div class="nav">
             *      <h2 class="k-title">My Movies</h2>
             *      <p>
             *          In the next panel you'll see the list of the best
             *          movies of all time!
             *      </p>
             * </div>
             */
            } else if (this.find('.spin-title').length){
                return this.find('.spin-title').eq(0).text();
                
            /*
             * Finally we take the text of the element.
             *
             * <a class="nav">My movies</a>
             */
            } else {
                return this.text();
            }
            
        /*
         * Returning the title of the current panel.
         */
        } else if (this.is('li.spin-panel')) {
            title = this.find('div.spin-panel-hd').find('span.spin-title');
            if (str!==undefined){                
                title.text(str);
                Env.body.trigger('titlechange.spin', [this]);
            }
            return title.text();
        }
    };
    
    $.fn.panelBody = function (html){
        var body;
        
        /*
         * If it's not a panel or if html is given but is neither a string
         * nor a jQuery object we simply return and do nothing.
         */
        if (!this.is('li.spin-panel') ||
            (html && $.type(html)!='string' && !(html instanceof jQuery))){
            return;
        }
        
        body = this.find('div.spin-panel-bd');
        
        /*
         * If html is given we update the panel body with it 
         * before returning it.
         */
        if (html){
            html = (html instanceof jQuery) ? html : $(html);
            body.html(html);
        }
        
        return body;
    };    
    
    Env.initBasePath();
    Env.loadCss();        
    
    /**
     * Throws an Error and displays its message into a panel.
     *
     * <p>Spin.js overrides <a href="http://api.jquery.com/jQuery.error/">jQuery.error</a>
     * with Env.error</p>
     *
     * <p>Developers can re-override it without affecting Spin.js's internal
     * error function.</p>
     *
     * @name            $.error
     * @function
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @see             Env.error
     */
    $.error = Env.error;
    
    /*
     * Extends jQuery with Spin.js public API
     */
    $.extend({spin: Spin});
    
    $(Env.initialize);
    
    //jQuery is awesome!!!
}(jQuery));
