protectPage("admin");

let users = [];
let laboratories = [];
let licenses = [];
let authorizations = [];
let approvedAuthorizations = [];
let purchaseMonitor = [];
let reports = [];
let filteredReports = [];
let admins = [];
let filteredAdmins = [];

const admin = getLoggedUser();

if (admin) {

    console.log(admin);

}

function logout() {

    clearStorage();

    window.location.href = "../index.html";

}

async function loadProfile() {

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/profile",

            {

                headers: {

                    Authorization:

                        "Bearer " +

                        getToken()

                }

            }

        );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        const admin = data.data;

        const createAdminCard =

            document.getElementById(

                "createAdminCard"

            );

        if (createAdminCard) {

            if (admin.is_super_admin) {

                createAdminCard.style.display = "block";
                loadAdmins();

            }

            else {

                createAdminCard.style.display = "none";

            }

        }

        document.getElementById("adminFullName").value =
            admin.full_name;

        document.getElementById("adminEmail").value =
            admin.email;

        document.getElementById("adminPhone").value =
            admin.phone;

        document.getElementById("adminCreatedAt").value =
            new Date(
                admin.created_at
            ).toLocaleString();

    }

    catch (error) {

        console.log(error);

    }

}

async function updateProfile() {

    try {

        const full_name = document
            .getElementById("adminFullName")
            .value
            .trim();

        const phone = document
            .getElementById("adminPhone")
            .value
            .trim();

        if (!full_name || !phone) {

            alert(

                "Full Name and Phone are required."

            );

            return;

        }

        const response = await fetch(

            API_BASE_URL +

            "/admin/profile",

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    Authorization:

                        "Bearer " +

                        getToken()

                },

                body: JSON.stringify({

                    full_name,

                    phone

                })

            }

        );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        alert(

            "Profile updated successfully."

        );

        loadProfile();

    }

    catch (error) {

        console.log(error);

    }

}

async function changePassword() {

    try {

        const current_password = document

            .getElementById("currentPassword")

            .value;

        const new_password = document

            .getElementById("newPassword")

            .value;

        const confirm_password = document

            .getElementById("confirmPassword")

            .value;

        if (

            !current_password ||

            !new_password ||

            !confirm_password

        ) {

            alert("Please fill all fields.");

            return;

        }

        if (

            new_password !== confirm_password

        ) {

            alert("Passwords do not match.");

            return;

        }

        const response = await fetch(

            API_BASE_URL +

            "/admin/change-password",

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    Authorization:

                        "Bearer " +

                        getToken()

                },

                body: JSON.stringify({

                    current_password,

                    new_password,

                    confirm_password

                })

            }

        );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        alert("Password changed successfully.");

        document.getElementById("currentPassword").value = "";

        document.getElementById("newPassword").value = "";

        document.getElementById("confirmPassword").value = "";

    }

    catch (error) {

        console.log(error);

    }

}
function togglePassword(inputId, button) {

    const input = document.getElementById(inputId);

    if (input.type === "password") {

        input.type = "text";

        button.textContent = "Hide";

    } else {

        input.type = "password";

        button.textContent = "Show";

    }

}

async function createAdmin() {

    try {

        const full_name = document

            .getElementById("newAdminName")

            .value

            .trim();

        const email = document

            .getElementById("newAdminEmail")

            .value

            .trim();

        const phone = document

            .getElementById("newAdminPhone")

            .value

            .trim();

        const password = document

            .getElementById("newAdminPassword")

            .value;

        if (

            !full_name ||

            !email ||

            !phone ||

            !password

        ) {

            alert(

                "Please fill all fields."

            );

            return;

        }

        const response = await fetch(

            API_BASE_URL +

            "/admin/create",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    Authorization:

                        "Bearer " +

                        getToken()

                },

                body: JSON.stringify({

                    full_name,

                    email,

                    phone,

                    password

                })

            }

        );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        alert(

            "New admin created successfully."

        );

        document.getElementById("newAdminName").value = "";

        document.getElementById("newAdminEmail").value = "";

        document.getElementById("newAdminPhone").value = "";

        document.getElementById("newAdminPassword").value = "";

    }

    catch (error) {

        console.log(error);

    }

}

async function loadAdmins() {

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/admins",

            {

                headers: {

                    Authorization:

                        "Bearer " +

                        getToken()

                }

            }

        );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        admins = data.data;

        filteredAdmins = [...admins];

        displayAdmins(filteredAdmins);

    }

    catch (error) {

        console.log(error);

    }

}

function displayAdmins(data) {

    const tbody = document.getElementById(

        "adminTableBody"

    );

    tbody.innerHTML = "";

    data.forEach(function(admin) {

        let actionButtons = `

            <button

                class="btn btn-info btn-sm"

                onclick="viewAdmin(${admin.admin_id})">

                View

            </button>

        `;

        // Only normal admins can be edited/deleted
        if (!admin.is_super_admin) {

            actionButtons += `

                <button

                    class="btn btn-warning btn-sm"

                    onclick="editAdmin(${admin.admin_id})">

                    Edit

                </button>

                <button

                    class="btn btn-danger btn-sm"

                    onclick="confirmDeleteAdmin(${admin.admin_id})">

                    Delete

                </button>

            `;

        }

        tbody.innerHTML += `

        <tr>

            <td>${admin.admin_id}</td>

            <td>${admin.full_name}</td>

            <td>${admin.email}</td>

            <td>${admin.phone}</td>

            <td>

                <span class="badge ${admin.status === "Active" ? "bg-success" : "bg-secondary"}">

                    ${admin.status}

                </span>

            </td>

            <td>

                ${actionButtons}

            </td>

        </tr>

        `;

    });

}
async function viewAdmin(id) {

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/admins/" +

            id,

            {

                headers: {

                    Authorization:

                        "Bearer " +

                        getToken()

                }

            }

        );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        const admin = data.data;

        document.getElementById(

            "viewAdminBody"

        ).innerHTML = `

        <table class="table table-bordered">

            <tr>

                <th width="40%">

                    Admin ID

                </th>

                <td>

                    ${admin.admin_id}

                </td>

            </tr>

            <tr>

                <th>

                    Full Name

                </th>

                <td>

                    ${admin.full_name}

                </td>

            </tr>

            <tr>

                <th>

                    Email

                </th>

                <td>

                    ${admin.email}

                </td>

            </tr>

            <tr>

                <th>

                    Phone

                </th>

                <td>

                    ${admin.phone}

                </td>

            </tr>

            <tr>

                <th>

                    Designation

                </th>

                <td>

                    ${admin.designation}

                </td>

            </tr>

            <tr>

                <th>

                    Status

                </th>

                <td>

                    ${admin.status}

                </td>

            </tr>

            <tr>

                <th>

                    Super Admin

                </th>

                <td>

                    ${admin.is_super_admin ? "Yes" : "No"}

                </td>

            </tr>

            <tr>

                <th>

                    Created At

                </th>

                <td>

                    ${new Date(

                        admin.created_at

                    ).toLocaleString()}

                </td>

            </tr>

        </table>

        `;

        new bootstrap.Modal(

            document.getElementById(

                "viewAdminModal"

            )

        ).show();

    }

    catch (error) {

        console.log(error);

    }

}

