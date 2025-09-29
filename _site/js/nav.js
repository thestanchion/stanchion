const navTrigger = document.querySelector(".nav-trigger");
navTrigger.addEventListener("click", () => {
    const nav = document.querySelector(".nav");

    if (navTrigger.classList.contains("active")) {
        navTrigger.classList.remove("active");
        nav.classList.remove("open");
    } else {
        navTrigger.classList.add("active");
        nav.classList.add("open");
    }
});
