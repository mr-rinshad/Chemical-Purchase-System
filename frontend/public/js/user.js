protectPage("user");

const user = getLoggedUser();
let selectedPurchase = null;
let activePurchaseRequests = [];

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
let authorizationMonthlyQuota = null;

if (authorizationForm) {

    authorizationForm.addEventListener(
        "submit",
        submitAuthorization
    );

    loadAuthorizationRequests();
    checkAuthorizationMonthlyLimit();

}

async function checkAuthorizationMonthlyLimit() {

    const token = getToken();

    try {

        const response = await fetch(
            API_BASE_URL + "/auth/monthly-limit",
            {
                headers: {
                    Authorization: "Bearer " + token
                }
            }
        );

        const data = await response.json();

        if (data.success && data.data) {

            authorizationMonthlyQuota = data.data;

            const limitAlert = document.getElementById("authorizationLimitAlert");

            if (authorizationMonthlyQuota.isLimitReached) {

                if (limitAlert) {

                    limitAlert.innerHTML = `
                        <div class="alert alert-danger d-flex align-items-center gap-2 mb-3">
                            <i class="fa-solid fa-ban fs-5 flex-shrink-0"></i>
                            <div>
                                <strong>Monthly Limit Reached:</strong> You have reached your monthly chemical purchase limit (${authorizationMonthlyQuota.used}/${authorizationMonthlyQuota.limit} units used). You cannot request new authorization permits this month.
                            </div>
                        </div>
                    `;

                }

                const purposeInput = document.getElementById("purpose");
                const proofInput = document.getElementById("proof_document");
                const submitBtn = authorizationForm.querySelector("button[type='submit']");

                if (purposeInput) purposeInput.disabled = true;
                if (proofInput) proofInput.disabled = true;

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fa-solid fa-lock me-1"></i> Request Restricted (Monthly Limit Reached)';
                    submitBtn.classList.remove("btn-amber");
                    submitBtn.classList.add("btn-secondary");
                }

            }

        }

    }

    catch (error) {

        console.error("Error checking authorization monthly limit:", error);

    }

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

    if (authorizationMonthlyQuota && authorizationMonthlyQuota.isLimitReached) {

        showMessage(
            `Monthly chemical purchase limit reached (${authorizationMonthlyQuota.used}/${authorizationMonthlyQuota.limit} units used). You cannot request new authorization permits this month.`,
            "danger"
        );

        return;

    }

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
let purchaseMonthlyQuota = null;

if (purchaseForm) {

    purchaseForm.addEventListener(
        "submit",
        submitPurchaseRequest
    );

    checkPurchaseMonthlyLimit();

}

async function checkPurchaseMonthlyLimit() {

    const token = getToken();

    try {

        const response = await fetch(
            API_BASE_URL + "/auth/monthly-limit",
            {
                headers: {
                    Authorization: "Bearer " + token
                }
            }
        );

        const data = await response.json();

        if (data.success && data.data) {

            purchaseMonthlyQuota = data.data;

            const quotaSummary = document.getElementById("monthlyQuotaSummary");
            const remainingBadge = document.getElementById("monthlyRemainingBadge");
            const quantityInput = document.getElementById("quantity");
            const quantityLimitHelper = document.getElementById("quantityLimitHelper");
            const submitBtn = purchaseForm ? purchaseForm.querySelector("button[type='submit']") : null;

            if (quotaSummary) {
                quotaSummary.innerHTML = `<strong>${purchaseMonthlyQuota.used}</strong> of <strong>${purchaseMonthlyQuota.limit} units</strong> used this month.`;
            }

            if (remainingBadge) {
                if (purchaseMonthlyQuota.isLimitReached) {
                    remainingBadge.className = "badge bg-danger fs-6";
                    remainingBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation me-1"></i> Limit Reached (0 units left)`;
                } else {
                    remainingBadge.className = "badge bg-success fs-6";
                    remainingBadge.innerHTML = `<i class="fa-solid fa-check me-1"></i> ${purchaseMonthlyQuota.remaining} unit(s) remaining`;
                }
            }

            if (quantityLimitHelper) {
                if (purchaseMonthlyQuota.isLimitReached) {
                    quantityLimitHelper.className = "text-danger d-block mt-1 fw-bold";
                    quantityLimitHelper.innerText = "Monthly limit reached (15/15 units). You cannot order chemicals this month.";
                } else {
                    quantityLimitHelper.className = "text-muted d-block mt-1";
                    quantityLimitHelper.innerText = `Monthly Limit: 15 units. You can order up to ${purchaseMonthlyQuota.remaining} unit(s) more this month.`;
                }
            }

            if (quantityInput) {
                if (purchaseMonthlyQuota.isLimitReached) {
                    quantityInput.disabled = true;
                    quantityInput.placeholder = "Monthly limit reached";
                } else {
                    quantityInput.disabled = false;
                    quantityInput.max = purchaseMonthlyQuota.remaining;
                }
            }

            if (submitBtn) {
                if (purchaseMonthlyQuota.isLimitReached) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fa-solid fa-lock me-2"></i> Monthly Purchase Limit Reached (15/15 units)';
                    submitBtn.classList.remove("btn-amber");
                    submitBtn.classList.add("btn-secondary");
                } else {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i> Submit Purchase Order Request';
                    submitBtn.classList.remove("btn-secondary");
                    submitBtn.classList.add("btn-amber");
                }
            }

        }

    }

    catch (error) {

        console.error("Error checking purchase monthly limit:", error);

    }

}

