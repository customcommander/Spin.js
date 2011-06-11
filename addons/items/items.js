$(function (){
    
    $(document.body).delegate('li.k-item:not([class~="loaded"])', 'mouseover mouseout', function (e){            
        $(this).toggleClass('mouseover');            
    });
    
});
