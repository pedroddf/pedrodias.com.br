$(function() {
    var header = $(".about-disable");
    $(window).scroll(function() {
        var scroll = $(window).scrollTop();

        if (scroll >= 100) {
            header.removeClass('about-disable').addClass("about-enable");
        } else {
            header.removeClass("about-enable").addClass('about-disable');
        }
    });
});