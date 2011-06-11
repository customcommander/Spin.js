$(function (){

    var body, 
        breadcrumb,
        lastItem;

    /*$('#k-panels').css({
        top: '2.5em'
    });*/
    
    $(document.body).append([
        '<div id="k-menubar">',
        '   <ol id="k-breadcrumb"/>',
        '</div'
    ].join(''));    
    
    body       = $(document.body);
    breadcrumb = $('#k-breadcrumb');
    
    body.bind('paneladd.k', function (e, panel){
                
        if (lastItem){
            lastItem.removeClass('k-last');
        }
        
        lastItem = $([
            '<li class="k-breadcrumb-item k-last" id="' + panel.attr('id') + '_ref">',
                panel.getPanelTitle(),
            '</li>'
        ].join(''));
        
        breadcrumb.append(lastItem);
    });
    
    body.bind('panelremove.k', function (e, panel){
        $('#' + panel.attr('id') + '_ref').remove();
    });
    
    breadcrumb.delegate('li.k-breadcrumb-item', 'click', function (e){
        var id = $(this).attr('id').slice(0, -4); //removes "_ref" at end of string
        $.kaiten.moveTo($('#' + id));
    });

});
