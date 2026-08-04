const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(

        "submit",

        register

    );

}

async function register(event) {

    event.preventDefault();

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
        // Phone Number Validation

const phonePattern = /^[6-9]\d{9}$/;

if (!phonePattern.test(phone)) {

    showMessage(

        "Phone number must contain exactly 10 digits and start with 6, 7, 8 or 9.",

        "danger"

    );

    return;

}

    const address = document
        .getElementById("address")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    const confirm_password = document
        .getElementById("confirm_password")
        .value;

    if (password !== confirm_password) {

        showMessage(

            "Passwords do not match.",

            "danger"

        );

        return;

    }

    try {

        const response = await fetch(

            API_BASE_URL +

            "/auth/register",

            {

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

            "Registration successful. Redirecting to login...",

            "success"

        );

        document
            .getElementById("registerForm")
            .reset();

        setTimeout(function () {

            window.location.href =

                "login.html";

        }, 2000);

    }

    catch (error) {

        console.error(error);

        showMessage(

            "Unable to connect to server.",

            "danger"

        );

    }

}
function showUserForm() {

    document.getElementById(
        "userRegistration"
    ).style.display = "block";

    document.getElementById(
        "laboratoryRegistration"
    ).style.display = "none";

}

function showLabForm() {

    document.getElementById(
        "userRegistration"
    ).style.display = "none";

    document.getElementById(
        "laboratoryRegistration"
    ).style.display = "block";

}
async function registerLaboratory(event) {

    event.preventDefault();

    const password =
        document.getElementById(
            "lab_password"
        ).value;

    const confirmPassword =
        document.getElementById(
            "lab_confirm_password"
        ).value;

    if (password !== confirmPassword) {

        alert("Passwords do not match.");

        return;

    }

    const phonePattern = /^[6-9]\d{9}$/;

    if (!phonePattern.test(

        document.getElementById("lab_phone").value

    )) {

        alert(

            "Phone number must contain exactly 10 digits and start with 6, 7, 8 or 9."

        );

        return;

    }

    try {

        const response = await fetch(

            API_BASE_URL + "/laboratory/register",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    license_id:
                        Number(document.getElementById("lab_license_id").value),

                    lab_name:
                        document.getElementById("lab_name").value,

                    owner_name:
                        document.getElementById("lab_owner_name").value.trim(),

                    email:
                        document.getElementById("lab_email").value,

                    password,

                    phone:
                        document.getElementById("lab_phone").value,

                    address:
                        document.getElementById("lab_address").value,

                    city:
                        document.getElementById("lab_city").value,

                    state:
                        document.getElementById("lab_state").value,

                    pincode:
                        document.getElementById("lab_pincode").value

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
            "labRegisterForm"
        ).reset();

    }

    catch (error) {

        console.log(error);

        alert("Unable to connect to server.");

    }

}

const labRegisterForm =

document.getElementById(

    "labRegisterForm"

);

if (labRegisterForm) {

    labRegisterForm.addEventListener(

        "submit",

        registerLaboratory

    );

}