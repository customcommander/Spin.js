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
     * Env - Private API
     *
     * @name            Env
     * @namespace
     * @function
     * @private
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @param           {Object}    [o]             Configuration object key/value pairs object literal
     * @param           {Number}    [o.minWidth]    Minimum width of a panel in pixels
     * @param           {Function}  [o.loader]      Custom loader function
     * @returns         {Object} Configuration object (may differs from the original)     
     */
    function Env(o){
        
        /*
         * Browser window width in pixels
         */
        Env.WINDOW_WIDTH = $(window).width();
        
        /*
         * Calling Env() without argument set the default environment.
         * (e.g. minWidth is 320 and loader is the default loader)
         */
        if (o===undefined || !$.isPlainObject(o)){
            o = {};
        }        
        
        //Set only once!
        if (!Env.PANEL_MINWIDTH){
            Env.PANEL_MINWIDTH = Env.computeMinWidth(o);
        }
                
        Env.MAX_COLUMNS = Math.floor(Env.WINDOW_WIDTH / Env.PANEL_MINWIDTH) || 1;        
        Env.PANEL_WIDTH = Math.round(Env.WINDOW_WIDTH / Env.MAX_COLUMNS);
        
        /*
         * If loader is given it must be a function otherwise we trigger
         * a failure... Come on dude, loader is very important!
         */
        if (o.hasOwnProperty('loader')){            
            if (!$.isFunction(o.loader)){                
                Env.error('Loader is not a function');                
            }            
            //Overrides the default loader.
            Env.loader = o.loader;
        }    
        
        return o;
    }
    
    
//-- Env variables -------------------------------------------------------------

    
    /**
     * Indicates if the environment has been initialized     
     *
     * @default     false
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     * @type        Boolean
     */
    Env.initialized = false;
    
    /**
     * True if the panel width is set to take all the place available.
     */
    Env.maximized = false;
    
    /**
     * Absolute path to base directory that contains Spin.js
     *
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     * @see         Env.initBasePath
     * @type        String
     */
    Env.BASE_PATH = null;
    
    /**
     * Browser window width in pixels     
     *
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     * @type        Number
     */
    Env.WINDOW_WIDTH = 0;        
    
    /**
     * Computed panel width in pixels
     *
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     * @type        Number
     */
    Env.PANEL_WIDTH = 0;        
    
    /**
     * Minimum panel width.
     */
    Env.PANEL_MINWIDTH = 0;
    
    /**
     * Spin.js defines a soft limit to the minimum width of a panel. (pixels.)
     */
    Env.SPIN_MINWIDTH = 320;
    
    /**
     * Minimum panel width before maximization.
     */
    Env.PANEL_FORMER_MINWIDTH = 0;    
    
    /**
     * Maximum number of columns that can be visible
     *
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     * @type        Number
     */
    Env.MAX_COLUMNS = 0;
    
    /**
     * Reference to document body
     *
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     * @type        jQuery Object
     */
    Env.body = null;
    
    /**
     * Reference to stack
     *
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     * @type        jQuery Object
     */
    Env.panels = null;
    
    /**
     * Reference to previous panel control
     *
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     * @type        jQuery Object
     */
    Env.prevCtrl = null;
    
    /**
     * Reference to next panel control
     *
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     * @type        jQuery Object
     */
    Env.nextCtrl = null;

    