async function editAdmin(id) {

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/admins/" +

            id,

            {

                headers: {

                    Authorization:

                        "Bearer " +

                        getToken()

                }

            }

        );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        const admin = data.data;

        document.getElementById(

            "editAdminId"

        ).value = admin.admin_id;

        document.getElementById(

            "editAdminName"

        ).value = admin.full_name;

        document.getElementById(

            "editAdminEmail"

        ).value = admin.email;

        document.getElementById(

            "editAdminPhone"

        ).value = admin.phone;

        document.getElementById(

            "editAdminStatus"

        ).value = admin.status;

        new bootstrap.Modal(

            document.getElementById(

                "editAdminModal"

            )

        ).show();

    }

    catch (error) {

        console.log(error);

    }

}

async function updateAdmin() {

    try {

        const id = document.getElementById(

            "editAdminId"

        ).value;

        const full_name = document.getElementById(

            "editAdminName"

        ).value;

        const email = document.getElementById(

            "editAdminEmail"

        ).value;

        const phone = document.getElementById(

            "editAdminPhone"

        ).value;

        const status = document.getElementById(

            "editAdminStatus"

        ).value;

        const response = await fetch(

            API_BASE_URL +

            "/admin/admins/" +

            id,

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    Authorization:

                        "Bearer " +

                        getToken()

                },

                body: JSON.stringify({

                    full_name,

                    email,

                    phone,

                    status

                })

            }

        );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        alert(data.message);

        bootstrap.Modal.getInstance(

            document.getElementById(

                "editAdminModal"

            )

        ).hide();

        loadAdmins();

    }

    catch (error) {

        console.log(error);

    }

}

function confirmDeleteAdmin(id) {

    if (

        !confirm(

            "Are you sure you want to delete this admin?"

        )

    ) {

        return;

    }

    deleteAdmin(id);

}

async function deleteAdmin(id) {

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/admins/" +

            id,

            {

                method: "DELETE",

                headers: {

                    Authorization:

                        "Bearer " +

                        getToken()

                }

            }

        );

        const data = await response.json();

        alert(data.message);

        if (data.success) {

            loadAdmins();

        }

    }

    catch (error) {

        console.log(error);

    }

}

function searchAdmins() {

    const keyword = document

        .getElementById(

            "adminSearch"

        )

        .value

        .toLowerCase()

        .trim();

    filteredAdmins = admins.filter(function(admin) {

        return (

            admin.full_name

                .toLowerCase()

                .includes(keyword)

            ||

            admin.email

                .toLowerCase()

                .includes(keyword)

            ||

            admin.phone

                .toLowerCase()

                .includes(keyword)

        );

    });

    displayAdmins(filteredAdmins);

}

async function loadDashboard() {

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/dashboard",

            {

                headers: {

                    Authorization:

                        "Bearer " +

                        getToken()

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

        const dashboard = data.data;

        document.getElementById("total_users").innerHTML =
            dashboard.total_users;

        document.getElementById("total_laboratories").innerHTML =
            dashboard.total_laboratories;

        document.getElementById("pending_laboratories").innerHTML =
            dashboard.pending_laboratories;

        document.getElementById("approved_laboratories").innerHTML =
            dashboard.approved_laboratories;

        document.getElementById("pending_authorizations").innerHTML =
            dashboard.pending_authorizations;

        document.getElementById("approved_authorizations").innerHTML =
            dashboard.approved_authorizations;

        document.getElementById("total_chemicals").innerHTML =
            dashboard.total_chemicals;

        document.getElementById("total_purchase_requests").innerHTML =
            dashboard.total_purchase_requests;

        document.getElementById("completed_purchases").innerHTML =
            dashboard.completed_purchases;

        document.getElementById("expired_reservations").innerHTML =
            dashboard.expired_reservations;

    }

    catch (error) {

        console.log(error);

        showMessage(

            "Unable to connect to server.",

            "danger"

        );

    }

}
async function loadUsers() {

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/users",

            {

                headers: {

                    Authorization:

                        "Bearer " +

                        getToken()

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

        users = data.data;

        displayUsers();

    }

    catch (error) {

        console.log(error);

    }

}
function displayUsers() {

    const tbody =

        document.getElementById(

            "userTableBody"

        );

    tbody.innerHTML = "";

    users.forEach(function(user){

        tbody.innerHTML += `

        <tr>

            <td>${user.user_id}</td>

            <td>${user.full_name}</td>

            <td>${user.email}</td>

            <td>${user.phone}</td>

            <td>

                ${new Date(

                    user.created_at

                ).toLocaleDateString()}

            </td>

            <td>

                <button

                class="btn btn-info btn-sm"

                onclick="viewUser(${user.user_id})"

                >

                View

                </button>

            </td>

        </tr>

        `;

    });

}
async function searchUsers() {

    const keyword =

        document

        .getElementById(

            "searchKeyword"

        )

        .value

        .trim();

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/users/search?keyword=" +

            encodeURIComponent(keyword),

            {

                headers:{

                    Authorization:

                    "Bearer " +

                    getToken()

                }

            }

        );

        const data = await response.json();

        if(!data.success){

            showMessage(

                data.message,

                "danger"

            );

            return;

        }

        users = data.data;

        displayUsers();

    }

    catch(error){

        console.log(error);

    }

}
async function viewUser(id){

    try{

        const response = await fetch(

            API_BASE_URL +

            "/admin/users/" +

            id,

            {

                headers:{

                    Authorization:

                    "Bearer " +

                    getToken()

                }

            }

        );

        const data = await response.json();

        if(!data.success){

            showMessage(

                data.message,

                "danger"

            );

            return;

        }

        const user = data.data;

        document.getElementById(

            "view_user_id"

        ).innerHTML = user.user_id;

        document.getElementById(

            "view_name"

        ).innerHTML = user.full_name;

        document.getElementById(

            "view_email"

        ).innerHTML = user.email;

        document.getElementById(

            "view_phone"

        ).innerHTML = user.phone;

        document.getElementById(

            "view_created"

        ).innerHTML =

        new Date(

            user.created_at

        ).toLocaleDateString();

        new bootstrap.Modal(

            document.getElementById(

                "userModal"

            )

        ).show();

    }

    catch(error){

        console.log(error);

    }

}

