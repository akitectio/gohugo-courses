document.addEventListener("DOMContentLoaded", function() {
    // Get the current language prefix from the <html> tag or other sources
    var lang = document.documentElement.lang;
    var images = document.querySelectorAll("img");
    images.forEach(function(img) {
        var prefix = "/" + lang + "/";
        if (img.src.includes(prefix)) {
            img.src = img.src.replace(prefix, "/");
        }
    });
});