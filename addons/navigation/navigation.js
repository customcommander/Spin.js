
$(function (){
    
    $(document.body).delegate('nav a[href]:not(.spin-active)', 'click', function (e) {
        var $this = $(this),
            panel = $this.closest('.spin-panel');

        $.spin.removeAfter(panel);
        panel.find('.spin-active,.loaded').removeClass('spin-active').removeClass('loaded');
        $this.addClass('spin-active');
    });
});
