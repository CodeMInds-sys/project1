
        async function sendReset() {
            const email = document.getElementById("email").value;
            const msg = document.getElementById("msg");
            const err = document.getElementById("error");

            msg.classList.add("d-none");
            err.classList.add("d-none");

            if (!email) {
                err.textContent = "Please enter your email address";
                err.classList.remove("d-none");
                return;
            }

            try {
                // ❗ Change this link according to your server.❗
                const response = await fetch("https://your-server.com/api/request-reset", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });

                if (response.ok) {
                    msg.textContent = "A reset link has been sent to your email.";
                    msg.classList.remove("d-none");
                    document.getElementById("email").value = "";
                } else {
                    err.textContent = "Email not registered or an error occurred.";
                    err.classList.remove("d-none");
                }

            } catch (e) {
                err.textContent = "Unable to connect to the server at this time.";
                err.classList.remove("d-none");
            }
        }
    