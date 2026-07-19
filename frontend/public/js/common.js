function getToken() {

    return localStorage.getItem("token");

}

function getLoggedUser() {

    const user = localStorage.getItem("user");

    return user ? JSON.parse(user) : null;

}

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    localStorage.removeItem("role");

    window.location.href = "/";

}

function protectPage(requiredRole) {

    const token = getToken();

    const role = localStorage.getItem("role");

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