//-- Env functions -------------------------------------------------------------
    
    /**
     * Returns the computed minimum width of a panel.
     *
     * @param           {Object} o Configuration object
     * @returns         {Number}
     */
    Env.computeMinWidth = function (o){
        var width;
        
        /*
         * If o.minWidth is not set or is neither a number nor a string
         * we return the default value.
         */
        if (!o.hasOwnProperty('minWidth') || 
            ($.type(o.minWidth)!='string' && $.type(o.minWidth)!='number')){
            return Env.SPIN_MINWIDTH;
            
        /*
         * String
         * We allow o.minWidth to be written like this '30%'
         * @todo implement the feature
         */
        } else if ($.type(o.minWidth)=='string'){            
            return Env.SPIN_MINWIDTH;
            
        /*
         * Number
         * If it's a float we round it down. The width cannot be lower than
         * Spin.js soft limit and not greater than the browser window.
         */
        } else {
            width = Math.floor(o.minWidth);
            return ((width<Env.SPIN_MINWIDTH) && Env.SPIN_MINWIDTH)
                || ((width>Env.WINDOW_WIDTH) && Env.WINDOW_WIDTH)
                || width;
        }
    };
    
    
    /**
     * Throws an Error object and displays its message into a panel.
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @param           {String} [msg]  Error message
     * @throws          {Error}
     */
    Env.error = function (msg){
        Spin('<h2>' + msg + '</h2>', 'Error!').addClass('error');
        throw new Error(msg);
    };
    
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
    Env.initBasePath = function (){        
        var fullpath  = $('script[src*="src/js/Spin"]').prop('src'); 
        Env.BASE_PATH = fullpath.substring(0, fullpath.lastIndexOf('src'));
    };
    
    /**
     * Loads Environment CSS.
     *
     * <p>The function is executed when Spin.js source file is included.</p>
     * 
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     */
    Env.loadCss = function (){        
        $('head').append(
            '<link rel="stylesheet" type="text/css" href="' + Env.BASE_PATH + 'src/css/fonts-min.css" />',
            '<link rel="stylesheet" type="text/css" href="' + Env.BASE_PATH + 'src/css/reset-min.css" />',
            '<link rel="stylesheet" type="text/css" href="' + Env.BASE_PATH + 'src/css/base-min.css" />',
            '<link rel="stylesheet" type="text/css" href="' + Env.BASE_PATH + 'src/css/spin.css" />'
        );
    };
    
    /**
     * Initializes Environment.
     *
     * <ul>
     *      <li>Adds required HTML markup to the DOM</li>
     *      <li>Sets environment variables</li>
     *      <li>Loads the first panel</li>
     *      <li>Defines events handlers</li>
     * </ul>
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @param           {Object} [o] Configuration object
     */
    Env.initialize = function (o){
                
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
        Env.prevCtrl   = $('#spin-nav-prev');
        Env.nextCtrl   = $('#spin-nav-next');
        Env.panels     = $('#spin-panels');
        
        //Validates the configuration object
        o = Env(o);
        
        //Loads the first panel
        Env.loader(Env.body);
        
        //From here until the end, we defines global events handlers
        
        /*
         *
         */        
        $(window).resize(function (){
            var formerWidth = Env.PANEL_WIDTH;
                        
            Env();
            
            //doing this because the window resize event can be fired
            //several times in a row.
            if (Env.PANEL_WIDTH!==formerWidth){                  
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
                target  = $(e.target),
                panel   = elt.panel(),
                idx     = Stack.indexOf(panel);
                
            e.preventDefault();                   
                
            if (!elt.hasClass('loaded')){
                
                panel
                    .find('.loaded')
                    .removeClass('loaded');
                    
                elt
                    .removeClass('mouseover')
                    .addClass('loaded');
                
                if (Stack.next(idx)>0){
                    Stack.remove(Stack.next(idx));
                    Env.togglePrevNextControls();
                }
                
                Env.loader(elt);                
                
            } else {                
                Spin.moveTo(
                    Stack.panelAt(
                        Stack.next(idx)));                
            }
            
        });                
        
        Env.prevCtrl.click(function (){
            var idx = Stack.previous(Stack.min);
            Spin.moveTo(Stack.panelAt(idx));            
        });
        
        Env.nextCtrl.click(function (){
            var idx = Stack.next(Stack.max);
            Spin.moveTo(Stack.panelAt(idx));
        });        
    };
    
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
    Env.loader = function (elt){              
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
    };   
    
    /**
     * Environment Resize.
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0  
     */
    Env.resize = function (){
        var idx = 0,
            n   = Stack.size(),
            newMin,
            newMax,
            pos;                    
        
        newMin = Stack.max - Env.MAX_COLUMNS + 1;
        
        if (newMin<0){
            newMin = 0;
            // Stack.max is updated if there are not enough panels before the last
            // (and including the last) to occupy the browser window and if there
            // are panels available after the last.
            newMax = (Stack.max+1===n) ? Stack.max : Env.MAX_COLUMNS - 1;
            pos    = 0;
        } else {
            newMax = Stack.max;
            pos    = (newMin===0) ? 0 : newMin * -Env.PANEL_WIDTH;
        }
        
        for (; idx<n; idx++){            
            Stack.panelAt(idx).css({
                left:   Math.ceil(pos),
                width:  Env.PANEL_WIDTH
            });
            pos += Env.PANEL_WIDTH;
        }
        
        Stack.min = newMin;
        Stack.max = newMax;
        
        Env.togglePrevNextControls();
    }; 
    
    Env.pack = function (){
        
    }; 
    
    /**
     * Shows or hides previous/next controls
     *
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     */
    Env.togglePrevNextControls = function (){        
        if (Stack.previous(Stack.min)<0){
            Env.prevCtrl.hide('fast');
        } else {            
            Env.prevCtrl.show('fast');
        }
        if (Stack.next(Stack.max)<0){
            Env.nextCtrl.hide('fast');
        } else {
            Env.nextCtrl.show('fast');
        }
    };
        
//------------------------------------------------------------------------------
//-- Stack (Private API) -------------------------------------------------------
//------------------------------------------------------------------------------
 
    /**
     * Stack adds and removes panels but also allows to get information about panels.
     *
     * @private
     */
    var Stack = {

        /**
         * Panels properties.
         * @type        Object[]
         */
        arr: [],
        
        /**
         * Start of visible range.
         * @type        Number
         */
        min: 0,
        
        /**
         * End of visible range.
         * @type        Number
         */
        max: 0,   
        
        /**
         * Panel id (autoincremented).
         * @type        Number
         */
        next_id: 1,         
        
        /**
         * Adds a panel both into the Stack and the DOM.
         *
         * @param       {jQuery} panel
         * @param       {Object} properties
         * @returns     {Number} panel index
         */
        push: function (panel, properties){  
            var i,
                idx;
                
            properties.selector = '#' + panel.attr('id');
                
            if ('full'==properties.expand){
                properties.columns = Env.MAX_COLUMNS;
            } else if ('double'==properties.expand){
                properties.columns = 2;
            } else if ('auto'==properties.expand){
                properties.columns = 2;
            } else {
                properties.columns = 1;
            }
            
            idx = this.arr.push(properties) - 1;            
                        
            Env.panels.append(panel);
            Env.body.trigger('paneladd.spin', [panel]);  
            
            return idx;
        },
        
        /**
         * Removes a panel both from the Stack and the DOM.
         */
        pop: function (){
            var properties = this.arr.pop(),            //removes from the Stack       
                panel = $(properties.selector).remove();//removes from the DOM
            Env.body.trigger('panelremove.spin', [panel]);
        },
        
        /**
         * Returns next index.
         *
         * @param       {Number} idx Stack index
         * @returns     {Number} -1 if idx is the last index
         */
        next: function (idx){
            return ((idx===this.arr.length-1) && -1) || idx+1;
        },
        
        /**
         * Returns previous index.
         *
         * @param       {Number} idx Stack index
         * @returns     {Number} -1 if idx is the first index
         */
        previous: function (idx){
            return ((idx===0) && -1) || idx-1;
        },    
        
        /**
         * Returns the Stack index of given panel.
         *
         * @param       {jQuery} panel
         * @returns     {Number}
         */
        indexOf: function (panel){
            var i, selector;
            
            if (!(panel instanceof jQuery) || !panel.is('li.spin-panel')){
                Env.error('no panel given');
            }
            
            selector = '#' + panel.attr('id');
            
            for (i=0; i<this.arr.length; i++){
                if (this.arr[i].selector===selector){
                    return i;
                }
            }
            
            Env.error('panel not found');
        },
        
        /**
         * Returns panel at given index.
         *
         * @param       {Number} Stack index
         * @returns     {jQuery}
         */
        panelAt: function (idx){
            return $(this.arr[idx].selector);
        },            
        
        /**
         * Returns true if index is within visible range.
         *
         * @param       {Number} idx Stack index
         * @returns     {Boolean}
         * @see         Stack#min
         * @see         Stack#max
         */
        visible: function (idx){
            return (this.min<=idx) && (idx<=this.max);
        },        
        
        /**
         * Returns id for a new panel.
         *
         * @returns     {String}
         * @see         Stack#next_id
         */
        newId: function (){
            return 'panel_' + this.next_id++;
        },
        
        /**
         * Returns position for new panel.
         *
         * @returns     {Number}
         */
        newPosition: function (){
            var i   = Stack.min, 
                n   = Stack.max, 
                pos = 0;
                
            if (this.arr.length){
                for (; i<=n; i++){
                    pos+= this.arr[i].columns * Env.PANEL_WIDTH;
                }
            }
            
            return pos;
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
     * @public
     * @name            $.spin
     * @namespace       
     * @function
     * @author          customcommander
     * @since           1.0
     * @version         1.0     
     * @param           {String|jQuery Object}  [html]  Body of the panel. Either a HTML string or a jQuery object.
     * @param           {String}                [title] Title of the panel
     * @returns         {jQuery Object} The panel that has been created
     */
    function Spin(html, title){
        var panel, 
            panelId       = Stack.newId(),            
            panelSelector = '#' + panelId,   
            panel_idx, 
            panel_pos,                    
            script,
            i,      //control var 
            n,      //control var
            cols_sum,
            js;                    
            
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
            '<li class="spin-panel">',
            '   <div class="spin-panel-hd">',
            '       <span class="spin-title">' + title + '</span>',
            '   </div>',
            '   <div class="spin-panel-bd"/>',
            '</li>'
        ].join(''));
        
        panel_pos = Stack.newPosition();
        
        //Identifying, sizing and positioning
        panel
            .attr('id', panelId)
            .css({
                left:   panel_pos,
                width:  Env.PANEL_WIDTH
            });
        
        /*
         * We append to the panel the html without any <script/> nodes.
         * For reason explained below these nodes must be added to the DOM
         * separately.
         */
        panel.find('div.spin-panel-bd').append(html.filter(':not(script)'));                        
       
        //Adds the panel to the DOM
        panel_idx = Stack.push(panel, {expand:'none'});
        
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
                    '(function (){',                        //<-- anonymous function       
                        script.eq(i).text(),                //<-- reinjecting code
                    '}).call($("' + panelSelector + '"));'  //<-- setting "this" to the panel
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

        /* 
         * We need to compute how much columns are used starting from the 
         * first visible panel. 
         */
        for (i=Stack.min, cols_sum=0; i<=panel_idx; i++){
            cols_sum += Stack.arr[i].columns;
        }
        
        /*
         * If too much columns are used we need to move some panels until 
         * the new panel gets fully visible.
         */
        if (cols_sum>Env.MAX_COLUMNS){
            Spin.moveTo(panel);
        /*
         * The new panel is already fully visible. Updating visible range.
         */
        } else {
            Stack.max = panel_idx;
        }        
        
        return panel;
    }    
    
    /**
     * Configures Spin.js before its execution.
     *
     * @name        $.spin.configure     
     * @extends     $.spin
     * @function
     * @param       {Object}    [o]             key/value pairs object literal
     * @param       {Number}    [o.minWidth]    Minimum width of a panel in pixels
     * @param       {Function}  [o.loader]      Custom loader function
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     */
    Spin.configure = function (o){
        if (!Env.initialized){
            $(function (){
                Env.initialize(o);
            });   
            Env.initialized = true;         
        }
    };
    
    /**
     * Moves to given panel.
     *     
     * @name        $.spin.moveTo
     * @extends     $.spin
     * @function
     * @param       {jQuery} target_panel
     * @author      customcommander
     * @since       1.0
     * @version     1.0
     */
    Spin.moveTo = function (target_panel){        
        var target_idx = Stack.indexOf(target_panel),
                    
            min_idx = Stack.min,
            max_idx = Stack.max,
            
            min,
            max,
            
            cur_idx,
            cur_props,          
            cur_pos,
            
            cols,
            cols_sum,
            
            tomove_selectors = [],
            tomove_px        = 0,
            
            
            idx,    //panel index
            props,  //panel properties
            pos,    //panel position
            
            
            
            selectors = [],
            shift = 0,
            
            i;
        
        //we dont move to a panel that is already visible
        if (Stack.visible(target_idx)){
            return;
        }
        
        console.time('Spin.moveTo');
        
        //current visible panels will all move
        for (i=min_idx; i<=max_idx; i++){
            tomove_selectors.push(Stack.arr[i].selector);
        }
        
        //target index is on the right
        if (target_idx>min_idx){  
        
            pos = Env.MAX_COLUMNS * Env.PANEL_WIDTH;
            
            do {
                cur_idx   = Stack.next(max_idx);
                cur_props = Stack.arr[cur_idx];
                cur_pos   = pos;                        
                cols_sum  = 0;                
                
                do {
                    cols       = Stack.arr[min_idx].columns;
                    cols_sum  += cols;                                                            
                    tomove_px += cols * Env.PANEL_WIDTH;
                    min_idx    = Stack.next(min_idx);
                    
                } while (cols_sum<cur_props.columns);
                
                //we need to make sure that this hidden panel is correctly
                //positioned before we move it.
                $(cur_props.selector).css({left: cur_pos});
                
                //adding this hidden panel to the list
                tomove_selectors.push(cur_props.selector);
                
                max_idx = cur_idx;
                pos    += Env.PANEL_WIDTH * cur_props.columns;
                                
            } while (cur_idx<target_idx);
            
            $(tomove_selectors.join()).animate({left: '-=' + tomove_px});            
            
            Stack.min = min_idx;
            Stack.max = max_idx;
            
        //target index is on the left
        } else {
            
            //panels selectors that will be animated
            for (i=target_idx; i<=Stack.max; i++){
                selectors.push(Stack.arr[i].selector);                
            }
            
            pos = 0;
            
            do {
                Stack.min--;
                cols = 0;
                
                /*
                 * when we move a panel we need to make sure that there are 
                 * enough columns available to it.
                 * 
                 *        min         max    min         max
                 * +-------+---+---+---+      +-------+---+---+---+
                 * |1>>....|2  |3>>|4>>|      |1      |2  |3..|4..|
                 * |.......|   |   |   |      |       |   |...|...|
                 * +-------+---+---+---+      +-------+---+---+---+
                 *
                 * the current width of the window allows a maximum of 
                 * three visible columns.
                 *
                 * panel 1 is hidden and extends over two columns. panels 2, 3, 
                 * and 4 are visible and extend over one column each.
                 * 
                 * so in order to make enough room for panel 1 we need to
                 * move panels 3 and 4.
                 */
                do {
                    cols      = Stack.arr[Stack.max].columns;
                    shift    += cols * -Env.PANEL_WIDTH;                    
                    cols_sum += cols;
                    Stack.max--;
                //we exit the loop when enough columns will
                } while (cols_sum<Stack.arr[idx].columns);
                ff
                pos += Stack.arr[idx].columns * -Env.PANEL_WIDTH;
                
                Stack.panelAt(idx).css({left: pos});
                
            } while (idx>target_idx);
                        
            //reverse loop: hidden panels at left
            for (pos=0, Stack.min--; Stack.min>=target_idx; Stack.min--){
                
                //repositioning before animation
                pos += Stack.arr[idx].columns * -Env.PANEL_WIDTH;                
                Stack.panelAt(i).css({left: pos});
                
                
                
                
                
            }
            
        }
        
        
        
        console.timeEnd('Spin.moveTo');
    };   
    
    /**
     * Maximizes given panel.
     *
     * @name            $.spin.maximize
     * @extends         $.spin
     * @function
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @param           {jQuery} panel
     */
    Spin.maximize = function (panel){
        Stack.max = Stack.indexOf(panel);
        Env.PANEL_FORMER_MINWIDTH = Env.PANEL_MINWIDTH;        
        Spin.maxColumns(1);
        Env.maximized = true;
    };    
    
    /**
     * Restores the environment to its state before maximization.
     *
     * @name            $.spin.restore
     * @extends         $.spin
     * @function
     * @author          customcommander
     * @since           1.0
     * @version         1.0     
     */
    Spin.restore = function (){
        if (Env.maximized){
            Env.PANEL_MINWIDTH = Env.PANEL_FORMER_MINWIDTH;
            Env();
            Env.resize();
            Env.maximized = false;            
        }
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
        var idx     = Stack.indexOf(panel), //panel index
            nextIdx = Stack.next(idx);      //next panel index, -1 if there isn't.            
        if (nextIdx>0){
            Spin.moveTo(panel);
            Stack.remove(nextIdx);            
            Env.togglePrevNextControls();
            panel.find('.loaded').removeClass('loaded');
        }        
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
        var idx = Stack.previous(Stack.min),
            panel;                            
        
        if (idx<0){
            return false;
        }        
        
        panel = Stack.panelAt(idx);        
        
        if ($.type(move)=='boolean' && !move){
            return panel;
        }        
        
        return Spin.moveTo(panel);        
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
        var idx = Stack.next(Stack.max),
            panel;
        
        if (idx<0){
            return false;
        }
        
        panel = Stack.panelAt(idx);
        
        if ($.type(move)=='boolean' && !move){
            return panel;
        }        
        
        return Spin.moveTo(panel);        
    };   
    
    /**
     * Returns the current number of columns on display.
     *     
     * @name            $.spin.numColumns
     * @extends         $.spin
     * @function
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @returns         {Number}
     */
    Spin.numColumns = function (){
        return Stack.numVisible();
    };
    
    /**
     * If called without parameter, it returns the current maximum number of
     * columns that can be displayed at the same time.
     * 
     * If the parameter is set it redefines that number and the display will
     * be updated accordingly.
     * 
     * Note that Spin.js tries to keep the panels to a minimum of 
     * 320px wide each and by doing so, imposes a soft limit on that number.
     * 
     * Returns the maximum number of columns.
     *          
     * @function
     * @name            $.spin.maxColumns
     * @extends         $.spin     
     * @param           {Number} [n] Maximum number of columns
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     */
    Spin.maxColumns = function (n){
        var max;
        
        //call without argument
        if (n===undefined){
            return Env.MAX_COLUMNS;
        }
        
        n = parseInt(n, 10);
        
        if (!n || n<0){
            Env.error('Invalid number of columns');
        }
        
        //maximum number of columns if panel width is set to 320
        max = Math.floor(Env.WINDOW_WIDTH / Env.SPIN_MINWIDTH) || 1;                
        
        /*
         * if n is greater than max, it means that panel width is lower than 
         * 320. Spin.js doesn't like that.
         */
        if (n>max){
            n = max;
        }
                    
        Env.PANEL_MINWIDTH = Math.floor(Env.WINDOW_WIDTH / n);        
        Env();        
        Env.resize();
        
        return n;
    };
    
    /**
     * Returns Spin.js installation path.
     *     
     * @name            $.spin.basePath
     * @extends         $.spin
     * @function
     * @author          customcommander
     * @since           1.0
     * @version         1.0
     * @see             Env.initBasePath
     * @returns         {String}
     */
    Spin.basePath = function (){
        return Env.BASE_PATH;
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
    
    $(function (){
        if (!Env.initialized){
            Env.initialize();                    
        }
        Env.initialized = true;
    });
    
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
    
    //jQuery is awesome!!!
}(jQuery));
