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
 * Spin.js allows web developers to design applications as a logical and
 * continous flow of screens.
 *
 * @author      Julien Gonzalez <hello@spinjs.com>
 * @since       June 11, 2011
 */
(function ($){    
    
    /**
     * Throws an Error object and display the Error message in a panel.
     * Used internally by jKaiten.
     */
    function ErrorPanel(msg){
        Kaiten('<h2>' + msg + '</h2>', 'Ooops!?').addClass('error');
        throw new Error(msg);
    }
    
    /**
     * Overrides jQuery default error function in order to allow developers
     * to access the internal ErrorPanel function.
     * 
     * Developers can re-override it if they need a more subtle design. The
     * internal ErrorPanel will remain untouched.
     */
    $.error = ErrorPanel;


/******************************************************************************
 * K (Private API)                                                            *
 *                                                                            *
 * Environment variables and internal functions.                              *
 *                                                                            *          
 * K has various responsabilities:                                            *
 *                                                                            *
 * 1) Configuration object validation                                         *
 * 2) Startup initialization                                                  *
 * 3) Loading of panels (see loader function)                                 *
 * 4) Resizing                                                                *
 ******************************************************************************/

    /**     
     * Validates the user configuration object and set/reset some environment
     * variables with it.
     * 
     * The configuration object is a key/value pairs object:
     * 
     *      minWidth:     minimum width of a panel
     *      loader:       custom loader function
     */
    function K(o){
        
        //Browser window width in pixels
        K.WINDOW_WIDTH = $(window).width();
        
        /**
         * Calling K() without argument set the default environment.
         * (e.g. minWidth is 320 and loader is the default loader)
         */
        if (!$.isPlainObject(o)){
            o = {};
        }
        
        /**
         * If minWidth is given it must be a number.
         * That number cannot be lower than 320 or greater than the
         * current browser window.
         */
        if (o.hasOwnProperty('minWidth') && $.type(o.minWidth)=='number'){
            
            //in the case o.minWidth is a float
            o.minWidth = Math.floor(o.minWidth);
            
            if (o.minWidth<320){
                o.minWidth = 320;            
            } else if (o.minWidth>K.WINDOW_WIDTH){
                o.minWidth = K.WINDOW_WIDTH;
            }
            
        //If minWidth is not given or is not a number we fallback to 320
        } else {
            o.minWidth = 320;
        }
        
        K.PANEL_MINWIDTH = o.minWidth;
        K.MAX_COLUMNS    = Math.floor(K.WINDOW_WIDTH / K.PANEL_MINWIDTH);
        
        if (!K.MAX_COLUMNS){
            K.MAX_COLUMNS = 1;
        }
        
        K.PANEL_WIDTH = Math.round(K.WINDOW_WIDTH / K.MAX_COLUMNS);
        
        /**
         * If loader is given it must be a function otherwise we trigger
         * a failure... Come on dude, loader is very important!
         */
        if (o.hasOwnProperty('loader')){            
            if (!$.isFunction(o.loader)){                
                ErrorPanel('Loader is not a function');                
            }
            
            //Overrides the default loader.
            K.loader = o.loader;
        }    
        
        return o;                    
    }        
    
    //ENVIRONMENT VARIABLES
    //--------------------------------------------------------------------------    
    K.WINDOW_WIDTH      = 0;        //Computed browser window width in pixels
    K.PANEL_WIDTH       = 0;        //Computed panel width in pixels
    K.PANEL_MINWIDTH    = 0;        //Minimum panel width in pixels
    K.MAX_COLUMNS       = 0;        //Maximum number of panels that can be visible                                    
    K.initialized       = false;    //Indicates if environment has been initialized
    K.BASE_PATH         = null;
    K.body              = null;     //$(document.body)    
    K.panels            = null;
    K.prevCtrl          = null;     //Previous panel control (jQuery object)
    K.nextCtrl          = null;     //Next panel control (jQuery object)
    
    /**
     * Environment Base Path
     *
     * Locates the script tag that includes jKaiten and gets its src
     * property to build the base path with it.
     *
     * http://example.com/jKaiten/src/js/jKaiten.js     <-- full path from src
     * http://example.com/jKaiten/                      <-- base path
     *
     * @since           1.0
     */
    K.initBasePath = function (){
        var fullpath;
        fullpath    = $('script[src*="src/js/jKaiten"]').prop('src'); 
        K.BASE_PATH = fullpath.substring(0, fullpath.lastIndexOf('src'));
    };
    
    /**
     * Environment Required Stylesheets
     * 
     * Loads required stylesheets by appending the corresponding link tags to
     * the head. This function is executed as soon as jKaiten source file is
     * included.
     *
     * Developers shouldn't have to worry about the extra required files 
     * and of their inclusion order...
     *
     * @since           1.0
     * @todo            put all stylesheets into one single minified file.
     */
    K.loadCss = function (){        
        $('head').append(
            '<link rel="stylesheet" type="text/css" href="' + K.BASE_PATH + 'src/css/fonts-min.css" />',
            '<link rel="stylesheet" type="text/css" href="' + K.BASE_PATH + 'src/css/reset-min.css" />',
            '<link rel="stylesheet" type="text/css" href="' + K.BASE_PATH + 'src/css/base-min.css" />',
            '<link rel="stylesheet" type="text/css" href="' + K.BASE_PATH + 'src/css/jKaiten.css" />'
        );
    };
    
    /**
     * Startup Initialization
     * 
     * The parameter is the user configuration object (if any).
     */
    K.initialize = function (o){
                
        /**
         * jKaiten takes care of its required HTML markup.
         * The developer just has to put the required resources (css/js)
         * in the <head/>. The body element must be empty.
         */
        $(document.body).append([
            '<div id="kaiten">',         
            '   <ol id="k-panels">',
            '       <li class="k-nav-controls">',
            '           <div id="k-nav-prev"/>',
            '           <div id="k-nav-next"/>',
            '       </li>',
            '   </ol>',
            '</div>'
        ].join(''));
        
        //Setting environment variables.
        //----------------------------------------------------------------------
        K.body       = $(document.body);        //Body element
        K.prevCtrl   = $('#k-nav-prev');        //Previous panel control
        K.nextCtrl   = $('#k-nav-next');        //Next panel control
        K.panels     = $('#k-panels');          //Panels list
        
        //Validates the configuration object
        o = K(o);   
        
        //Loads the first panel
        K.loader(K.body);        
        
        //Setting events handlers.
        //----------------------------------------------------------------------
        
        $(window).resize(function (){
            var formerWidth = K.PANEL_WIDTH;
            
            //This updates K.PANEL_WIDTH
            K({minWidth: K.PANEL_MINWIDTH});
            
            //If we perform a vertical resizing only, panel & window widths
            //remain the same. Then we don't have to resize the panels.            
            if (K.PANEL_WIDTH===formerWidth){                
                return;
            }
            
            K.resize();
        });
        
        /**
         * This allows to define non navigable zone(s) inside a navigable zone.
         * 
         * A click on a non navigable element will not propagate.
         */
        K.body.delegate('.no-nav', 'click', function (e){
            e.stopPropagation();
        });
        
        /**
         * A click on any element with the class "nav" or that is contained by 
         * an element with such class executes the loader. 
         * 
         * Note that any default behaviour is prevented.
         */
        K.body.delegate('.nav', 'click', function (e){
            var elt     = $(this),
                target  = $(e.target),
                panel   = elt.closest('li.k-panel'),
                idx     = Stack.indexOf(panel);
                
            e.preventDefault();                   
                
            if (!elt.hasClass('loaded')){
                
                panel
                    .find('.loaded')
                    .removeClass('loaded');
                    
                elt
                    .removeClass('mouseover')
                    .addClass('loaded');
                
                Kaiten.removeAfter(panel);
                
                K.loader(elt);                
                
            } else {                
                Kaiten.moveTo(
                    Stack.panel(
                        Stack.next(idx)));                
            }
            
        });                
        
        K.prevCtrl.click(function (){
            var idx = Stack.previous(Stack.min);
            Kaiten.moveTo(Stack.panel(idx));            
        });
        
        K.nextCtrl.click(function (){
            var idx = Stack.next(Stack.max);
            Kaiten.moveTo(Stack.panel(idx));
        });        
    };
    
    /**
     * Loader - loads the next panel
     *
     * The loader is executed by jKaiten each time a click is made on
     * an element with the class 'nav' and gives that element to the loader
     * as its first parameter.
     *
     * The very first execution of the loader occurs after the document has
     * finished to load. Its parameter at that specific time is always the
     * body element.
     *
     * jKaiten defines a default loader but you can override it by giving
     * your own loader function to $.kaiten.configure():
     * 
     * $.kaiten.configure({
     *      loader: function (elt){
     *          //your loading logic
     *      }
     * });
     * 
     * The following comments describe the behaviour of the default loader.
     */
    K.loader = function (elt){
        
        /**
         * The loader assumes that each clicked element (elt) has a data-url
         * attribute and loads that url with some ajax voodoo.
         *
         * <a class="nav" data-url="mymovies.php?genre=scifi">
         *      Click here to see my sci-fi movies
         * </a>
         */
        var url = elt.data('url');
        
        /**
         * Url must be a non empty string
         */
        url = ($.type(url)!='string' || !$.trim(url)) ? '' : $.trim(url);        
        
        /**
         * At the very first execution of the loader we use the url to define 
         * a default url. The default url is used when the clicked element has 
         * no data-url attribute.
         *
         * The first time that the loader executes, the url is mandatory. 
         * If none is provided the loader triggers a failure.
         *
         * <!--Required data-url attribute!-->
         * <body data-url="panel.php"/>
         *
         */
        if (!K.loader.hasOwnProperty('defaultUrl')){
            if (!url){
                ErrorPanel('No url given');
            }
            K.loader.defaultUrl = url;
        }
        
        /**
         * If there is no url, we fallback to the default url.
         *
         * The default url is convenient when you have a unique script that 
         * provides any panels. (Such as a front controller.)
         *
         * You set it once and you're done.
         *
         * <body data-url="panel-controller.php"/> 
         */
        if (!url){
            url = K.loader.defaultUrl;
        }
        
        $.ajax({
            url: url,      
                        
            /**
             * We have succeeded to load the url.
             */      
            success: function (html, status, xhr){            
                Kaiten(html, elt.getPanelTitle());                    
            },
            
            /**
             * If an error has occured we throw it into a panel
             * e.g. 404 Not Found
             */
            error: function (xhr, status, error){                
                ErrorPanel(xhr.status + ' ' + error);
            }
        });
    };   
    
    /**
     * Browser Window Resize Handler     
     */
    K.resize = function (){
        var idx = 0,
            n   = Stack.size(),
            newMin,
            newMax,
            pos;
        
        newMin = Stack.max - K.MAX_COLUMNS + 1;
        
        if (newMin<0){
            newMin = 0;
            // Stack.max is updated if there are not enough panels before the last
            // (and including the last) to occupy the browser window and if there
            // are panels available after the last.
            newMax = (Stack.max+1===n) ? Stack.max : K.MAX_COLUMNS - 1;
            pos    = 0;
        } else {
            newMax = Stack.max;
            pos    = (newMin===0) ? 0 : newMin * -K.PANEL_WIDTH;
        }
        
        for (; idx<n; idx++){            
            Stack.panel(idx).css({
                left:   Math.ceil(pos),
                width:  K.PANEL_WIDTH
            });
            pos += K.PANEL_WIDTH;
        }
        
        Stack.min = newMin;
        Stack.max = newMax;
        
        K.togglePrevNextControls();
    };  
    
    K.togglePrevNextControls = function (){        
        if (Stack.previous(Stack.min)<0){
            K.prevCtrl.hide('fast');
        } else {            
            K.prevCtrl.show('fast');
        }
        if (Stack.next(Stack.max)<0){
            K.nextCtrl.hide('fast');
        } else {
            K.nextCtrl.show('fast');
        }
    };
        
/******************************************************************************
 * Stack (Private API)                                                        * 
 *                                                                            *
 * Stack is responsible for :                                                 *
 *                                                                            *
 * 1) Identifying panels.                                                     *
 * 2) Adding and removing panels from the DOM.                                *
 * 3) Maintaining the visibility state of the panels.                         *
 ******************************************************************************/
 
    /**
     * Stack - Adds a panel
     *
     * Adds a panel and updates visible range boundaries.
     */
    function Stack(panel){
        var idx = Stack.push(panel);
        
        //first panel
        if (idx===0){
            Stack.min = 0;
            Stack.max = 0;
            
        //if index is still visible it becomes the new max boundary
        //(we don't need to care if it isn't.)
        } else if (Stack.visible(idx)) {
            Stack.max = idx;                        
        }
        
        return idx;
    }
    
    //Stack Variables Initialization
    //--------------------------------------------------------------------------
    Stack.arr    = [];      // Stack internal array. Contains panels ids.
    Stack.min    = -1;      // Begin of visible range
    Stack.max    = -1;      // End of visible range
    Stack.nextId = 1;       // next panel id
    
    /**
     * Returns the total number of panels.
     */
    Stack.size = function (){
        return Stack.arr.length;
    };
    
    /**
     * Appends the panel to the DOM (panels/breadcrumb) and to the Stack.
     */
    Stack.push = function (panel){           
        K.panels.append(panel);                
        K.body.trigger('paneladd.k', [panel]);        
        return Stack.arr.push(panel.attr('id')) - 1;
    };
    
    /**
     * Removes the last panel from the DOM and from the Stack.
     */
    Stack.pop = function (){
        var id    = Stack.arr.pop(),
            panel = $('#' + id).remove();
            
        K.body.trigger('panelremove.k', [panel]);
    };
    
    /**
     * Returns the panel Stack index.
     */
    Stack.indexOf = function (panel){
        var idx;      
            
        if (!(panel instanceof jQuery) || !panel.is('li.k-panel')){
            ErrorPanel('No panel given');
        }
        
        idx = $.inArray(panel.attr('id'), Stack.arr);
        
        if (idx<0){
            ErrorPanel('Panel Not Found');
        }
        
        return idx;
    };
    
    /**
     * Returns the id that a new panel would have.
     */
    Stack.id = function (){        
        return 'panel_' + Stack.nextId++;        
    };
    
    /**
     * Returns the position that a new panel would have.
     */
    Stack.position = function (){
        if (Stack.min<0){/*i.e. the first panel*/
            return 0;
        }        
        return (Stack.max - Stack.min + 1) * K.PANEL_WIDTH;
    };
    
    /**
     * Returns panel (jQuery object) at given index.
     */
    Stack.panel = function (idx){
        return $('#' + Stack.arr[idx]);
    };            
    
    /**
     * Returns previous index or -1.
     */
    Stack.previous = function (idx){        
        return (--idx<0) ? -1 : idx;
    };
    
    /**
     * Returns next index or -1.
     */
    Stack.next = function (idx){        
        return (++idx>=Stack.size()) ? -1 : idx;
    };
    
    /**
     * Returns true if index is within visible range.
     */
    Stack.visible = function (idx){        
        return (idx>=Stack.min) && (idx<=(Stack.min + K.MAX_COLUMNS - 1));
    }; 
    
    /**
     * Returns the number of visible panels.
     */
    Stack.numVisible = function (){
        return Stack.max - Stack.min + 1;
    };
    
    /**
     * Removes all panels after and including (!) given index.
     */
    Stack.remove = function (idx){
        var i = 0, 
            n = Stack.size() - idx; 
            
        for (; i<n; i++){        
            Stack.pop();                        
        }   
        
        Stack.max = Stack.previous(idx);   
    };   
            
    /**
     * Kaiten - Public API
     *
     * Kaiten is both a function and a namespace for the public API.
     * 
     * When used as a function, Kaiten appends a new panel to the list. 
     * If the panel is positionned outside of visible range, Kaiten will move 
     * until the panel gets visible.
     *
     * First parameter is either a string or a jQuery object that represents
     * the content of the panel.
     *
     * The second parameter is a string and represents the title of the panel.
     *
     * Returns the new panel.
     */
    function Kaiten(html, title){
        var panel, 
            panelId       = Stack.id(),            
            panelSelector = '#' + panelId,                        
            script,
            i,      //control var 
            n,      //control var
            js; 
            
        /**
         * If the html parameter is given it must be either a string
         * or a jQuery object.
         */
        if (html && $.type(html)!='string' &&  !(html instanceof jQuery)){
            ErrorPanel('String or jQuery object expected');
        }
        
        /**
         * Converts the html parameter to a jQuery object if it was not
         * already.
         */
        if (!(html instanceof jQuery)){
            html = $(html);
        }
        
        /**
         * If the title parameter was not given, we set it to an empty string.
         * Otherwise the string 'undefined' will be displayed.
         */
        if (title===undefined){
            title = '';
        }
            
        //Base markup of a panel
        panel = $([
            '<li class="k-panel">',
            '   <div class="k-panel-hd">',
            '       <span class="k-title">' + title + '</span>',
            '   </div>',
            '   <div class="k-panel-bd"/>',
            '</li>'
        ].join(''));
        
        //Identifying, sizing and positioning
        panel
            .attr('id', panelId)
            .css({
                left: Stack.position(),
                width: K.PANEL_WIDTH
            });
        
        /**
         * We append to the panel the html without any <script/> nodes.
         * For reason explained below these nodes must added to the DOM
         * separately.
         */
        panel.find('div.k-panel-bd').append(html.filter(':not(script)'));                        
       
        //Adds the panel to the DOM
        Stack(panel);
        
        //Gets all <script/> nodes from the original html.
        script = html.filter('script');
        
        if (script.length){
            
            js = [];          
            
            for (i=0, n=script.length; i<n; i++){
                
                /**
                 * We reinject the JavaScript defined between <script></script>
                 * into an anonymous function which "this" value is set to 
                 * the panel that we just have created.
                 * 
                 */                
                js.push([                    
                    '(function (){',                        //<-- anonymous function       
                        script.eq(i).text(),                //<-- reinjecting code
                    '}).call($("' + panelSelector + '"));'  //<-- setting "this" to the panel
                ].join(''));
            }
            
            /**
             * Adding JavaScript to the DOM after the addition of the panel
             * to the DOM.
             * 
             * We have to do that in order to allow the JavaScript to access 
             * elements defined in the panel.
             * 
             * If the JavaScript has no need to access such elements, it is
             * not necessary to do that but in the other hand we cannot predict
             * what your code does ;-)
             * 
             */
            K.body.append([
                '<script type="text/javascript">',
                    js.join(''),
                '</script>'
            ].join(''));
        }
        
        //Moves to the panel if not visible
        Kaiten.moveTo(panel);
        
        return panel;
    }    
    
    /**
     * Allows to configure jKaiten before it runs.
     * 
     * The function is designed to be executed only once. Further calls will
     * have no effect.
     * 
     * Parameter 'o' is a key/value pairs literal object.
     */
    Kaiten.configure = function (o){
        if (!K.initialized){
            $(function (){
                K.initialize(o);
            });   
            K.initialized = true;         
        }
    };
    
    /**
     * Moves to given panel
     * 
     * Performs a "horizontal scrolling" (left or right) 
     * until given panel gets visible.     
     */
    Kaiten.moveTo = function (destPanel){        
        var destIdx = Stack.indexOf(destPanel), //destination index
            arr     = Stack.arr,            
            css     = {left: ''},
            elts    = [],
            panel,
            idx,            
            newMin,
            newMax;
        
        if (Stack.visible(destIdx)){            
            //if panel already is visible we dont need to move there...
            return destPanel;
        }        
        
        if (destIdx>Stack.max){            
            
            // SITUATION
            // *********
            // 1) Panels 2 to 4 are visible but we need to move to panel 8.
            // 2) Panels width is set to 100 (PANEL_WIDTH).
            // 3) Only three panels can be visible (MAX_PANELS).                    
            //
            // current: -200-100 0   100 200 300 400 500 600
            //          +---+---+---+---+---+---+---+---+---+
            //          | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
            //          |   |   |min|   |max|   |   |   |   |            
            //          +---+---+---+---+---+---+---+---+---+
            //
            // new:     -600-500-400-300-200-100 0   100 200
            //          +---+---+---+---+---+---+---+---+---+
            //          | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
            //          |   |   |   |   |   |   |min|   |max|
            //          +---+---+---+---+---+---+---+---+---+            
            css.left = '-=' + Math.round(((destIdx - Stack.max) * K.PANEL_WIDTH));                            
            newMin   = destIdx - K.MAX_COLUMNS + 1;  // 8 - 3 + 1 = 6
            newMax   = destIdx;                     // 8
            
            //from 2 to (and including) 8
            for (idx=Stack.min; idx<=newMax; idx++){              
                
                panel = Stack.panel(idx); 
                elts.push(panel.get(0));
                
                //before we animate panels 2 to 8, we have to be sure that they
                //are all correctly positioned. since they already are visible
                //panels 2 to 4 dont need this.
                if (idx>Stack.max){                        
                    
                    //panel 5 is positioned at : (5 - 2) * 100 = 300
                    //panel 6 is positioned at : (6 - 2) * 100 = 400 ...
                    panel.css({left: Math.round((idx - Stack.min) * K.PANEL_WIDTH)});                    
                }                
            }            
            
        } else if (destIdx<Stack.min){
            
            css.left = '+=' + Math.round(((Stack.min - destIdx) * K.PANEL_WIDTH));
            newMin   = destIdx;
            newMax   = destIdx + K.MAX_COLUMNS - 1;
            
            for (idx=destIdx; idx<=Stack.max; idx++){                                  
                
                panel = Stack.panel(idx);
                elts.push(panel.get(0));                                                       
                
                if (idx<Stack.min){                                                            
                    panel.css({left: Math.round((idx - Stack.min) * K.PANEL_WIDTH)});                    
                }
            }                        
        }   
        
        //updating boundaries
        Stack.min = newMin;
        Stack.max = newMax;                          
        
        $(elts).animate(css, 'fast');   
        
        K.togglePrevNextControls();
        
        return destPanel;
    };        
    
    /**
     * Removes all panels (visible or not) after given panel.
     */
    Kaiten.removeAfter = function (panel){
        var idx     = Stack.indexOf(panel), //panel index
            nextIdx = Stack.next(idx);      //next panel index
            
        //nextIdx<0 means that current panel was the last panel
        if (nextIdx>0){                        
            //removes everything starting from nextIdx.
            Stack.remove(nextIdx);            
        }        
    };
    
    /**
     * Moves to the panel that is on the left of the first panel and returns it.
     * 
     * If 'move' is set to false the function simply returns the panel.
     * Any other value will be disregarded.
     * 
     * If there is no such panel the function returns false.
     */
    Kaiten.previous = function (move){
        var idx = Stack.previous(Stack.min),
            panel;                            
        
        if (idx<0){
            return false;
        }        
        
        panel = Stack.panel(idx);        
        
        if ($.type(move)=='boolean' && !move){
            return panel;
        }        
        
        return Kaiten.moveTo(panel);        
    };        
    
    /**
     * Moves to the panel that is on the right of the last panel and returns it.    
     * 
     * If 'move' is set to false the function simply returns the panel.
     * Any other value will be disregarded.
     * 
     * If there is no such panel the function returns false.
     */
    Kaiten.next = function (move){
        var idx = Stack.next(Stack.max),
            panel;
        
        if (idx<0){
            return false;
        }
        
        panel = Stack.panel(idx);
        
        if ($.type(move)=='boolean' && !move){
            return panel;
        }        
        
        return Kaiten.moveTo(panel);        
    };   
    
    /**
     * Returns the current number of columns on display.
     */
    Kaiten.numColumns = function (){
        return Stack.numVisible();
    };
    
    /**
     * If called without parameter, it returns the current maximum number of
     * columns that can be displayed at the same time.
     * 
     * If the parameter is set it redefines that number and the display will
     * be updated accordingly.
     * 
     * Note that jKaiten tries to keep the panels to a minimum of 
     * 320px wide each and by doing so, imposes a soft limit on that number.
     * 
     * Returns the maximum number of columns.
     */
    Kaiten.maxColumns = function (n){
        var max;
        
        //Call without argument
        if (n===undefined){
            return K.MAX_COLUMNS;
        }
        
        n = parseInt(n, 10);
        
        if (!n || n<0){
            ErrorPanel('Invalid number of columns');
        }
        
        //maximum number of columns if panel width is set to 320
        max = Math.floor(K.WINDOW_WIDTH / 320);
        
        if (!max){
            max = 1;
        }
        
        /**
         * if n is greater than max, it means that panel width is lower than 
         * 320. jKaiten doesn't like that.
         */
        if (n>max){
            n = max;
        }
        
        K({minWidth: Math.floor(K.WINDOW_WIDTH / n)});
        
        K.resize();
        
        return n;
    };
    
    K.initBasePath();
    K.loadCss();
    
    $(function (){
        if (!K.initialized){
            K.initialize();                    
        }
        K.initialized = true;
    });
    
    /**
     * Helper - Returns panel (jQuery Plugin)
     *
     * Returns the panel of the first matched element in the set.
     * Triggers a failure if it can't find it.
     */
    $.fn.getPanel = function (){
        var panel;
        
        if (this.hasClass('k-panel')){
            panel = this;
        } else {
            panel = this.closest('li.k-panel');
        }
        
        if (!panel.length){
            ErrorPanel("Can't find your panel");
        }
        
        return panel;
    };
    
    /**
     * Helper - Returns panel title (jQuery Plugin)
     */
    $.fn.getPanelTitle = function (){        
        /**
         * If called from a navigable element the plugin returns the title
         * of the panel that will be loaded. 
         *
         * There are different ways to find it.
         */
        if (this.hasClass('nav') || this.is('body')){
            /**
             * 1) Looking for a data-title attribute:
             *
             * <a class="nav" data-title="Sci-fi movies">
             *      See my Sci-fi movies
             * </a>
             *
             * Returns 'Sci-fi movies'
             */
            if (this.data('title')){
                return this.data('title');
            /**
             * 2) If the navigable element also has the class 'k-title' it
             * returns its text:
             *
             * <a class="nav k-title">
             *      My Sci-fi movies
             * </a>
             *
             * Returns 'My Sci-fi movies'
             */
            } else if (this.hasClass('k-title')){
                return this.text();
            /**
             * 3) Looking for a child of the navigable element that has the 
             * class 'k-title':
             *
             * <div class="nav">
             *      <span class="k-title">Blade Runner</span>
             *      <img src="bladerunner.jpg" alt="Blade Runner"/>
             * </div>
             *
             * Returns 'Blade Runner'
             */
            } else if (this.find('.k-title').length){
                return this.find('.k-title').eq(0).text();
            /**
             * 4) Finally it returns the text of the navigable element
             *
             * <a class="nav">
             *      Sci-fi movies
             * </a>
             *
             * Returns 'Sci-fi movies'
             */
            } else {
                return this.text();
            }
        /**
         * Otherwise it just returns the title of the panel that contains the
         * element.
         */
        } else {
            return this.getPanel()
                .find('div.k-panel-hd')
                    .find('span.k-title')
                        .text();
        }
    };
    
    /**
     * Extends jQuery with jKaiten public API
     * 
     * Usage:    
     * 
     * $.kaiten();
     * $.kaiten.configure();     
     * $.kaiten.next();
     * $.kaiten.previous();
     * $.kaiten.moveTo();     
     * $.kaiten.removeAfter();
     * $.kaiten.numColumns();
     * $.kaiten.maxColumns();
     */
    $.extend({kaiten: Kaiten});
    
    //jQuery is awesome!!!
}(jQuery));
