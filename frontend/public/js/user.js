protectPage("user");

const user = getLoggedUser();

if (user) {

    const welcome = document.getElementById("welcome");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");

    if (welcome) {

        welcome.innerHTML =
            "Welcome, " + user.user.full_name;

    }

    if (email) {

        email.innerHTML =
            user.user.email;

    }

    if (phone) {

        phone.innerHTML =
            user.user.phone;

    }

}

const authorizationForm = document.getElementById("authorizationForm");

if (authorizationForm) {

    authorizationForm.addEventListener(
        "submit",
        submitAuthorization
    );

    loadAuthorizationRequests();

}

function formatDateTime(date) {

    if (!date) {

        return "-";

    }

    return new Date(date).toLocaleString(

        "en-IN",

        {

            day: "2-digit",

            month: "short",

            year: "numeric",

            hour: "2-digit",

            minute: "2-digit",

            second: "2-digit",

            hour12: true

        }

    );

}

async function submitAuthorization(event) {

    event.preventDefault();

    const purpose = document
        .getElementById("purpose")
        .value
        .trim();

    const proofFile = document
        .getElementById("proof_document")
        .files[0];

    if (!proofFile) {

        showMessage(

            "Please select a proof document.",

            "danger"

        );

        return;

    }

    const formData = new FormData();

    formData.append(

        "purpose",

        purpose

    );

    formData.append(

        "proof_document",

        proofFile

    );

    const token = getToken();

    try {

        const response = await fetch(

            API_BASE_URL + "/auth/authorization-request",

            {

                method: "POST",

                headers: {

                    Authorization: "Bearer " + token

                },

                body: formData

            }

        );

        const data = await response.json();

        if (!data.success) {

            showMessage(

                data.message,

                "danger"

            );

            return;

        }

        showMessage(

            data.message,

            "success"

        );

        authorizationForm.reset();

        loadAuthorizationRequests();

    }

    catch (error) {

        console.error(error);

        showMessage(

            "Unable to connect to server.",

            "danger"

        );

    }

}

async function loadAuthorizationRequests() {

    const token = getToken();

    try {

        const response = await fetch(

            API_BASE_URL + "/auth/authorization-requests",

            {

                headers: {

                    Authorization: "Bearer " + token

                }

            }

        );

        const data = await response.json();

        const table = document.getElementById("authorizationTable");

        if (!table) return;

        if (!data.success || data.data.length === 0) {

            table.innerHTML = `

                <tr>

                    <td colspan="5" class="text-center">

                        No authorization requests found.

                    </td>

                </tr>

            `;

            return;

        }

        table.innerHTML = "";

        data.data.forEach(request => {

            table.innerHTML += `

                <tr>

                    <td>${request.authorization_code ?? "-"}</td>

                    <td>${request.purpose}</td>

                    <td>${request.status}</td>

                    <td>${formatDateTime(request.expiry_date)}</td>

                    <td>${formatDateTime(request.created_at)}</td>

                </tr>

            `;

        });

    }

    catch (error) {

        console.error(error);

    }

}

// Load Approved Laboratories

const laboratorySelect = document.getElementById("laboratory");

if (laboratorySelect) {

    loadLaboratories();

}

// Load Chemicals when Laboratory Changes

laboratorySelect?.addEventListener(

    "change",

    loadChemicals

);

async function loadLaboratories() {

    const token = getToken();

    const response = await fetch(

        API_BASE_URL + "/auth/laboratories",

        {

            headers: {

                Authorization: "Bearer " + token

            }

        }

    );

    const data = await response.json();

    const laboratory = document.getElementById("laboratory");

    laboratory.innerHTML =

        `<option value="">Select Laboratory</option>`;

    data.data.forEach(lab => {

        laboratory.innerHTML += `

            <option value="${lab.lab_id}">

                ${lab.lab_name}

            </option>

        `;

    });

}

async function loadChemicals() {

    const token = getToken();

    const labId = this.value;

    const chemical = document.getElementById("chemical");

    chemical.innerHTML =

        `<option>Loading...</option>`;

    const response = await fetch(

        API_BASE_URL +

        "/auth/laboratories/" +

        labId +

        "/chemicals",

        {

            headers: {

                Authorization:

                    "Bearer " + token

            }

        }

    );

    const data = await response.json();

    chemical.innerHTML =

        `<option value="">Select Chemical</option>`;

    data.data.forEach(item => {

        chemical.innerHTML += `

            <option value="${item.chemical_id}">

                ${item.chemical_name}

                (${item.total_stock} ${item.unit})

            </option>

        `;

    });

}

