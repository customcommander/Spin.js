$(function (){

    var body, 
        breadcrumb,
        lastItem;

    $(document.body).append([
        '<div id="k-menubar">',
        '   <ol id="k-breadcrumb"/>',
        '</div'
    ].join(''));            
    
    body       = $(document.body);
    breadcrumb = $('#k-breadcrumb');
    
    body.bind('paneladd.spin', function (e, panel){
                
        if (lastItem){
            lastItem.removeClass('k-last');
        }
        
        lastItem = $([
            '<li class="k-breadcrumb-item k-last" id="' + panel.attr('id') + '_ref">',
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
    
    breadcrumb.delegate('li.k-breadcrumb-item', 'click', function (e){
        var id = $(this).attr('id').slice(0, -4); //removes "_ref" at end of string
        $.spin.moveTo($('#' + id));
    });

});