async function submitPurchaseRequest(event) {

    event.preventDefault();

    if (purchaseMonthlyQuota) {

        if (purchaseMonthlyQuota.isLimitReached) {

            showMessage(
                `Monthly chemical purchase limit of ${purchaseMonthlyQuota.limit} units has already been reached for this month. You cannot submit further purchase requests.`,
                "danger"
            );

            return;

        }

        const requestedQty = Number(document.getElementById("quantity").value);

        if (purchaseMonthlyQuota.used + requestedQty > purchaseMonthlyQuota.limit) {

            showMessage(
                `Monthly purchase limit exceeded. You have already requested/purchased ${purchaseMonthlyQuota.used} of your ${purchaseMonthlyQuota.limit} monthly unit limit. Remaining allowance: ${purchaseMonthlyQuota.remaining} unit(s).`,
                "danger"
            );

            return;

        }

    }

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

        await checkPurchaseMonthlyLimit();

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

    await autoCompleteOrders();

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

        activePurchaseRequests = data.data.filter(function (request) {

            return [

                "Submitted",

                "Approved",

                "Reserved",

                "Paid",

                "Ready for Delivery",

                "Delivered"

            ].includes(request.request_status);

        });

        console.table(activePurchaseRequests);

        if (activePurchaseRequests.length === 0) {

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

        activePurchaseRequests.forEach(function (request) {

            purchaseRequestTable.innerHTML += `

                <tr>

                    <td>${request.request_id}</td>

                    <td>${request.lab_name}</td>

                    <td>${request.chemical_name}</td>

                    <td>${request.quantity}</td>

                    <td>

                        ${request.purchase_mode}

                        <br>

                        ${
                            request.purchase_mode === "Offline"

                            ?

                            `<button
                                class="btn btn-sm btn-primary mt-1"
                                onclick="viewOfflinePurchase(${request.request_id})">

                                View

                            </button>`

                            :

                            request.request_status === "Reserved"

                            ?

                            `<button
                                class="btn btn-sm btn-success mt-1"
                                onclick="showPaymentModal(${request.request_id})">

                                Payment

                            </button>`

                            :

                            request.request_status === "Paid"

                            ?

                            `<button
                                class="btn btn-sm btn-warning mt-1"
                                onclick="trackOrder(${request.request_id})">

                                Track Order

                            </button>`

                            :

                            ""
                        }

                    </td>

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

    await autoCompleteOrders();

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

        document.getElementById("address").value =
            data.data.address || "";

        if (data.data.monthly_quota) {

            const quota = data.data.monthly_quota;
            const quotaLimit = document.getElementById("quotaLimit");
            const quotaUsed = document.getElementById("quotaUsed");
            const quotaRemaining = document.getElementById("quotaRemaining");
            const quotaPercentText = document.getElementById("quotaPercentText");
            const quotaProgressBar = document.getElementById("quotaProgressBar");
            const quotaAlertContainer = document.getElementById("quotaAlertContainer");
            const quotaStatusText = document.getElementById("quotaStatusText");
            const currentMonthBadge = document.getElementById("currentMonthBadge");

            if (currentMonthBadge) {
                const monthName = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
                currentMonthBadge.innerHTML = `<i class="fa-solid fa-calendar-days me-1"></i> ${monthName}`;
            }

            if (quotaLimit) quotaLimit.innerText = quota.limit;
            if (quotaUsed) quotaUsed.innerText = quota.used;
            if (quotaRemaining) quotaRemaining.innerText = quota.remaining;

            const percent = Math.min(100, Math.round((quota.used / quota.limit) * 100));

            if (quotaPercentText) {
                quotaPercentText.innerText = `${percent}% Used (${quota.used}/${quota.limit} units)`;
            }

            if (quotaProgressBar) {
                quotaProgressBar.style.width = percent + "%";
                quotaProgressBar.setAttribute("aria-valuenow", percent);
                quotaProgressBar.className = "progress-bar";
                if (quota.isLimitReached) {
                    quotaProgressBar.classList.add("bg-danger");
                } else if (percent > 65) {
                    quotaProgressBar.classList.add("bg-warning");
                } else {
                    quotaProgressBar.classList.add("bg-success");
                }
            }

            if (quotaStatusText) {
                if (quota.isLimitReached) {
                    quotaStatusText.innerHTML = '<span class="text-danger fw-semibold">Limit reached</span>';
                } else {
                    quotaStatusText.innerHTML = 'Available to purchase';
                }
            }

            if (quotaAlertContainer) {
                if (quota.isLimitReached) {
                    quotaAlertContainer.innerHTML = `
                        <div class="alert alert-danger d-flex align-items-center gap-2 mb-0">
                            <i class="fa-solid fa-triangle-exclamation fs-5 flex-shrink-0"></i>
                            <div>
                                <strong>Monthly Limit Reached:</strong> You have consumed all <strong>${quota.limit} units</strong> of your monthly chemical allowance. You cannot request new authorization permits or submit purchase orders until next month.
                            </div>
                        </div>
                    `;
                } else {
                    quotaAlertContainer.innerHTML = `
                        <div class="alert alert-info d-flex align-items-center gap-2 mb-0">
                            <i class="fa-solid fa-circle-info fs-5 flex-shrink-0"></i>
                            <div>
                                You have <strong>${quota.remaining} unit(s)</strong> remaining in your monthly purchasing allowance out of <strong>${quota.limit} units</strong>.
                            </div>
                        </div>
                    `;
                }
            }

        }

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

    const address = document
        .getElementById("address")
        .value
        .trim();

    try {

        const response = await fetch(

            API_BASE_URL + "/auth/profile",

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: "Bearer " + token

                },

                body: JSON.stringify({

                    full_name,
                    email,
                    phone,
                    address

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

        const loggedUser = getLoggedUser();

        console.log(loggedUser);

        if (loggedUser && loggedUser.user) {

            loggedUser.user.full_name = full_name;
            loggedUser.user.email = email;
            loggedUser.user.phone = phone;
            loggedUser.user.address = address;

         setStorage(

    "user",

    JSON.stringify(loggedUser)

);

        }

        await loadProfile();

    }

    catch (error) {

        console.error(error);

        showMessage(

            error.message,

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

function viewOfflinePurchase(requestId) {

    selectedPurchase = activePurchaseRequests.find(function (item) {

        return item.request_id == requestId;

    });

    if (!selectedPurchase) {

        return;

    }

    document.getElementById("offlineLab").innerHTML =
        selectedPurchase.lab_name;

    document.getElementById("offlineChemical").innerHTML =
        selectedPurchase.chemical_name;

    document.getElementById("offlineQuantity").innerHTML =
        selectedPurchase.quantity + " " + selectedPurchase.unit;

document.getElementById("offlineUnitPrice").innerHTML =
    "₹ " + Number(selectedPurchase.price_per_unit).toFixed(2);

document.getElementById("offlineTotalPrice").innerHTML =
    "₹ " + Number(selectedPurchase.total_price).toFixed(2);

    document.getElementById("offlinePurchaseCode").innerHTML =
        selectedPurchase.purchase_code || "-";

    document.getElementById("offlineStatus").innerHTML =
        selectedPurchase.request_status;

    new bootstrap.Modal(

        document.getElementById("offlinePurchaseModal")

    ).show();

}

function showPaymentModal(requestId) {

    selectedPurchase = activePurchaseRequests.find(function (item) {

        return item.request_id == requestId;

    });

    if (!selectedPurchase) {

        return;

    }

    document.getElementById("paymentName").innerHTML =
        selectedPurchase.full_name || "-";

    document.getElementById("paymentAddress").innerHTML =
        selectedPurchase.address || "-";

    document.getElementById("paymentChemical").innerHTML =
        selectedPurchase.chemical_name;

    document.getElementById("paymentQuantity").innerHTML =
        selectedPurchase.quantity + " " + selectedPurchase.unit;

    document.getElementById("paymentUnitPrice").innerHTML =
        "₹ " + Number(selectedPurchase.price_per_unit).toFixed(2);

    document.getElementById("paymentTotal").innerHTML =
        "₹ " + Number(selectedPurchase.total_price).toFixed(2);

    // Reset payment form
    document.getElementById("upiId").value = "";

    document.getElementById("upiError").style.display =
        "none";

    document.getElementById("payNowBtn").style.display =
        "block";

    document.getElementById("paymentLoading").style.display =
        "none";

    document.getElementById("paymentSuccess").style.display =
        "none";

    new bootstrap.Modal(

        document.getElementById("paymentModal")

    ).show();

}

async function startPayment() {

    const upiId =
        document.getElementById("upiId").value.trim();

    if (upiId === "") {

        document.getElementById("upiError").style.display =
            "block";

        return;

    }

    document.getElementById("upiError").style.display =
        "none";

    document.getElementById("payNowBtn").style.display =
        "none";

    document.getElementById("paymentLoading").style.display =
        "block";

    // Dummy payment delay
    setTimeout(async function () {

        try {

            const response = await fetch(

                API_BASE_URL + "/auth/pay-purchase",

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
                            selectedPurchase.purchase_code

                    })

                }

            );

            const data = await response.json();

            document.getElementById("paymentLoading").style.display =
                "none";

if (data.success) {

    document.getElementById("paymentSuccess").style.display =
        "block";

    showMessage(

        "Payment Successful",

        "success"

    );

    // Close modal after showing success tick
    setTimeout(function () {

        bootstrap.Modal.getInstance(

            document.getElementById("paymentModal")

        ).hide();

    }, 1500);

    loadPurchaseRequests();

    loadPurchaseHistory();

}

            else {

                document.getElementById("payNowBtn").style.display =
                    "block";

                showMessage(

                    data.message,

                    "danger"

                );

            }

        }

        catch (error) {

            console.log(error);

            document.getElementById("paymentLoading").style.display =
                "none";

            document.getElementById("payNowBtn").style.display =
                "block";

            showMessage(

                "Payment failed.",

                "danger"

            );

        }

    }, 3000);

}

function trackOrder(requestId) {

    selectedPurchase = activePurchaseRequests.find(function (item) {

        return item.request_id == requestId;

    });

    if (!selectedPurchase) {

        return;

    }

    // Show Purchase Code
    document.getElementById("trackPurchaseCode").innerHTML = selectedPurchase.purchase_code;

    const paymentDate = new Date(selectedPurchase.payment_date);
    const today = new Date();
    const diffTime = today.getTime() - paymentDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const stepPaid = document.getElementById("stepPaid");
    const stepDelivery = document.getElementById("stepDelivery");
    const stepDelivered = document.getElementById("stepDelivered");

    // Reset Stage Classes
    if (stepPaid) stepPaid.className = "stepper-item completed";
    if (stepDelivery) stepDelivery.className = "stepper-item active";
    if (stepDelivered) stepDelivered.className = "stepper-item";

    document.getElementById("paidProgress").style.width = "100%";
    document.getElementById("deliveryProgress").style.width = "0%";
    document.getElementById("deliveredProgress").style.width = "0%";

    document.getElementById("paidText").innerHTML = "✔ Payment Confirmed";
    document.getElementById("deliveryText").innerHTML = "⭕ Out For Delivery";
    document.getElementById("deliveredText").innerHTML = "⭕ Delivered";

    // Stage 2: Out For Delivery
    if (diffDays >= 1) {
        if (stepDelivery) stepDelivery.className = "stepper-item completed";
        if (stepDelivered) stepDelivered.className = "stepper-item active";
        document.getElementById("deliveryProgress").style.width = "100%";
        document.getElementById("deliveryText").innerHTML = "✔ Out For Delivery";
    }

    // Stage 3: Delivered
    if (diffDays >= 2) {
        if (stepDelivered) stepDelivered.className = "stepper-item completed";
        document.getElementById("deliveredProgress").style.width = "100%";
        document.getElementById("deliveredText").innerHTML = "✔ Successfully Delivered";
    }

    new bootstrap.Modal(document.getElementById("trackOrderModal")).show();

}
async function completeOrderAutomatically(requestId){

    try{

        const response = await fetch(

            API_BASE_URL +

            "/auth/complete-online-order",

            {

                method:"PUT",

                headers:{

                    Authorization:

                    "Bearer "+getToken(),

                    "Content-Type":

                    "application/json"

                },

                body:JSON.stringify({

                    request_id:requestId

                })

            }

        );

        const data=await response.json();

        if(data.success){

            loadPurchaseRequests();

            loadPurchaseHistory();

        }

    }

    catch(error){

        console.log(error);

    }

}

async function autoCompleteOrders(){

    try{

        await fetch(

            API_BASE_URL +

            "/auth/auto-complete-orders",

            {

                method:"PUT",

                headers:{

                    Authorization:

                    "Bearer "+getToken()

                }

            }

        );

    }

    catch(error){

        console.log(error);

    }

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