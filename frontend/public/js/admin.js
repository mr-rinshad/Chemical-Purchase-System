protectPage("admin");

let users = [];
let laboratories = [];

const admin = getLoggedUser();

if (admin) {

    console.log(admin);

}

function logout() {

    localStorage.removeItem("user");

    window.location.href = "../index.html";

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