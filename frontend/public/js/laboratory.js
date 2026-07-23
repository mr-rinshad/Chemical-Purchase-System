protectPage("laboratory");

let purchaseReport = [];
const laboratory = getLoggedUser();

if (document.getElementById("welcome")) {

    document.getElementById("welcome").innerHTML =
        "Welcome, " +
        laboratory.laboratory.lab_name;

}

if (document.getElementById("email")) {

    document.getElementById("email").innerHTML =
        laboratory.laboratory.email;

}

// Dashboard Function

async function loadDashboard() {

    const token = getToken();

    try {

        const response = await fetch(

            API_BASE_URL + "/laboratory/dashboard",

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

        const dashboard = data.data;

        document.getElementById("total_chemicals").innerHTML =
            dashboard.total_chemicals;

        document.getElementById("available_chemicals").innerHTML =
            dashboard.available_chemicals;

        document.getElementById("out_of_stock").innerHTML =
            dashboard.out_of_stock;

        document.getElementById("total_stock").innerHTML =
            dashboard.total_stock;

        document.getElementById("reserved_stock").innerHTML =
            dashboard.reserved_stock;

        document.getElementById("pending_requests").innerHTML =
            dashboard.pending_requests;

        document.getElementById("approved_requests").innerHTML =
            dashboard.approved_requests;

        document.getElementById("reserved_requests").innerHTML =
            dashboard.reserved_requests;

        document.getElementById("completed_purchases").innerHTML =
            dashboard.completed_purchases;

        document.getElementById("expired_reservations").innerHTML =
            dashboard.expired_reservations;

    }

    catch (error) {

        showMessage(

            "Unable to connect to server.",

            "danger"

        );

    }

}

// Profile Function

async function loadProfile() {

    const token = getToken();

    try {

        const response = await fetch(

            API_BASE_URL + "/laboratory/profile",

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

        document.getElementById("license_id").value =
            data.data.license_id;

        document.getElementById("lab_name").value =
            data.data.lab_name;

        document.getElementById("email").value =
            data.data.email;

        document.getElementById("phone").value =
            data.data.phone;

        document.getElementById("address").value =
            data.data.address;

        document.getElementById("city").value =
            data.data.city;

        document.getElementById("state").value =
            data.data.state;

        document.getElementById("pincode").value =
            data.data.pincode;

        document.getElementById("status").value =
            data.data.status;

    }

    catch (error) {

        console.error(error);

        showMessage(

            "Unable to connect to server.",

            "danger"

        );

    }

}

async function saveChemical(event) {

    event.preventDefault();

    const chemicalId =
        document.getElementById("chemical_id").value;

    if (chemicalId) {

        updateChemical(chemicalId);

    }

    else {

        addChemical(event);

    }

}
async function addChemical(event) {

    event.preventDefault();

    const chemical_code =
        document.getElementById("chemical_code").value.trim();

    const chemical_name =
        document.getElementById("chemical_name").value.trim();

    const formula =
        document.getElementById("formula").value.trim();

    const category =
        document.getElementById("category").value.trim();

    const unit =
        document.getElementById("unit").value;

    const price_per_unit =
        document.getElementById("price_per_unit").value;

    const total_stock =
        document.getElementById("total_stock").value;

    const token = getToken();

    try {

        const response = await fetch(

            API_BASE_URL + "/laboratory/chemicals",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    Authorization:
                        "Bearer " + token

                },

                body: JSON.stringify({

                    chemical_code,
                    chemical_name,
                    formula,
                    category,
                    unit,
                    price_per_unit,
                    total_stock

                })

            }

        );

        const data = await response.json();

        if (!data.success) {

            showMessage(data.message,"danger");

            return;

        }

        showMessage(data.message,"success");

        document
            .getElementById("chemicalForm")
            .reset();

        loadChemicals();

    }

    catch(error){

        showMessage(

            "Unable to connect to server.",

            "danger"

        );

    }

}
async function loadChemicals() {

    const token = getToken();

    try {

        const response = await fetch(

            API_BASE_URL + "/laboratory/chemicals",

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

        displayChemicals(data.data);

    }

    catch (error) {

        console.log(error);

        showMessage(

            "Unable to load chemicals.",

            "danger"

        );

    }

}

async function loadPurchaseRequests() {

    const token = getToken();

    try {

        const response = await fetch(

            API_BASE_URL +

            "/laboratory/purchase-requests",

            {

                headers: {

                    Authorization:

                        "Bearer " + token

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

        displayPurchaseRequests(

            data.data

        );

    }

    catch (error) {

        console.log(error);

        showMessage(

            "Unable to load purchase requests.",

            "danger"

        );

    }

}

function displayPurchaseRequests(requests) {

    const tbody =
        document.getElementById(
            "purchaseRequestTable"
        );

    tbody.innerHTML = "";

    requests.forEach(function (request) {

        let action = "-";

        if (request.request_status === "Submitted") {

            action = `
                <button
                    class="btn btn-success btn-sm"
                    onclick="approveRequest(${request.request_id})">

                    Approve

                </button>
            `;

        }

        else if (request.request_status === "Approved") {

            action = `
                <button
                    class="btn btn-warning btn-sm"
                    onclick="reserveRequest(${request.request_id})">

                    Reserve

                </button>
            `;

        }

        else if (request.request_status === "Reserved") {

            action = `
                <span class="badge bg-primary">

                    Reserved

                </span>
            `;

        }

        else if (request.request_status === "Completed") {

            action = `
                <span class="badge bg-success">

                    Completed

                </span>
            `;

        }

        else if (request.request_status === "Expired") {

            action = `
                <span class="badge bg-danger">

                    Expired

                </span>
            `;

        }

        tbody.innerHTML += `

        <tr>

            <td>

                <strong>${request.full_name}</strong><br>

                ${request.email}<br>

                ${request.phone}

            </td>

            <td>

                ${request.chemical_name}<br>

                <small>${request.formula}</small>

            </td>

            <td>

                ${request.quantity}
                ${request.unit}

            </td>

            <td>

                ${request.authorization_code}

            </td>

            <td>

                ${request.purpose}

            </td>

            <td>

               ${
                  request.expiry_date
                    ? new Date(request.expiry_date).toLocaleDateString()
                    : "-"
                }

            </td>

            <td>

                ${request.purchase_mode}

            </td>

            <td>

                ${request.request_status}

            </td>

            <td>

    ${
        request.purchase_code
            ? `<span class="badge bg-success">${request.purchase_code}</span>`
            : "-"
    }

        </td>

            <td>

                ${new Date(
                    request.request_date
                ).toLocaleDateString()}

            </td>

            <td>

                ${action}

            </td>

        </tr>

        `;

    });

}
function downloadPurchaseReport() {

    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.json_to_sheet(

        purchaseReport

    );

    XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Purchase Report"

    );

    XLSX.writeFile(

        workbook,

        "Purchase_Report.xlsx"

    );

}
async function approveRequest(id) {

    if (!confirm("Approve this purchase request?")) {

        return;

    }

    try {

        const response = await fetch(

            API_BASE_URL +

            "/laboratory/purchase-requests/" +

            id +

            "/approve",

            {

                method: "PUT",

                headers: {

                    Authorization: "Bearer " + getToken()

                }

            }

        );

        const data = await response.json();

        showMessage(data.message, data.success);

        if (data.success) {

            loadPurchaseRequests();

        }

    }

    catch (error) {

        showMessage("Unable to approve request.");

    }

}
async function reserveRequest(id) {

    if (!confirm("Reserve stock for this purchase request?")) {

        return;

    }

    try {

        const response = await fetch(

            API_BASE_URL +
            "/laboratory/purchase-requests/" +
            id +
            "/reserve",

            {

                method: "PUT",

                headers: {

                    Authorization:
                        "Bearer " + getToken()

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

        showMessage(

            data.message,

            "success"

        );

        loadPurchaseRequests();

    }

    catch (error) {

        showMessage(

            "Unable to reserve stock.",

            "danger"

        );

    }

}
async function updateReservations() {

    if (!confirm("Check and expire old reservations?")) {

        return;

    }

    try {

        const response = await fetch(

            API_BASE_URL +
            "/laboratory/expire-reservations",

            {

                method: "PUT",

                headers: {

                    Authorization:
                        "Bearer " + getToken()

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

    loadPurchaseRequests();

    if (document.getElementById("total_chemicals")) {

        loadDashboard();

    }
}

    }

    catch (error) {

        console.log(error);

        showMessage(

            "Unable to update reservations.",

            "danger"

        );

    }

}
async function completePurchase(event) {

    event.preventDefault();

    try {

        const response = await fetch(

            API_BASE_URL +
            "/laboratory/complete-purchase",

            {

                method: "PUT",

                headers: {

                    Authorization:
                        "Bearer " + getToken(),

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    purchase_code:

                    document
                        .getElementById("purchase_code")
                        .value

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

            document
                .getElementById("completePurchaseForm")
                .reset();

            loadPurchaseRequests();

    

        }

    }

    catch (error) {

        console.log(error);

        showMessage(

            "Unable to complete purchase.",

            "danger"

        );

    }

}
async function loadPurchaseReport() {

    try {

        const response = await fetch(

            API_BASE_URL +
            "/laboratory/reports/purchases",

            {

                headers: {

                    Authorization:
                    "Bearer " + getToken()

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

        purchaseReport = data.data;

        displayPurchaseReport();

    }

    catch (error) {

        console.log(error);

    }

}
function displayPurchaseReport() {

    const tbody = document.getElementById(

        "reportTable"

    );

    tbody.innerHTML = "";

    purchaseReport.forEach(function (item) {

        tbody.innerHTML += `

        <tr>

        <td>${item.request_id}</td>

        <td>${item.user_name}</td>

        <td>${item.chemical_name}</td>

        <td>

        ${item.quantity}

        ${item.unit}

        </td>

        <td>${item.purchase_mode}</td>

        <td>${item.purchase_code ?? "-"}</td>

        <td>${item.request_status}</td>

        <td>${item.reservation_status}</td>

        <td>

        ${new Date(

            item.request_date

        ).toLocaleDateString()}

        </td>

        <td>

        ${

            item.completed_at

            ?

            new Date(

                item.completed_at

            ).toLocaleDateString()

            :

            "-"

        }

        </td>

        </tr>

        `;

    });

}
async function filterPurchaseReport() {

    const status =

        document
            .getElementById("filterStatus")
            .value;

    const mode =

        document
            .getElementById("filterMode")
            .value;

    const from =

        document
            .getElementById("fromDate")
            .value;

    const to =

        document
            .getElementById("toDate")
            .value;

    try {

        const response = await fetch(

            API_BASE_URL +

            "/laboratory/reports/purchases/filter?" +

            new URLSearchParams({

                status,

                mode,

                from,

                to

            }),

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

        purchaseReport = data.data;

        displayPurchaseReport();

    }

    catch (error) {

        console.log(error);

    }

}
function clearPurchaseFilters() {

    document
        .getElementById("filterStatus")
        .value = "";

    document
        .getElementById("filterMode")
        .value = "";

    document
        .getElementById("fromDate")
        .value = "";

    document
        .getElementById("toDate")
        .value = "";

    loadPurchaseReport();

}
function displayChemicals(chemicals) {

    const tbody =
        document.getElementById("chemicalTableBody");

    tbody.innerHTML = "";

    chemicals.forEach(function (chemical) {

        tbody.innerHTML += `

            <tr>

                <td>${chemical.chemical_name}</td>

                <td>${chemical.category}</td>

                <td>${chemical.total_stock}</td>

                <td>${chemical.reserved_stock}</td>

                <td>${chemical.available_stock}</td>

                <td>${chemical.status}</td>

                <td>

                    <button
                        class="btn btn-warning btn-sm"
                        onclick="editChemical(${chemical.chemical_id})">

                        Edit

                    </button>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="deleteChemical(${chemical.chemical_id})">

                        Delete

                    </button>

                    <button
                        class="btn btn-info btn-sm"
                        onclick="updateStock(${chemical.chemical_id})">

                        Stock

                    </button>

                </td>

            </tr>

        `;

    });

}
async function searchChemicals() {

    const keyword =

        document

            .getElementById("searchKeyword")

            .value

            .trim();

    if (!keyword) {

        showMessage(

            "Enter a search keyword.",

            "danger"

        );

        return;

    }

    const token = getToken();

    try {

        const response = await fetch(

            API_BASE_URL +

            "/laboratory/chemicals/search?keyword=" +

            encodeURIComponent(keyword),

            {

                headers: {

                    Authorization:

                        "Bearer " + token

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

        displayChemicals(data.data);

    }

    catch (error) {

        console.log(error);

        showMessage(

            "Unable to search chemicals.",

            "danger"

        );

    }

}

async function filterChemicals() {

    const category =

        document
            .getElementById("filterCategory")
            .value;

    const status =

        document
            .getElementById("filterStatus")
            .value;

    const token = getToken();

    try {

        const response = await fetch(

            API_BASE_URL +

            "/laboratory/chemicals/filter?" +

            "category=" +

            encodeURIComponent(category) +

            "&status=" +

            encodeURIComponent(status),

            {

                headers: {

                    Authorization:

                        "Bearer " + token

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

        displayChemicals(

            data.data

        );

    }

    catch (error) {

        console.log(error);

        showMessage(

            "Unable to filter chemicals.",

            "danger"

        );

    }

}

function clearFilters() {

    document
        .getElementById("filterCategory")
        .value = "";

    document
        .getElementById("filterStatus")
        .value = "";

    loadChemicals();

}
async function editChemical(id) {

    const token = getToken();

    try {

        const response = await fetch(

            API_BASE_URL +
            "/laboratory/chemicals/" +
            id,

            {

                headers: {

                    Authorization:
                        "Bearer " + token

                }

            }

        );

        const data = await response.json();

        if (!data.success) {

            showMessage(data.message);

            return;

        }

        const chemical = data.data;

        document.getElementById("chemical_id").value =
            chemical.chemical_id;

        document.getElementById("chemical_code").value =
            chemical.chemical_code;

        document.getElementById("chemical_name").value =
            chemical.chemical_name;

        document.getElementById("formula").value =
            chemical.formula;

        document.getElementById("category").value =
            chemical.category;

        document.getElementById("unit").value =
            chemical.unit;

        document.getElementById("price_per_unit").value =
            chemical.price_per_unit;

        document.getElementById("total_stock").value =
            chemical.total_stock;

        document.getElementById("saveChemicalBtn")
            .innerHTML = "Update Chemical";

        document.getElementById("cancelEditBtn")
            .style.display = "inline-block";

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

    catch (error) {

        console.log(error);

    }

}

async function updateChemical(id) {

    const token = getToken();

    try {

        const response = await fetch(

            API_BASE_URL +
            "/laboratory/chemicals/" +
            id,

            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json",

                    Authorization:
                        "Bearer " + token

                },

                body: JSON.stringify({

                    chemical_name:
                        document.getElementById("chemical_name").value,

                    formula:
                        document.getElementById("formula").value,

                    category:
                        document.getElementById("category").value,

                    unit:
                        document.getElementById("unit").value,

                    price_per_unit:
                        document.getElementById("price_per_unit").value,

                    total_stock:
                        document.getElementById("total_stock").value,

                    status: "Available"

                })

            }

        );

        const data = await response.json();

        if (!data.success) {

            showMessage(data.message);

            return;

        }

        showMessage(

            data.message,

            "success"

        );

        document
            .getElementById("chemicalForm")
            .reset();

        document
            .getElementById("chemical_id")
            .value = "";

        document
            .getElementById("saveChemicalBtn")
            .innerHTML = "Add Chemical";

        document
            .getElementById("cancelEditBtn")
            .style.display = "none";

        loadChemicals();

    }

    catch (error) {

        console.log(error);

    }

}
async function deleteChemical(id) {

    const confirmDelete = confirm(

        "Are you sure you want to delete this chemical?"

    );

    if (!confirmDelete) {

        return;

    }

    const token = getToken();

    try {

        const response = await fetch(

            API_BASE_URL +
            "/laboratory/chemicals/" +
            id,

            {

                method: "DELETE",

                headers: {

                    Authorization:
                        "Bearer " + token

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

        showMessage(

            data.message,

            "success"

        );

        loadChemicals();

    }

    catch (error) {

        console.log(error);

        showMessage(

            "Unable to delete chemical.",

            "danger"

        );

    }

}
async function updateStock(id) {

    const newStock = prompt(

        "Enter the new total stock quantity:"

    );

    if (

        newStock === null ||

        newStock.trim() === ""

    ) {

        return;

    }

    if (

        isNaN(newStock) ||

        Number(newStock) < 0

    ) {

        showMessage(

            "Please enter a valid stock quantity.",

            "danger"

        );

        return;

    }

    const token = getToken();

    try {

        const response = await fetch(

            API_BASE_URL +

            "/laboratory/chemicals/" +

            id +

            "/stock",

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    Authorization:

                        "Bearer " + token

                },

                body: JSON.stringify({

                    total_stock:

                        Number(newStock)

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

        loadChemicals();

    }

    catch (error) {

        console.log(error);

        showMessage(

            "Unable to update stock.",

            "danger"

        );

    }

}
// Load Dashboard Only on Dashboard Page

if (window.location.pathname.includes("dashboard.html")) {

    loadDashboard();

}

// Load Profile Only on Profile Page

if (document.getElementById("license_id")) {

    loadProfile();

}

const chemicalForm = document.getElementById("chemicalForm");

if (chemicalForm) {

    chemicalForm.addEventListener(

        "submit",

        saveChemical

    );

}
const cancelEditBtn = document.getElementById("cancelEditBtn");

if (cancelEditBtn) {

    cancelEditBtn.addEventListener(

        "click",

        function () {

            document
                .getElementById("chemicalForm")
                .reset();

            document
                .getElementById("chemical_id")
                .value = "";

            document
                .getElementById("saveChemicalBtn")
                .innerHTML = "Add Chemical";

            this.style.display = "none";

        }

    );

}

const searchBox = document.getElementById("searchKeyword");

if (searchBox) {

    searchBox.addEventListener(

        "keypress",

        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                searchChemicals();

            }

        }

    );

}

const filterCategory =

    document.getElementById("filterCategory");

if (filterCategory) {

    filterCategory.addEventListener(

        "change",

        filterChemicals

    );

}

const filterStatus =

    document.getElementById("filterStatus");

if (filterStatus) {

    filterStatus.addEventListener(

        "change",

        filterChemicals

    );

}
const completePurchaseForm =
    document.getElementById(
        "completePurchaseForm"
    );

if (completePurchaseForm) {

    completePurchaseForm.addEventListener(

        "submit",

        completePurchase

    );

}
const updateReservationsBtn =
    document.getElementById("updateReservationsBtn");

if (updateReservationsBtn) {

    updateReservationsBtn.addEventListener(

        "click",

        updateReservations

    );

}
const downloadBtn = document.getElementById(

    "downloadExcelBtn"

);

if (downloadBtn) {

    downloadBtn.addEventListener(

        "click",

        downloadPurchaseReport

    );

}


if (window.location.pathname.includes("chemicals.html")) {

    loadChemicals();

}
if (window.location.pathname.includes("purchase-requests.html")) {

    loadPurchaseRequests();

}
if (

    window.location.pathname.includes("reports.html")

) {

    loadPurchaseReport();

}