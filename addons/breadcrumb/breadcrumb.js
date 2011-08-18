$(function (){

    var body, 
        breadcrumb,
        lastCrumb;
        
    $(document.body).append([
        '<div id="spin-menubar">',
        '   <ol id="spin-breadcrumb"/>',
        '</div>'
    ].join(''));            
    
    body       = $(document.body);
    breadcrumb = $('#spin-breadcrumb');
    
    body.bind('paneladd.spin', function (e, panel){                
        if (lastCrumb){
            lastCrumb.removeClass('spin-last');
        }
        
        lastCrumb = $('<li/>', {
            'class':    'spin-breadcrumb-item spin-last',
            'id':       panel.attr('id') + '-ref',
            'text':     panel.panelTitle()
        });        
        
        breadcrumb.append(lastCrumb);
    });
    
    body.bind('panelremove.spin', function (e, panel){
        var crumbSel = '#' + panel.attr('id') + '-ref';        
        lastCrumb = $(crumbSel).prev().addClass('spin-last');
        $(crumbSel).remove();
    });
    
    body.bind('titlechange.spin', function (e, panel){
        $('#' + panel.attr('id') + '-ref').text(panel.panelTitle());
    });
    
    breadcrumb.delegate('li.spin-breadcrumb-item', 'click', function (e){
        var sel = '#' + $(this).attr('id').split('-')[0];
        $.spin.expand($(sel));
    });
});
