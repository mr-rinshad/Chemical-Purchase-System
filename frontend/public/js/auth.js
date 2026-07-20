document
    .getElementById("loginForm")
    .addEventListener("submit", login);

async function login(event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    const role = document.getElementById("role").value;

    let endpoint = "";

    switch (role) {

        case "user":

            endpoint = "/auth/login";

            break;

        case "laboratory":

            endpoint = "/laboratory/login";

            break;

        case "admin":

            endpoint = "/admin/login";

            break;

    }

    try {

        const response = await fetch(

            API_BASE_URL + endpoint,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    email,

                    password

                })

            }

        );

        const data = await response.json();

        if (!data.success) {

            showMessage(data.message);

            return;

        }

        localStorage.setItem(

            "token",

            data.data.token

        );

        localStorage.setItem(

            "user",

            JSON.stringify(data.data)

        );

        localStorage.setItem(

            "role",

            role

        );

        switch (role) {

            case "user":

                window.location.href = "user/dashboard.html";

                break;

            case "laboratory":

                window.location.href = "laboratory/main-dashboard.html";

                break;

            case "admin":

                window.location.href = "admin/dashboard.html";

                break;

        }

    }

    catch (error) {

        showMessage("Unable to connect to server.");

    }

}