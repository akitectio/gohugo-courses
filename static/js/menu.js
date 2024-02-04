// Get all menu items
var menuItems = document.querySelectorAll('.nav-item .nav-link');

// Loop through each menu item
for (var i = 0; i < menuItems.length; i++) {
    // If the href of the menu item matches the URL of the current page
    if (menuItems[i].href === window.location.href) {
        // Add the 'active' class to the menu item
        menuItems[i].classList.add('active');
    }
}

