$(function (){

    var body, 
        breadcrumb,
        lastItem;

    $(document.body).append([
        '<div id="spin-menubar">',
        '   <ol id="spin-breadcrumb"/>',
        '</div>'
    ].join(''));            
    
    body       = $(document.body);
    breadcrumb = $('#spin-breadcrumb');
    
    body.bind('paneladd.spin', function (e, panel){
                
        if (lastItem){
            lastItem.removeClass('spin-last');
        }
        
        lastItem = $([
            '<li class="spin-breadcrumb-item spin-last" id="' + panel.attr('id') + '_ref">',
                panel.panelTitle(),
            '</li>'
        ].join(''));
        
        breadcrumb.append(lastItem);
    });
    
    body.bind('panelremove.spin', function (e, panel){
        $('#' + panel.attr('id') + '_ref').remove();
    });
    
    body.bind('titlechange.spin', function (e, panel){
        $('#' + panel.attr('id') + '_ref').text(panel.panelTitle());
    });
    
    breadcrumb.delegate('li.spin-breadcrumb-item', 'click', function (e){
        var id = $(this).attr('id').slice(0, -4); //removes "_ref" at end of string
        $.spin.moveTo($('#' + id));
    });

});
