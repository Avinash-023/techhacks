const menuIcon = document.querySelector('.fa-bars');
const menuItems = document.getElementById('MenuItems');

menuIcon.addEventListener('click', () => {
    if (menuItems.style.display === "none" || menuItems.style.display === "") {
        menuItems.style.display = "flex";
        menuItems.classList.add('active');
    } else {
        menuItems.style.display = "none";
        menuItems.classList.remove('active');
    }
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!menuItems.contains(e.target) && !menuIcon.contains(e.target)) {
        menuItems.style.display = "none";
        menuItems.classList.remove('active');
    }
});