// Load Approved Authorizations

const authorizationSelect = document.getElementById("authorization");

if (authorizationSelect) {

    loadApprovedAuthorizations();

}

async function loadApprovedAuthorizations() {

    const token = getToken();

    try {

        const response = await fetch(

            API_BASE_URL + "/auth/authorization-requests",

            {

                headers: {

                    Authorization: "Bearer " + token

                }

            }

        );

        const data = await response.json();

        authorizationSelect.innerHTML =

            `<option value="">Select Authorization</option>`;

        data.data
            .filter(item => item.status === "Approved")
            .forEach(item => {

                authorizationSelect.innerHTML += `

                    <option value="${item.authorization_id}">

                        ${item.authorization_code}

                    </option>

                `;

            });

    }

    catch (error) {

        console.error(error);

    }

}

// Register Purchase Form

const purchaseForm = document.getElementById("purchaseForm");

if (purchaseForm) {

    purchaseForm.addEventListener(

        "submit",

        submitPurchaseRequest

    );

}

async function submitPurchaseRequest(event) {

    event.preventDefault();

    const token = getToken();

    const payload = {

        authorization_id: document.getElementById("authorization").value,

        lab_id: document.getElementById("laboratory").value,

        chemical_id: document.getElementById("chemical").value,

        quantity: document.getElementById("quantity").value,

        purchase_mode: document.getElementById("purchase_mode").value

    };

    try {

        const response = await fetch(

            API_BASE_URL + "/auth/purchase-request",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: "Bearer " + token

                },

                body: JSON.stringify(payload)

            }

        );

        const data = await response.json();

        if (!data.success) {

            showMessage(

                data.message,

                "danger"

            );

            return;

        }

        showMessage(

            data.message,

            "success"

        );

        purchaseForm.reset();

        document.getElementById("chemical").innerHTML =

            `<option value="">Select Chemical</option>`;

    }

    catch (error) {

        console.error(error);

        showMessage(

            "Unable to connect to server.",

            "danger"

        );

    }

}

// Load Active Purchase Requests

async function loadPurchaseRequests() {

    const token = getToken();

    try {

        const response = await fetch(

            API_BASE_URL + "/auth/purchase-requests",

            {

                headers: {

                    Authorization: "Bearer " + token

                }

            }

        );

        const data = await response.json();

        if (!data.success) {

            purchaseRequestTable.innerHTML = `

                <tr>

                    <td colspan="8" class="text-center">

                        No purchase requests found.

                    </td>

                </tr>

            `;

            return;

        }

        // Show only active requests

        const activeRequests = data.data.filter(function (request) {

            return (

                request.request_status === "Submitted"

                ||

                request.request_status === "Approved"

                ||

                request.request_status === "Reserved"

            );

        });

        if (activeRequests.length === 0) {

            purchaseRequestTable.innerHTML = `

                <tr>

                    <td colspan="8" class="text-center">

                        No active purchase requests.

                    </td>

                </tr>

            `;

            return;

        }

        purchaseRequestTable.innerHTML = "";

        activeRequests.forEach(function (request) {

            purchaseRequestTable.innerHTML += `

                <tr>

                    <td>${request.request_id}</td>

                    <td>${request.lab_name}</td>

                    <td>${request.chemical_name}</td>

                    <td>${request.quantity}</td>

                    <td>${request.purchase_mode}</td>

                    <td>${request.request_status}</td>

                    <td>

                        ${request.reservation_status}

                        ${request.reservation_status === "Reserved"

                            ?

                            `<br>

                            <button
                                class="btn btn-sm btn-primary mt-1"
                                onclick="viewReservationExpiry('${request.purchase_code}','${request.reservation_expiry}')">

                                View

                            </button>`

                            :

                            ""

                        }

                    </td>

                    <td>${request.purchase_code || "-"}</td>

                </tr>

            `;

        });

    }

    catch (error) {

        console.error(error);

    }

}

