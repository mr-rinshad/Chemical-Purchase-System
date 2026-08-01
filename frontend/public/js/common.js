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

        <div class="alert alert-${type} alert-dismissible fade show" role="alert">

            ${message}

            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert">
            </button>

        </div>

    `;

}