async function loadLaboratories() {

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/laboratories",

            {

                headers: {

                    Authorization:

                        "Bearer " +

                        getToken()

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

        laboratories = data.data;

        displayLaboratories();

    }

    catch (error) {

        console.log(error);

    }

}
function displayLaboratories() {

    const tbody = document.getElementById(

        "laboratoryTableBody"

    );

    tbody.innerHTML = "";

    laboratories.forEach(function(lab){

        let buttons = `

            <button

                class="btn btn-info btn-sm"

                onclick="viewLaboratory(${lab.lab_id})"

            >

                View

            </button>

        `;

        if(lab.status === "Pending"){

            buttons += `

                <button

                    class="btn btn-success btn-sm"

                    onclick="approveLaboratory(${lab.lab_id})"

                >

                    Approve

                </button>

                <button

                    class="btn btn-danger btn-sm"

                    onclick="rejectLaboratory(${lab.lab_id})"

                >

                    Reject

                </button>

            `;

        }

        else if(lab.status === "Approved"){

            buttons += `

                <button

                    class="btn btn-warning btn-sm"

                    onclick="suspendLaboratory(${lab.lab_id})"

                >

                    Suspend

                </button>

            `;

        }

        else if(lab.status === "Suspended"){

            buttons += `

                <button

                    class="btn btn-primary btn-sm"

                    onclick="reactivateLaboratory(${lab.lab_id})"

                >

                    Reactivate

                </button>

            `;

        }

        tbody.innerHTML += `

            <tr>

                <td>${lab.lab_id}</td>

                <td>${lab.lab_name}</td>

                <td>${lab.owner_name}</td>

                <td>${lab.email}</td>

                <td>${lab.phone}</td>

                <td>${lab.status}</td>

                <td>

                    ${buttons}

                </td>

            </tr>

        `;

    });

}
async function searchLaboratories() {

    const keyword = document

        .getElementById(

            "searchKeyword"

        )

        .value

        .trim()

        .toLowerCase();

    if(keyword === ""){

        displayLaboratories();

        return;

    }

    const filtered = laboratories.filter(function(lab){

        return (

            lab.lab_name.toLowerCase().includes(keyword) ||

            lab.owner_name.toLowerCase().includes(keyword) ||

            lab.email.toLowerCase().includes(keyword) ||

            lab.phone.includes(keyword)

        );

    });

    const temp = laboratories;

    laboratories = filtered;

    displayLaboratories();

    laboratories = temp;

}

function refreshLaboratories(){

    document.getElementById(

        "searchKeyword"

    ).value = "";

    loadLaboratories();

}

async function viewLaboratory(id) {

    const token = getToken();

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/laboratories/" +

            id,

            {

                headers: {

                    Authorization:

                        "Bearer " +

                        token

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

        const laboratory = data.data;

        document.getElementById(

            "view_lab_name"

        ).innerHTML = laboratory.lab_name;

        document.getElementById(

            "view_owner_name"

        ).innerHTML = laboratory.owner_name;

        document.getElementById(

            "view_email"

        ).innerHTML = laboratory.email;

        document.getElementById(

            "view_phone"

        ).innerHTML = laboratory.phone;

        document.getElementById(

            "view_address"

        ).innerHTML = laboratory.address;

        document.getElementById(

            "view_status"

        ).innerHTML = laboratory.status;

        document.getElementById(

            "view_created_at"

        ).innerHTML =

            new Date(

                laboratory.created_at

            ).toLocaleDateString();

        document.getElementById(

            "view_rejection_reason"

        ).innerHTML =

            laboratory.rejection_reason ??

            "-";

        const modal = new bootstrap.Modal(

            document.getElementById(

                "laboratoryModal"

            )

        );

        modal.show();

    }

    catch (error) {

        console.log(error);

        showMessage(

            "Unable to load laboratory details.",

            "danger"

        );

    }

}
async function approveLaboratory(id) {

    if (!confirm("Approve this laboratory?")) {

        return;

    }

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/laboratories/" +

            id +

            "/approve",

            {

                method: "PUT",

                headers: {

                    Authorization:

                        "Bearer " +

                        getToken()

                }

            }

        );

        const data = await response.json();

        showMessage(

            data.message,

            data.success

                ? "success"

                : "danger"

        );

        if (data.success) {

            loadLaboratories();

            loadDashboard();

        }

    }

    catch (error) {

        console.log(error);

        showMessage(

            "Unable to approve laboratory.",

            "danger"

        );

    }

}
async function rejectLaboratory(id) {

    const reason = prompt(

        "Enter rejection reason:"

    );

    if (

        reason === null ||

        reason.trim() === ""

    ) {

        return;

    }

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/laboratories/" +

            id +

            "/reject",

            {

                method: "PUT",

                headers: {

                    Authorization:

                        "Bearer " +

                        getToken(),

                    "Content-Type":

                        "application/json"

                },

                body: JSON.stringify({

                    reason: reason

                })

            }

        );

        const data = await response.json();

        showMessage(

            data.message,

            data.success

                ? "success"

                : "danger"

        );

        if (data.success) {

            loadLaboratories();

            loadDashboard();

        }

    }

    catch (error) {

        console.log(error);

        showMessage(

            "Unable to reject laboratory.",

            "danger"

        );

    }

}

