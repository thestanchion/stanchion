/******************************************
// Primary Navigation
// Authors: Ash Robbins
// Created date: 31/01/2017
// Notes:
******************************************/
$(".c-nav-trigger").on("click", function() {
    const _this = $(this);
    const nav = $(".c-nav");

    if (_this.hasClass("active")) {
        _this.removeClass("active");
        nav.removeClass("open");
    } else {
        _this.addClass("active");
        nav.addClass("open");
    }
});
