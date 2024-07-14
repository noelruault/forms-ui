import { handleErrorResponse } from "./errors.js"
import { SERVER_URL } from "./environment.js"

const AUTH_ENDPOINT = "users"

document.getElementById("registerForm").addEventListener("submit", async (event) => {
	event.preventDefault()

	const email = document.getElementById("email").value
	const password = document.getElementById("password").value
	const name = document.getElementById("name").value

	const body = new URLSearchParams({ name, email, password })

	const response = await fetch(SERVER_URL + AUTH_ENDPOINT, {
		method:      "POST",
		headers:     { "Content-Type": "application/x-www-form-urlencoded" },
		body:        body,
		credentials: "include",
	})

	const errorResponse = await handleErrorResponse(response)
	if (errorResponse) {
		alert(`Error: ${errorResponse.message}`)
		return
	}

	alert("Registration successful")
})
