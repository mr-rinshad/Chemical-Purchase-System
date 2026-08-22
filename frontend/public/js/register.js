const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", register);
}

async function register(event) {
    event.preventDefault();

    const full_name = document.getElementById("full_name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const password = document.getElementById("password").value;
    const confirm_password = document.getElementById("confirm_password").value;

    if (!full_name || full_name.length < 3) {
        showMessage("Please enter a valid full name (minimum 3 characters).", "danger");
        return;
    }

    if (!email || !email.includes("@") || !email.includes(".")) {
        showMessage("Please enter a valid email address.", "danger");
        return;
    }

    // Phone Number Validation (10 digits starting with 6-9)
    const phonePattern = /^[6-9]\d{9}$/;
    if (!phonePattern.test(phone)) {
        showMessage("Phone number must contain exactly 10 digits and start with 6, 7, 8 or 9.", "danger");
        return;
    }

    if (!address || address.length < 5) {
        showMessage("Please enter a valid delivery address (minimum 5 characters).", "danger");
        return;
    }

    if (password.length < 6) {
        showMessage("Password must be at least 6 characters long.", "danger");
        return;
    }

    if (password !== confirm_password) {
        showMessage("Passwords do not match.", "danger");
        return;
    }

    try {
        const response = await fetch(API_BASE_URL + "/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                full_name,
                email,
                phone,
                address,
                password
            })
        });

        const data = await response.json();

        if (!data.success) {
            showMessage(data.message, "danger");
            return;
        }

        showMessage("Registration successful! Redirecting to login...", "success");
        document.getElementById("registerForm").reset();

        setTimeout(function () {
            window.location.href = "login.html";
        }, 1500);

    } catch (error) {
        console.error(error);
        showMessage("Unable to connect to server.", "danger");
    }
}

function showUserForm() {
    const userReg = document.getElementById("userRegistration");
    const labReg = document.getElementById("laboratoryRegistration");
    const userTab = document.getElementById("userTab");
    const labTab = document.getElementById("labTab");

    if (userReg) userReg.style.display = "block";
    if (labReg) labReg.style.display = "none";
    if (userTab) userTab.classList.add("active");
    if (labTab) labTab.classList.remove("active");
}

function showLabForm() {
    const userReg = document.getElementById("userRegistration");
    const labReg = document.getElementById("laboratoryRegistration");
    const userTab = document.getElementById("userTab");
    const labTab = document.getElementById("labTab");

    if (userReg) userReg.style.display = "none";
    if (labReg) labReg.style.display = "block";
    if (userTab) userTab.classList.remove("active");
    if (labTab) labTab.classList.add("active");
}

async function registerLaboratory(event) {
    event.preventDefault();

    const license_id = Number(document.getElementById("lab_license_id").value);
    const lab_name = document.getElementById("lab_name").value.trim();
    const owner_name = document.getElementById("lab_owner_name").value.trim();
    const email = document.getElementById("lab_email").value.trim();
    const phone = document.getElementById("lab_phone").value.trim();
    const address = document.getElementById("lab_address").value.trim();
    const city = document.getElementById("lab_city").value.trim();
    const state = document.getElementById("lab_state").value.trim();
    const pincode = document.getElementById("lab_pincode").value.trim();
    const password = document.getElementById("lab_password").value;
    const confirmPassword = document.getElementById("lab_confirm_password").value;

    if (!license_id || license_id <= 0) {
        alert("Please enter a valid Government License ID.");
        return;
    }

    if (!lab_name || lab_name.length < 3) {
        alert("Please enter a valid Laboratory Name (minimum 3 characters).");
        return;
    }

    if (!owner_name || owner_name.length < 3) {
        alert("Please enter a valid Owner / Director Name.");
        return;
    }

    if (!email || !email.includes("@") || !email.includes(".")) {
        alert("Please enter a valid email address.");
        return;
    }

    const phonePattern = /^[6-9]\d{9}$/;
    if (!phonePattern.test(phone)) {
        alert("Phone number must contain exactly 10 digits and start with 6, 7, 8 or 9.");
        return;
    }

    if (!address || address.length < 5) {
        alert("Please enter a valid laboratory physical address.");
        return;
    }

    if (!city || !state) {
        alert("Please enter City and State.");
        return;
    }

    const pinPattern = /^\d{6}$/;
    if (!pinPattern.test(pincode)) {
        alert("Pincode must contain exactly 6 numeric digits.");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    try {
        const response = await fetch(API_BASE_URL + "/laboratory/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                license_id,
                lab_name,
                owner_name,
                email,
                password,
                phone,
                address,
                city,
                state,
                pincode
            })
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        alert(data.message || "Laboratory registered successfully!");
        document.getElementById("labRegisterForm").reset();

    } catch (error) {
        console.error(error);
        alert("Unable to connect to server.");
    }
}

const labRegisterForm = document.getElementById("labRegisterForm");
if (labRegisterForm) {
    labRegisterForm.addEventListener("submit", registerLaboratory);
}