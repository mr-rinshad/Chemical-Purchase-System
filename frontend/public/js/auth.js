document
    .getElementById("loginForm")
    .addEventListener("submit", login);

async function login(event) {

    event.preventDefault();

    const email = document
        .getElementById("email")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    try {

        const response = await fetch(

            API_BASE_URL +

            "/auth/universal-login",

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

        // Save JWT Token

        setStorage(

            "token",

            data.data.token

        );

        // Get role returned from backend

        const role = data.data.role;

        // Save role

        setStorage(

            "role",

            role

        );

        // Save login data using existing keys

        if (role === "admin") {

            setStorage(

                "admin",

                JSON.stringify(data.data)

            );

        }

        else if (role === "laboratory") {

            setStorage(

                "laboratory",

                JSON.stringify(data.data)

            );

        }

        else {

            setStorage(

                "user",

                JSON.stringify(data.data)

            );

        }

        // Redirect automatically

        switch (role) {

            case "admin":

                window.location.href =

                    "admin/main-dashboard.html";

                break;

            case "laboratory":

                window.location.href =

                    "laboratory/main-dashboard.html";

                break;

            case "user":

                window.location.href =

                    "user/dashboard.html";

                break;

            default:

                showMessage(

                    "Unknown account type."

                );

        }

    }

    catch (error) {

        console.error(error);

        showMessage(

            "Unable to connect to server."

        );

    }

}