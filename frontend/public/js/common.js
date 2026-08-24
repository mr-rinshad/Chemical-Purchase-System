function setStorage(key, value) {
    sessionStorage.setItem(key, value);
}

function getStorage(key) {
    return sessionStorage.getItem(key);
}

function removeStorage(key) {
    sessionStorage.removeItem(key);
}

function clearStorage() {
    sessionStorage.clear();
}

function getToken() {
    return getStorage("token");
}

function getLoggedUser() {
    const user = getStorage("user");
    return user ? JSON.parse(user) : null;
}

function getLoggedLaboratory() {
    const laboratory = getStorage("laboratory");
    return laboratory ? JSON.parse(laboratory) : null;
}

function getLoggedAdmin() {
    const admin = getStorage("admin");
    return admin ? JSON.parse(admin) : null;
}

function logout() {
    removeStorage("token");
    removeStorage("user");
    removeStorage("role");
    removeStorage("laboratory");
    removeStorage("admin");
    clearStorage();
    window.location.href = "/";
}

function protectPage(requiredRole) {
    const token = getToken();
    const role = getStorage("role");

    if (!token) {
        window.location.href = "/";
        return;
    }

    if (role !== requiredRole) {
        window.location.href = "/";
        return;
    }
}

function showMessage(message, type = "danger") {
    const messageDiv = document.getElementById("message");
    if (!messageDiv) return;

    messageDiv.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
            ${message}
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert">
            </button>
        </div>
    `;
}

function toggleSidebar() {
    const sidebar = document.getElementById("appSidebar");
    const backdrop = document.getElementById("sidebarBackdrop");
    if (sidebar) {
        sidebar.classList.toggle("show");
    }
    if (backdrop) {
        backdrop.classList.toggle("show");
    }
}

/* ==========================================================================
   GLOBAL 3-THEME CYCLE ENGINE WITH DYNAMIC AI IMAGE SWAPPING
   (Default Light ➔ Dark Emerald ➔ Cherry Vanilla ➔ Default Light)
   ========================================================================== */

function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeToggleIcons(savedTheme);
    updateThemeImages(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    let newTheme = "light";

    if (currentTheme === "light") {
        newTheme = "dark";
    } else if (currentTheme === "dark") {
        newTheme = "cherry";
    } else {
        newTheme = "light";
    }

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeToggleIcons(newTheme);
    updateThemeImages(newTheme);
}

function updateThemeToggleIcons(theme) {
    const icons = document.querySelectorAll(".themeIcon, #themeIcon");
    const buttons = document.querySelectorAll(".theme-toggle-btn");

    icons.forEach(function (icon) {
        if (theme === "dark") {
            icon.className = "fa-solid fa-sun text-warning themeIcon";
        } else if (theme === "cherry") {
            icon.className = "fa-solid fa-palette text-danger themeIcon";
        } else {
            icon.className = "fa-solid fa-moon text-dark themeIcon";
        }
    });

    buttons.forEach(function (btn) {
        if (theme === "dark") {
            btn.title = "Current: Dark Emerald (Click for Cherry Vanilla)";
        } else if (theme === "cherry") {
            btn.title = "Current: Cherry Vanilla (Click for Default Emerald)";
        } else {
            btn.title = "Current: Default Emerald (Click for Dark)";
        }
    });
}

function updateThemeImages(theme) {
    const brandLogos = document.querySelectorAll(".brand-logo-img");
    const heroBanners = document.querySelectorAll(".hero-banner-img");
    const loginArts = document.querySelectorAll(".login-art-img");

    brandLogos.forEach(function (img) {
        if (theme === "cherry") {
            if (img.src.includes("logo.png")) {
                img.src = img.src.replace("logo.png", "logo_cherry.png");
            }
        } else {
            if (img.src.includes("logo_cherry.png")) {
                img.src = img.src.replace("logo_cherry.png", "logo.png");
            }
        }
    });

    heroBanners.forEach(function (img) {
        if (theme === "cherry") {
            if (img.src.includes("chemical_lab_hero.jpg")) {
                img.src = img.src.replace("chemical_lab_hero.jpg", "chemical_lab_hero_cherry.jpg");
            }
        } else {
            if (img.src.includes("chemical_lab_hero_cherry.jpg")) {
                img.src = img.src.replace("chemical_lab_hero_cherry.jpg", "chemical_lab_hero.jpg");
            }
        }
    });

    loginArts.forEach(function (img) {
        if (theme === "cherry") {
            if (img.src.includes("security_compliance_art.jpg")) {
                img.src = img.src.replace("security_compliance_art.jpg", "security_compliance_art_cherry.jpg");
            }
        } else {
            if (img.src.includes("security_compliance_art_cherry.jpg")) {
                img.src = img.src.replace("security_compliance_art_cherry.jpg", "security_compliance_art.jpg");
            }
        }
    });
}

// Run initTheme immediately
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
} else {
    initTheme();
}