async function loadPurchaseHistory() {

    const token = getToken();

    try {

        const response = await fetch(

            API_BASE_URL + "/auth/purchase-history",

            {

                headers: {

                    Authorization:

                        "Bearer " + token

                }

            }

        );

        const data = await response.json();

        if (!data.success) {

            purchaseHistoryTable.innerHTML = `

                <tr>

                    <td colspan="6"

                        class="text-center">

                        No completed purchases found.

                    </td>

                </tr>

            `;

            return;

        }

        // Show only completed requests

        const completedPurchases = data.data.filter(function (item) {

            return item.request_status === "Completed";

        });

        if (completedPurchases.length === 0) {

            purchaseHistoryTable.innerHTML = `

                <tr>

                    <td colspan="6"

                        class="text-center">

                        No completed purchases found.

                    </td>

                </tr>

            `;

            return;

        }

        purchaseHistoryTable.innerHTML = "";

        completedPurchases.forEach(function (item) {

            purchaseHistoryTable.innerHTML += `

                <tr>

                    <td>${item.purchase_code}</td>

                    <td>${item.lab_name}</td>

                    <td>${item.chemical_name}</td>

                    <td>${item.quantity}</td>

                    <td>${item.purchase_mode}</td>

                    <td>

                        ${new Date(item.completed_at).toLocaleString()}

                    </td>

                </tr>

            `;

        });

    }

    catch (error) {

        console.error(error);

    }

}

async function loadProfile() {

    const token = getToken();

    try {

        const response = await fetch(

            API_BASE_URL + "/auth/profile",

            {

                headers: {

                    Authorization: "Bearer " + token

                }

            }

        );

        const data = await response.json();

        if (!data.success) {

            showMessage(

                data.message,

                "danger"

            );

            return;

        }

        document.getElementById("full_name").value =
            data.data.full_name;

        document.getElementById("email").value =
            data.data.email;

        document.getElementById("phone").value =
            data.data.phone;

    }

    catch (error) {

        console.error(error);

    }

}
async function updateProfile(event) {

    event.preventDefault();

    const token = getToken();

    const full_name = document
        .getElementById("full_name")
        .value
        .trim();

    const email = document
        .getElementById("email")
        .value
        .trim();

    const phone = document
        .getElementById("phone")
        .value
        .trim();

    try {

        const response = await fetch(

            API_BASE_URL + "/auth/profile",

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    Authorization:

                        "Bearer " + token

                },

                body: JSON.stringify({

                    full_name,

                    email,

                    phone

                })

            }

        );

        const data = await response.json();

        if (!data.success) {

            showMessage(

                data.message,

                "danger"

            );

            return;

        }

        showMessage(

            data.message,

            "success"

        );

        // Update setStorage so all pages show the latest user information

        const loggedUser = getLoggedUser();

        loggedUser.user.full_name = full_name;
        loggedUser.user.email = email;
        loggedUser.user.phone = phone;

        setStorage.setItem(

            "user",

            JSON.stringify(loggedUser)

        );

        // Reload the profile from the server

        loadProfile();

    }

    catch (error) {

        showMessage(

            "Unable to connect to server.",

            "danger"

        );

    }

}
async function changePassword(event) {

    event.preventDefault();

    const current_password = document
        .getElementById("current_password")
        .value
        .trim();

    const new_password = document
        .getElementById("new_password")
        .value
        .trim();

    const confirm_password = document
        .getElementById("confirm_password")
        .value
        .trim();

    if (new_password !== confirm_password) {

        showMessage(

            "New passwords do not match.",

            "danger"

        );

        return;

    }

    const token = getToken();

    try {

        const response = await fetch(

            API_BASE_URL + "/auth/change-password",

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    Authorization:

                        "Bearer " + token

                },

                body: JSON.stringify({

                    current_password,

                    new_password

                })

            }

        );

        const data = await response.json();

        if (!data.success) {

            showMessage(

                data.message,

                "danger"

            );

            return;

        }

        showMessage(

            data.message,

            "success"

        );

        document

            .getElementById("passwordForm")

            .reset();

    }

    catch (error) {

        showMessage(

            "Unable to connect to server.",

            "danger"

        );

    }

}

function viewReservationExpiry(

    purchaseCode,

    expiry

) {

    document.getElementById(

        "modalPurchaseCode"

    ).innerHTML = purchaseCode;

    document.getElementById(

        "modalExpiry"

    ).innerHTML =

        new Date(expiry).toLocaleString();

    const modal = new bootstrap.Modal(

        document.getElementById(

            "reservationModal"

        )

    );

    modal.show();

}

// Load Purchase History for User Dashboard
const purchaseHistoryTable =
    document.getElementById("purchaseHistoryTable");

if (purchaseHistoryTable) {

    loadPurchaseHistory();

}
// Load Purchase Requests
const purchaseRequestTable =
    document.getElementById("purchaseRequestTable");

if (purchaseRequestTable) {

    loadPurchaseRequests();

}
const profileForm = document.getElementById("profileForm");

if (profileForm) {

    loadProfile();

    profileForm.addEventListener(

        "submit",

        updateProfile

    );

}
const passwordForm = document.getElementById("passwordForm");

if (passwordForm) {

    passwordForm.addEventListener(

        "submit",

        changePassword

    );

}