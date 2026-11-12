
// Automatically display the current year
const currentYear = document.getElementById("current-year");

currentYear.textContent = new Date().getFullYear();

// Dark and Light Mode
const themeToggle = document.getElementById("theme-toggle");

// Load the saved theme
const savedTheme = localStorage.getItem("theme");

// Apply the saved theme
if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
}

// Update the theme icon
function updateThemeIcon() {
    const icon = document.body.classList.contains("dark-mode")
        ? "sun"
        : "moon";

    themeToggle.innerHTML = `<i data-lucide="${icon}"></i>`;

    lucide.createIcons();
}

// Display the correct initial icon
updateThemeIcon();

// Toggle the theme when clicked
themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    const currentTheme = document.body.classList.contains("dark-mode")
        ? "dark"
        : "light";

    localStorage.setItem("theme", currentTheme);

    updateThemeIcon();

});

// Scroll Reveal Animation
const revealElements = document.querySelectorAll(
    ".biography-content p, .timeline-item, .hero-content, .quote-container"
);

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.2
});

revealElements.forEach((element) => {
    element.classList.add("reveal");
    observer.observe(element);
});

// Back to Top Button
const backToTopButton = document.getElementById("back-to-top");

// Show or hide the button while scrolling
window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
        backToTopButton.classList.add("show");
    } else {
        backToTopButton.classList.remove("show");
    }
});

// Scroll smoothly to the top when clicked
backToTopButton.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});