async function suspendLaboratory(id) {

    if (!confirm("Suspend this laboratory?")) {

        return;

    }

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/laboratories/" +

            id +

            "/suspend",

            {

                method: "PUT",

                headers: {

                    Authorization:

                        "Bearer " +

                        getToken()

                }

            }

        );

        const data = await response.json();

        showMessage(

            data.message,

            data.success

                ? "success"

                : "danger"

        );

        if (data.success) {

            loadLaboratories();

            loadDashboard();

        }

    }

    catch (error) {

        console.log(error);

        showMessage(

            "Unable to suspend laboratory.",

            "danger"

        );

    }

}

async function reactivateLaboratory(id) {

    if (!confirm("Reactivate this laboratory?")) {

        return;

    }

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/laboratories/" +

            id +

            "/reactivate",

            {

                method: "PUT",

                headers: {

                    Authorization:

                        "Bearer " +

                        getToken()

                }

            }

        );

        const data = await response.json();

        showMessage(

            data.message,

            data.success

                ? "success"

                : "danger"

        );

        if (data.success) {

            loadLaboratories();

            loadDashboard();

        }

    }

    catch (error) {

        console.log(error);

        showMessage(

            "Unable to reactivate laboratory.",

            "danger"

        );

    }

}

async function loadLicenses() {

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/licenses",

            {

                headers: {

                    Authorization:

                    "Bearer " +

                    getToken()

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

        licenses = data.data;

        displayLicenses();

    }

    catch (error) {

        console.log(error);

    }

}

function displayLicenses() {

    const tbody =

        document.getElementById(

            "licenseTableBody"

        );

    if (!tbody) return;

    tbody.innerHTML = "";

    licenses.forEach(function (license) {

        tbody.innerHTML += `

        <tr>

            <td>${license.license_id}</td>

            <td>${license.license_number}</td>

            <td>${license.laboratory_name}</td>

            <td>${license.issue_date}</td>

            <td>${license.expiry_date}</td>

            <td>${license.status}</td>

            <td>

                <button

                    class="btn btn-info btn-sm"

                    onclick="viewLicense(${license.license_id})">

                    View

                </button>

                <button

                    class="btn btn-warning btn-sm"

                    onclick="editLicense(${license.license_id})">

                    Edit

                </button>

                <button

                    class="btn btn-danger btn-sm"

                    onclick="deleteLicense(${license.license_id})">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}

async function registerLicense(e) {

    e.preventDefault();

    const id =

        document.getElementById(

            "license_id"

        ).value;

    try {

        const response = await fetch(

            API_BASE_URL +

            (

                id

                    ? "/admin/licenses/" + id

                    : "/admin/licenses"

            ),

            {

                method:

                    id

                        ? "PUT"

                        : "POST",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: "Bearer " + getToken()

                },

                body: JSON.stringify({

                    license_number:
                        document.getElementById("license_number").value,

                    laboratory_name:
                        document.getElementById("laboratory_name").value,

                    issued_by:
                        document.getElementById("issued_by").value,

                    issue_date:
                        document.getElementById("issue_date").value,

                    expiry_date:
                        document.getElementById("expiry_date").value,

                    status:
                        document.getElementById("status").value

                })

            }

        );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        alert(data.message);

        document.getElementById(

            "license_id"

        ).value = "";

        document.querySelector(

            "#licenseForm button"

        ).innerHTML =

            "Register License";

        document.getElementById(

            "licenseForm"

        ).reset();

        document.getElementById(

            "issued_by"

        ).value =

            "Sub District Magistrate";

        document.getElementById(

            "status"

        ).value =

            "Active";

        loadLicenses();

    }

    catch (error) {

        console.log(error);

    }

}

async function viewLicense(id) {

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/licenses/" +

            id,

            {

                headers: {

                    Authorization:

                    "Bearer " +

                    getToken()

                }

            }

        );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        const license = data.data;

        document.getElementById("licenseDetails").innerHTML = `

        <table class="table table-bordered">

        <tr>

        <th>License Number</th>

        <td>${license.license_number}</td>

        </tr>

        <tr>

        <th>Laboratory</th>

        <td>${license.laboratory_name}</td>

        </tr>

        <tr>

        <th>Issued By</th>

        <td>${license.issued_by}</td>

        </tr>

        <tr>

        <th>Issue Date</th>

        <td>${license.issue_date}</td>

        </tr>

        <tr>

        <th>Expiry Date</th>

        <td>${license.expiry_date}</td>

        </tr>

        <tr>

        <th>Status</th>

        <td>${license.status}</td>

        </tr>

        `;

        new bootstrap.Modal(

            document.getElementById(

                "licenseModal"

            )

        ).show();

    }

    catch (error) {

        console.log(error);

    }

}
function searchLicenses() {

    const keyword =

    document

    .getElementById(

        "licenseSearch"

    )

    .value

    .toLowerCase();

    const filtered = licenses.filter(

        license =>

        license.license_number

        .toLowerCase()

        .includes(keyword)

        ||

        license.laboratory_name

        .toLowerCase()

        .includes(keyword)

    );

    const tbody =

    document.getElementById(

        "licenseTableBody"

    );

    tbody.innerHTML = "";

    filtered.forEach(function (license) {

        tbody.innerHTML += `

        <tr>

        <td>${license.license_id}</td>

        <td>${license.license_number}</td>

        <td>${license.laboratory_name}</td>

        <td>${license.issue_date}</td>

        <td>${license.expiry_date}</td>

        <td>${license.status}</td>

        <td>

        <button

        class="btn btn-info btn-sm"

        onclick="viewLicense(${license.license_id})">

        View

        </button>

        </td>

        </tr>

        `;

    });

}

async function editLicense(id) {

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/licenses/" +

            id,

            {

                headers: {

                    Authorization:

                    "Bearer " +

                    getToken()

                }

            }

        );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        const license = data.data;

        document.getElementById("license_id").value =
            license.license_id;

        document.getElementById("license_number").value =
            license.license_number;

        document.getElementById("laboratory_name").value =
            license.laboratory_name;

        document.getElementById("issued_by").value =
            license.issued_by;

        document.getElementById("issue_date").value =
            license.issue_date.split("T")[0];

        document.getElementById("expiry_date").value =
            license.expiry_date.split("T")[0];

        document.getElementById("status").value =
            license.status;

        document.querySelector(

            "#licenseForm button"

        ).innerHTML =

        "Update License";

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

    catch(error){

        console.log(error);

    }

}
async function deleteLicense(id) {

    const confirmDelete = confirm(

        "Are you sure you want to delete this license?"

    );

    if (!confirmDelete) {

        return;

    }

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/licenses/" +

            id,

            {

                method: "DELETE",

                headers: {

                    Authorization:

                        "Bearer " +

                        getToken()

                }

            }

        );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        alert(data.message);

        loadLicenses();

    }

    catch (error) {

        console.log(error);

    }

}
async function loadPendingAuthorizations() {

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/authorizations/pending",

            {

                headers: {

                    Authorization:

                        "Bearer " +

                        getToken()

                }

            }

        );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        authorizations = data.data;

        displayAuthorizations();

    }

    catch (error) {

        console.log(error);

    }

}
function displayAuthorizations() {

    const tbody = document.getElementById(

        "authorizationTableBody"

    );

    tbody.innerHTML = "";

    authorizations.forEach(function (authorization) {

        tbody.innerHTML += `

        <tr>

            <td>${authorization.authorization_id}</td>

            <td>${authorization.full_name}</td>

            <td>${authorization.authorization_code}</td>

            <td>
<button

class="btn btn-secondary btn-sm"

onclick="viewProof('${authorization.proof_document}')">

View Proof

</button>

            </td>

            <td>

                ${authorization.purpose}

            </td>

            <td>

                ${authorization.status}

            </td>

            <td>

                <button

                class="btn btn-info btn-sm"

                onclick="viewAuthorization(${authorization.authorization_id})">

                View

                </button>

                <button

                class="btn btn-success btn-sm"

                onclick="approveAuthorization(${authorization.authorization_id})">

                Approve

                </button>

                <button

                class="btn btn-danger btn-sm"

                onclick="rejectAuthorization(${authorization.authorization_id})">

                Reject

                </button>

            </td>

        </tr>

        `;

    });

}

function viewProof(fileName) {

    const image = document.getElementById("proofImage");

    const pdf = document.getElementById("proofPDF");

    image.style.display = "none";
    pdf.style.display = "none";

    const fileURL =
        "/uploads/proof/" + fileName;

    const extension =
        fileName
        .split(".")
        .pop()
        .toLowerCase();

    if (

        extension === "jpg" ||

        extension === "jpeg" ||

        extension === "png"

    ) {

        image.src = fileURL;

        image.style.display = "block";

    }

    else if (

        extension === "pdf"

    ) {

        pdf.src = fileURL;

        pdf.style.display = "block";

    }

    else {

        alert("Unsupported file type.");

        return;

    }

    const modal = new bootstrap.Modal(

        document.getElementById("proofModal")

    );

    modal.show();

}

function viewAuthorization(id) {

    const authorization = authorizations.find(

        item => item.authorization_id == id

    );

    if (!authorization) {

        return;

    }

    document.getElementById("authorizationDetails").innerHTML = `

        <table class="table table-bordered">

            <tr>

                <th width="35%">Authorization ID</th>

                <td>${authorization.authorization_id}</td>

            </tr>

            <tr>

                <th>Authorization Code</th>

                <td>${authorization.authorization_code}</td>

            </tr>

            <tr>

                <th>User</th>

                <td>${authorization.full_name}</td>

            </tr>

            <tr>

                <th>Purpose</th>

                <td>${authorization.purpose}</td>

            </tr>

            <tr>

                <th>Proof Document</th>

                <td>${authorization.proof_document}</td>

            </tr>

            <tr>

                <th>Status</th>

                <td>${authorization.status}</td>

            </tr>

            <tr>

                <th>Issue Date</th>

                <td>${authorization.issue_date || "-"}</td>

            </tr>

            <tr>

                <th>Expiry Date</th>

                <td>${authorization.expiry_date || "-"}</td>

            </tr>

            <tr>

                <th>Rejection Reason</th>

                <td>${authorization.rejection_reason || "N/A"}</td>

            </tr>

        </table>

    `;

    new bootstrap.Modal(

        document.getElementById("authorizationModal")

    ).show();

}
async function approveAuthorization(id) {

    if (

        !confirm(

            "Approve this authorization request?"

        )

    ) {

        return;

    }

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/authorizations/" +

            id +

            "/approve",

            {

                method: "PUT",

                headers: {

                    Authorization:

                        "Bearer " +

                        getToken(),

                    "Content-Type":

                        "application/json"

                }

            }

        );

        const data = await response.json();

        alert(data.message);

        if (data.success) {

            loadPendingAuthorizations();

        }

    }

    catch (error) {

        console.log(error);

        alert("Something went wrong.");

    }

}
function rejectAuthorization(id) {

    document.getElementById(

        "rejectAuthorizationId"

    ).value = id;

    document.getElementById(

        "rejectReason"

    ).value = "";

    new bootstrap.Modal(

        document.getElementById(

            "rejectAuthorizationModal"

        )

    ).show();

}
async function submitAuthorizationReject() {

    const id = document.getElementById(

        "rejectAuthorizationId"

    ).value;

    const reason = document.getElementById(

        "rejectReason"

    ).value.trim();

    if (!reason) {

        alert(

            "Please enter rejection reason."

        );

        return;

    }

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/authorizations/" +

            id +

            "/reject",

            {

                method: "PUT",

                headers: {

                    Authorization:

                        "Bearer " +

                        getToken(),

                    "Content-Type":

                        "application/json"

                },

                body: JSON.stringify({

                    reason

                })

            }

        );

        const data = await response.json();

        alert(data.message);

        if (data.success) {

            bootstrap.Modal.getInstance(

                document.getElementById(

                    "rejectAuthorizationModal"

                )

            ).hide();

            loadPendingAuthorizations();

        }

    }

    catch (error) {

        console.log(error);

        alert("Something went wrong.");

    }

}
function searchAuthorizations() {

    const keyword = document
        .getElementById("searchAuthorization")
        .value
        .toLowerCase()
        .trim();

    const tbody = document.getElementById(
        "authorizationTableBody"
    );

    tbody.innerHTML = "";

    const filtered = authorizations.filter(function (authorization) {

        return (

            authorization.full_name
                .toLowerCase()
                .includes(keyword)

            ||

            authorization.authorization_code
                .toLowerCase()
                .includes(keyword)

            ||

            authorization.purpose
                .toLowerCase()
                .includes(keyword)

        );

    });

    filtered.forEach(function (authorization) {

        tbody.innerHTML += `

        <tr>

            <td>${authorization.authorization_id}</td>

            <td>${authorization.full_name}</td>

            <td>${authorization.authorization_code}</td>

            <td>${authorization.proof_document}</td>

            <td>${authorization.purpose}</td>

            <td>${authorization.status}</td>

            <td>

                <button

                    class="btn btn-info btn-sm"

                    onclick="viewAuthorization(${authorization.authorization_id})">

                    View

                </button>

                <button

                    class="btn btn-success btn-sm"

                    onclick="approveAuthorization(${authorization.authorization_id})">

                    Approve

                </button>

                <button

                    class="btn btn-danger btn-sm"

                    onclick="rejectAuthorization(${authorization.authorization_id})">

                    Reject

                </button>

            </td>

        </tr>

        `;

    });

}
async function loadApprovedAuthorizations() {

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/authorizations/approved",

            {

                headers: {

                    Authorization:

                        "Bearer " +

                        getToken()

                }

            }

        );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        approvedAuthorizations = data.data;

        displayApprovedAuthorizations();

    }

    catch (error) {

        console.log(error);

    }

}
function displayApprovedAuthorizations() {

    const tbody = document.getElementById(

        "approvedAuthorizationTableBody"

    );

    tbody.innerHTML = "";

    approvedAuthorizations.forEach(function (authorization) {

        tbody.innerHTML += `

        <tr>

            <td>${authorization.authorization_id}</td>

            <td>${authorization.full_name}</td>

            <td>${authorization.authorization_code}</td>

            <td>${authorization.purpose}</td>

            <td>

                ${authorization.issue_date ?

                new Date(

                    authorization.issue_date

                ).toLocaleDateString()

                :

                "-"}

            </td>

            <td>

                ${authorization.expiry_date ?

                new Date(

                    authorization.expiry_date

                ).toLocaleDateString()

                :

                "-"}

            </td>

            <td>

                ${authorization.status}

            </td>

            <td>

    <div class="d-flex gap-2">

        <button

            class="btn btn-secondary btn-sm"

            onclick="viewProof('${authorization.proof_document}')">

            View Proof

        </button>

        <button

            class="btn btn-info btn-sm"

            onclick="viewApprovedAuthorization(${authorization.authorization_id})">

            View Details

        </button>

    </div>

</td>

        </tr>

        `;

    });

}
function viewApprovedAuthorization(id) {

    const authorization = approvedAuthorizations.find(

        item => item.authorization_id == id

    );

    if (!authorization) {

        return;

    }

    document.getElementById("authorizationDetails").innerHTML = `

        <table class="table table-bordered">

            <tr>

                <th width="35%">

                    Authorization ID

                </th>

                <td>

                    ${authorization.authorization_id}

                </td>

            </tr>

            <tr>

                <th>

                    Authorization Code

                </th>

                <td>

                    ${authorization.authorization_code}

                </td>

            </tr>

            <tr>

                <th>

                    User

                </th>

                <td>

                    ${authorization.full_name}

                </td>

            </tr>

            <tr>

                <th>

                    Purpose

                </th>

                <td>

                    ${authorization.purpose}

                </td>

            </tr>

            <tr>

                <th>

                    Proof Document

                </th>

                <td>

                    ${authorization.proof_document || "-"}

                </td>

            </tr>

            <tr>

                <th>

                    Status

                </th>

                <td>

                    ${authorization.status}

                </td>

            </tr>

            <tr>

                <th>

                    Issue Date

                </th>

                <td>

                    ${authorization.issue_date ?

                        new Date(

                            authorization.issue_date

                        ).toLocaleDateString()

                        :

                        "-"}

                </td>

            </tr>

            <tr>

                <th>

                    Expiry Date

                </th>

                <td>

                    ${authorization.expiry_date ?

                        new Date(

                            authorization.expiry_date

                        ).toLocaleDateString()

                        :

                        "-"}

                </td>

            </tr>

            <tr>

                <th>

                    Rejection Reason

                </th>

                <td>

                    ${authorization.rejection_reason || "N/A"}

                </td>

            </tr>

        </table>

    `;

    new bootstrap.Modal(

        document.getElementById(

            "authorizationModal"

        )

    ).show();

}
function searchApprovedAuthorizations() {

    const keyword = document
        .getElementById("approvedSearch")
        .value
        .toLowerCase()
        .trim();

    const tbody = document.getElementById(
        "approvedAuthorizationTableBody"
    );

    tbody.innerHTML = "";

    const filtered = approvedAuthorizations.filter(function (authorization) {

        return (

            authorization.full_name
                .toLowerCase()
                .includes(keyword)

            ||

            authorization.authorization_code
                .toLowerCase()
                .includes(keyword)

            ||

            authorization.purpose
                .toLowerCase()
                .includes(keyword)

        );

    });

    filtered.forEach(function (authorization) {

        tbody.innerHTML += `

        <tr>

            <td>${authorization.authorization_id}</td>

            <td>${authorization.full_name}</td>

            <td>${authorization.authorization_code}</td>

            <td>${authorization.purpose}</td>

            <td>

                ${authorization.issue_date
                    ? new Date(authorization.issue_date).toLocaleDateString()
                    : "-"}

            </td>

            <td>

                ${authorization.expiry_date
                    ? new Date(authorization.expiry_date).toLocaleDateString()
                    : "-"}

            </td>

            <td>${authorization.status}</td>

            <td>

                <button

                    class="btn btn-info btn-sm"

                    onclick="viewApprovedAuthorization(${authorization.authorization_id})">

                    View

                </button>

            </td>

        </tr>

        `;

    });

}
async function loadPurchaseMonitor() {

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/purchase-monitor",

            {

                headers: {

                    Authorization:

                    "Bearer " +

                    getToken()

                }

            }

        );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        purchaseMonitor = data.data;

        displayPurchaseMonitor();

    }

    catch (error) {

        console.log(error);

    }

}
function displayPurchaseMonitor() {

    const tbody = document.getElementById(

        "purchaseMonitorTableBody"

    );

    tbody.innerHTML = "";

    purchaseMonitor.forEach(function (purchase) {

        tbody.innerHTML += `

        <tr>

            <td>${purchase.request_id}</td>

            <td>${purchase.user_name}</td>

            <td>${purchase.lab_name}</td>

            <td>${purchase.chemical_name}</td>

            <td>

                ${purchase.quantity}

                ${purchase.unit}

            </td>

            <td>

                ${purchase.purchase_code || "-"}

            </td>

            <td>

                ${purchase.request_status}

            </td>

            <td>

                ${purchase.reservation_status}

            </td>

            <td>

                ${new Date(

                    purchase.request_date

                ).toLocaleDateString()}

            </td>

            <td>

                <button

                    class="btn btn-info btn-sm"

                    onclick="viewPurchase(${purchase.request_id})">

                    View

                </button>

            </td>

        </tr>

        `;

    });

}
function viewPurchase(id) {

    const purchase = purchaseMonitor.find(

        item => item.request_id == id

    );

    if (!purchase) {

        return;

    }

    document.getElementById("purchaseDetails").innerHTML = `

        <table class="table table-bordered">

            <tr>

                <th width="35%">Request ID</th>

                <td>${purchase.request_id}</td>

            </tr>

            <tr>

                <th>User</th>

                <td>${purchase.user_name}</td>

            </tr>

            <tr>

                <th>Laboratory</th>

                <td>${purchase.lab_name}</td>

            </tr>

            <tr>

                <th>Chemical</th>

                <td>${purchase.chemical_name}</td>

            </tr>

            <tr>

                <th>Quantity</th>

                <td>${purchase.quantity} ${purchase.unit}</td>

            </tr>

            <tr>

                <th>Purchase Mode</th>

                <td>${purchase.purchase_mode}</td>

            </tr>

            <tr>

                <th>Authorization Code</th>

                <td>${purchase.authorization_code}</td>

            </tr>

            <tr>

                <th>Purchase Code</th>

                <td>${purchase.purchase_code || "-"}</td>

            </tr>

            <tr>

                <th>Request Status</th>

                <td>${purchase.request_status}</td>

            </tr>

            <tr>

                <th>Reservation Status</th>

                <td>${purchase.reservation_status}</td>

            </tr>

            <tr>

                <th>Request Date</th>

                <td>

                    ${new Date(

                        purchase.request_date

                    ).toLocaleString()}

                </td>

            </tr>

            <tr>

                <th>Completed Date</th>

                <td>

                    ${purchase.completed_at

                        ?

                        new Date(

                            purchase.completed_at

                        ).toLocaleString()

                        :

                        "-"}

                </td>

            </tr>

        </table>

    `;

    new bootstrap.Modal(

        document.getElementById(

            "purchaseModal"

        )

    ).show();

}
function searchPurchases() {

    const keyword = document

        .getElementById("purchaseSearch")

        .value

        .toLowerCase()

        .trim();

    const status = document

        .getElementById("statusFilter")

        .value;

    const reservation = document

        .getElementById("reservationFilter")

        .value;

    const tbody = document.getElementById(

        "purchaseMonitorTableBody"

    );

    tbody.innerHTML = "";

    const filtered = purchaseMonitor.filter(function (purchase) {

        const keywordMatch =

            purchase.user_name.toLowerCase().includes(keyword)

            ||

            purchase.lab_name.toLowerCase().includes(keyword)

            ||

            purchase.chemical_name.toLowerCase().includes(keyword)

            ||

            (purchase.purchase_code || "")

                .toLowerCase()

                .includes(keyword);

        const statusMatch =

            status === ""

            ||

            purchase.request_status === status;

        const reservationMatch =

            reservation === ""

            ||

            purchase.reservation_status === reservation;

        return (

            keywordMatch

            &&

            statusMatch

            &&

            reservationMatch

        );

    });

    filtered.forEach(function (purchase) {

        tbody.innerHTML += `

        <tr>

            <td>${purchase.request_id}</td>

            <td>${purchase.user_name}</td>

            <td>${purchase.lab_name}</td>

            <td>${purchase.chemical_name}</td>

            <td>${purchase.quantity} ${purchase.unit}</td>

            <td>${purchase.purchase_code || "-"}</td>

            <td>${purchase.request_status}</td>

            <td>${purchase.reservation_status}</td>

            <td>${new Date(purchase.request_date).toLocaleDateString()}</td>

            <td>

                <button

                    class="btn btn-info btn-sm"

                    onclick="viewPurchase(${purchase.request_id})">

                    View

                </button>

            </td>

        </tr>

        `;

    });

}
async function loadReports() {

    try {

        const response = await fetch(

            API_BASE_URL +

            "/admin/reports/purchases",

            {

                headers: {

                    Authorization:

                        "Bearer " +

                        getToken()

                }

            }

        );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        reports = data.data;

       filteredReports = [...reports];

        displayReports(filteredReports);

    }

    catch (error) {

        console.log(error);

    }

}
function displayReports(data) {

    const tbody = document.getElementById(
        "reportTableBody"
    );

    tbody.innerHTML = "";

    data.forEach(function(report) {

        tbody.innerHTML += `

        <tr>

            <td>${report.request_id}</td>

            <td>${report.user_name}</td>

            <td>${report.lab_name}</td>

            <td>${report.chemical_name}</td>

            <td>${report.quantity} ${report.unit}</td>

            <td>${report.purchase_code || "-"}</td>

            <td>${report.request_status}</td>

            <td>${report.reservation_status}</td>

            <td>${new Date(report.request_date).toLocaleDateString()}</td>

            <td>

                <button

                    class="btn btn-info btn-sm"

                    onclick="viewReport(${report.request_id})">

                    View

                </button>

            </td>

        </tr>

        `;

    });

}
function viewReport(id) {

    const report = reports.find(

        item => item.request_id == id

    );

    if (!report) {

        return;

    }

    document.getElementById("reportDetails").innerHTML = `

        <table class="table table-bordered">

            <tr>

                <th width="35%">Request ID</th>

                <td>${report.request_id}</td>

            </tr>

            <tr>

                <th>User</th>

                <td>${report.user_name}</td>

            </tr>

            <tr>

                <th>Laboratory</th>

                <td>${report.lab_name}</td>

            </tr>

            <tr>

                <th>Chemical</th>

                <td>${report.chemical_name}</td>

            </tr>

            <tr>

                <th>Quantity</th>

                <td>${report.quantity} ${report.unit}</td>

            </tr>

            <tr>

                <th>Purchase Mode</th>

                <td>${report.purchase_mode}</td>

            </tr>

            <tr>

                <th>Authorization Code</th>

                <td>${report.authorization_code}</td>

            </tr>

            <tr>

                <th>Purchase Code</th>

                <td>${report.purchase_code || "-"}</td>

            </tr>

            <tr>

                <th>Request Status</th>

                <td>${report.request_status}</td>

            </tr>

            <tr>

                <th>Reservation Status</th>

                <td>${report.reservation_status}</td>

            </tr>

            <tr>

                <th>Request Date</th>

                <td>

                    ${new Date(

                        report.request_date

                    ).toLocaleString()}

                </td>

            </tr>

            <tr>

                <th>Completed Date</th>

                <td>

                    ${report.completed_at ?

                    new Date(

                        report.completed_at

                    ).toLocaleString()

                    :

                    "-"}

                </td>

            </tr>

        </table>

    `;

    new bootstrap.Modal(

        document.getElementById(

            "reportModal"

        )

    ).show();

}
function searchReports() {

    const keyword = document
        .getElementById("reportSearch")
        .value
        .toLowerCase()
        .trim();

    const status = document
        .getElementById("reportStatusFilter")
        .value;

    const reservation = document
        .getElementById("reportReservationFilter")
        .value;

    filteredReports = reports.filter(function (report) {

        const keywordMatch =

            report.user_name.toLowerCase().includes(keyword)

            ||

            report.lab_name.toLowerCase().includes(keyword)

            ||

            report.chemical_name.toLowerCase().includes(keyword)

            ||

            (report.purchase_code || "")
                .toLowerCase()
                .includes(keyword);

        const statusMatch =

            status === ""

            ||

            report.request_status === status;

        const reservationMatch =

            reservation === ""

            ||

            report.reservation_status === reservation;

        return (

            keywordMatch

            &&

            statusMatch

            &&

            reservationMatch

        );

    });

    displayReports(filteredReports);

}

function downloadReportExcel() {

    const excelData = filteredReports.map(function(report) {

        return {

            "Request ID": report.request_id,

            "User": report.user_name,

            "Laboratory": report.lab_name,

            "Chemical": report.chemical_name,

            "Quantity": report.quantity,

            "Unit": report.unit,

            "Purchase Mode": report.purchase_mode,

            "Authorization Code": report.authorization_code,

            "Purchase Code": report.purchase_code,

            "Request Status": report.request_status,

            "Reservation Status": report.reservation_status,

            "Request Date": report.request_date,

            "Completed Date": report.completed_at

        };

    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Purchase Reports"

    );

    XLSX.writeFile(

        workbook,

        "Purchase_Reports.xlsx"

    );

}




const purchaseSearch = document.getElementById("purchaseSearch");

if (purchaseSearch) {

    purchaseSearch.addEventListener(

        "keyup",

        searchPurchases

    );

}

const statusFilter = document.getElementById("statusFilter");

if (statusFilter) {

    statusFilter.addEventListener(

        "change",

        searchPurchases

    );

}

const reservationFilter = document.getElementById("reservationFilter");

if (reservationFilter) {

    reservationFilter.addEventListener(

        "change",

        searchPurchases

    );

}
const pendingSearch = document.getElementById("searchAuthorization");

if (pendingSearch) {

    pendingSearch.addEventListener(

        "keyup",

        searchAuthorizations

    );

}

const approvedSearch = document.getElementById("approvedSearch");

if (approvedSearch) {

    approvedSearch.addEventListener(

        "keyup",

        searchApprovedAuthorizations

    );

}
const licenseForm =
document.getElementById("licenseForm");

if (licenseForm) {

    licenseForm.addEventListener(

        "submit",

        registerLicense

    );

}

const searchBtn = document.getElementById(

    "searchBtn"

);

if(searchBtn){

    searchBtn.addEventListener(

        "click",

        searchLaboratories

    );

}

const refreshBtn = document.getElementById(

    "refreshBtn"

);

if(refreshBtn){

    refreshBtn.addEventListener(

        "click",

        refreshLaboratories

    );

}

const laboratorySearch = document.getElementById(

    "searchKeyword"

);

if(laboratorySearch){

    laboratorySearch.addEventListener(

        "keypress",

        function(event){

            if(event.key === "Enter"){

                event.preventDefault();

                searchLaboratories();

            }

        }

    );

}

if(

    window.location.pathname.includes(

        "laboratories.html"

    )

){

    loadLaboratories();

}

if (

    window.location.pathname.includes(

        "dashboard.html"

    )

) {

    loadDashboard();

}
if(

    window.location.pathname.includes(

        "users.html"

    )

){

    loadUsers();

}
if (

window.location.pathname.includes(

"license-registration.html"

)

) {

    loadLicenses();

}
if (

    window.location.pathname.includes(

        "authorizations.html"

    )

) {

    loadPendingAuthorizations();
    loadApprovedAuthorizations();

}
if (

    window.location.pathname.includes(

        "purchase-monitor.html"

    )

) {

    loadPurchaseMonitor();

}
if (

    window.location.pathname.includes(

        "reports.html"

    )

) {

    loadReports();

}

if (

    window.location.pathname.includes(

        "profile.html"

    )

) {

    loadProfile();

}