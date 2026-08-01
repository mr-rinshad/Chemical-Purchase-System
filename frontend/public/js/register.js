document
    .getElementById("registerForm")
    .addEventListener("submit", register);

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