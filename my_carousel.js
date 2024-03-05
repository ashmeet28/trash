function S(id) { return document.getElementById(id); }

function moveCardsCarouselForward() {
    var carousel = S('CardsCarouselDiv');
    var x = carousel.getBoundingClientRect().left;

    var images = carousel.getElementsByTagName("div");
    for (var i = 0; i < images.length; i++) {
        var image_x = images[i].getBoundingClientRect().left;
        if (image_x >= x) {
            var offset = image_x - x;
            if (offset > 5) {
                carousel.scrollBy({
                    top: 0,
                    left: offset,
                    behavior: "smooth",
                });
                break;
            }
        };
    }
}

function moveCardsCarouselBack() {
    var carousel = S('CardsCarouselDiv');

    var x = carousel.getBoundingClientRect().right

    var images = carousel.getElementsByTagName("div");
    for (var i = images.length - 1; i >= 0; i--) {
        var image_x = images[i].getBoundingClientRect().right;
        if (image_x <= x) {
            var offset = image_x - x;
            if (offset < -5) {
                carousel.scrollBy({
                    top: 0,
                    left: offset,
                    behavior: "smooth",
                });
                break;
            }
        };
    }

}


function moveCardsCarousel2Forward() {
    var carousel = S('CardsCarouselDiv2');
    var x = carousel.getBoundingClientRect().left;

    var images = carousel.getElementsByTagName("div");
    for (var i = 0; i < images.length; i++) {
        var image_x = images[i].getBoundingClientRect().left;
        if (image_x >= x) {
            var offset = image_x - x;
            if (offset > 5) {
                carousel.scrollBy({
                    top: 0,
                    left: offset,
                    behavior: "smooth",
                });
                break;
            }
        };
    }
}

function moveCardsCarousel2Back() {
    var carousel = S('CardsCarouselDiv2');

    var x = carousel.getBoundingClientRect().right

    var images = carousel.getElementsByTagName("div");
    for (var i = images.length - 1; i >= 0; i--) {
        var image_x = images[i].getBoundingClientRect().right;
        if (image_x <= x) {
            var offset = image_x - x;
            if (offset < -5) {
                carousel.scrollBy({
                    top: 0,
                    left: offset,
                    behavior: "smooth",
                });
                break;
            }
        };
    }

}


S('CardsCarouselForwardIcon').addEventListener('click', function () {
    moveCardsCarouselForward();
});

S('CardsCarouselBackIcon').addEventListener('click', function () {
    moveCardsCarouselBack();
});

S('CardsCarouselForwardIcon2').addEventListener('click', function () {
    moveCardsCarousel2Forward();
});

S('CardsCarouselBackIcon2').addEventListener('click', function () {
    moveCardsCarousel2Back();
});

