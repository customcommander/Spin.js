$(function (){
    
    $(document.body).delegate('li.spin-item:not([class~="loaded"])', 'mouseover mouseout', function (e){            
        $(this).toggleClass('mouseover');            
    });
    
});
