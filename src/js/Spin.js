/*!
 * Spin.js 1.0
 * http://spinjs.com
 * 
 * Copyright 2011, Julien Gonzalez.
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

    var Env = {
        
        basePath:           null,
        
        initialized:        null,
        body:               null,
        panels:             null,
        
        packCss:            null,
        unpackCss:          null,
        shiftLeftCss:       null,
        shiftRightCss:      null,
        
        configure: function (){
            var win = $(window).width(), //window width
                packed,                  //packed width
                unpacked;                //unpacked width
            
            //one panel environment
            if (win<640){
                this.packCss       = { left: 0,        width: win      };    
                this.unpackCss     = { left: 0,        width: win      };                
                this.shiftLeftCss  = { left:-win,      width: win      };
                this.shiftRightCss = { left: win,      width: win      };
            
            //two panels environment; same widths
            } else if (win<960){
                unpacked = Math.floor(win/2);
                
                this.packCss       = { left: 0,        width: unpacked };    
                this.unpackCss     = { left: unpacked, width: unpacked };                
                this.shiftLeftCss  = { left:-unpacked, width: unpacked };
                this.shiftRightCss = { left: win,      width: unpacked };
                
            //two panels environment; optimized widths            
            } else {
                packed   = Math.floor(win/3);
                unpacked = Math.floor(win-packed);
                
                this.packCss       = { left: 0,        width: packed   };    
                this.unpackCss     = { left: packed,   width: unpacked };                
                this.shiftLeftCss  = { left:-unpacked, width: unpacked };
                this.shiftRightCss = { left: win,      width: unpacked };
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
            
            /*
             *
             */        
            $(window).resize(function (){
                console.log('to implement');
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
                    
                    panel.find('.loaded').removeClass('loaded');
                        
                    elt.removeClass('mouseover').addClass('loaded');
                    
                    if (Stack.next(idx)>0){
                        Stack.remove(Stack.next(idx));
                    }
                    
                    Env.loader(elt);                
                    
                } else {                
                    Spin.expand(
                        Stack.panelAt(
                            Stack.next(idx)));                
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
        }
        
    };//Env
    
    
    
            
//------------------------------------------------------------------------------
//-- Stack (Private API) -------------------------------------------------------
//------------------------------------------------------------------------------
 
    /**
     * Stack adds and removes panels but also allows to get information about panels.
     *
     * @private
     */
    var Stack = {

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
        push: function (panel){  
            var selector = '#' + panel.attr('id');            
            Env.panels.append(panel);
            Env.body.trigger('paneladd.spin', [panel]);                          
            return this.arr.push(selector) - 1;
        },
        
        /**
         * Removes a panel both from the Stack and the DOM.
         */
        pop: function (){
            var selector = this.arr.pop(),       //removes from the Stack       
                panel    = $(selector).remove(); //removes from the DOM
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
         * Returns panel at given index.
         *
         * @param       {Number} Stack index
         * @returns     {jQuery}
         */
        panelAt: function (idx){
            return $(this.arr[idx]);
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
        
        if (!Stack.arr.length){//i.e. first panel        
            panel.attr('id', panelId).css({
                left:   0,
                width:  $(window).width()
            });
        } else {
            panel.attr('id', panelId).css(Env.shiftRightCss);
        }
        
        /*
         * We append to the panel the html without any <script/> nodes.
         * For reason explained below these nodes must be added to the DOM
         * separately.
         */
        panel.find('div.spin-panel-bd').append(html.filter(':not(script)'));                        
       
        //Adds the panel to the DOM
        panel_idx = Stack.push(panel);                
        
        
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
        
        if (panel_idx){//i.e. not the first panel
            Spin.expand(panel);       
        }
        
        return panel;
    }
    
    /**
     * 
     * @name        $.spin.loader
     * @extends     $.spin
     * @since       1.0
     * @version     1.0
     * @param   {Function} fn function in charge of loading your panels     
     */
    Spin.loader = function (fn){
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
     */
    Spin.expand = function (panel){
        var idx = Stack.indexOf(panel),
            min = Stack.min,
            max = Stack.max,
            selectors;
            
        
        if (idx<=min){     
            $(Stack.arr.slice(idx+1, min).join()).css({
                left:   Env.WINDOW_WIDTH,
                width:  Env.PANEL_WIDTH
            });
            
            if (idx<min){
                $(Stack.arr[min]).animate({ left: Env.WINDOW_WIDTH }, function (){
                    $(this).css({ width: Env.PANEL_WIDTH });
                });                
            }
            
            $(Stack.arr[max]).animate({ left: Env.WINDOW_WIDTH }, function (){
                $(this).css({ width: Env.PANEL_WIDTH });
            });
            
            if (idx===0 || Env.MAX_COLUMNS===1){                
                $(Stack.arr[idx]).animate({
                    left:   0,
                    width:  Env.WINDOW_WIDTH
                });   
                
                Stack.min = idx;
                Stack.max = idx;             
                                
            } else {
                $(Stack.arr[idx]).animate({
                    left:   Env.PANEL_WIDTH,
                    width:  Env.PANEL_WIDTH * (Env.MAX_COLUMNS-1)
                });

                $(Stack.arr[idx-1]).animate({
                    left:   0,
                    width:  Env.PANEL_WIDTH
                });                
                
                Stack.min = idx-1;
                Stack.max = idx;
            }                                                  
        } else if (max<idx){            
            $(Stack.arr.slice(min, idx-1).join()).animate(Env.shiftLeftCss);            
            $(Stack.arr[idx-1]).animate(Env.packCss);
            $(Stack.arr[idx]).animate(Env.unpackCss);            
            Stack.min = min<max || idx>0? idx-1 : idx;
            Stack.max = idx;            
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
        var idx     = Stack.indexOf(panel), //panel index
            nextIdx = Stack.next(idx);      //next panel index, -1 if there isn't.            
        if (nextIdx>0){
            Spin.moveTo(panel);
            Stack.remove(nextIdx);            
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
        var idx = Stack.next(Stack.max),
            panel;
        
        if (idx<0){
            return false;
        }
        
        panel = Stack.panelAt(idx);
        
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
    
    $(Env.initialize);
    
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
