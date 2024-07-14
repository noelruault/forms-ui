import { handleErrorResponse } from "./errors.js"
import { SERVER_URL } from "./environment.js"

const AUTH_ENDPOINT = "login"

document.getElementById("loginForm").addEventListener("submit", async (event) => {
	event.preventDefault()

	const email = document.getElementById("email").value
	const password = document.getElementById("password").value

	const response = await fetch(SERVER_URL + AUTH_ENDPOINT, {
		method:      "POST",
		headers:     { "Content-Type": "application/json" },
		body:        JSON.stringify({ email, password }),
		credentials: "include",
	})

	const errorResponse = await handleErrorResponse(response)
	if (errorResponse) {
		// console.log(errorResponse)
		alert(`Error: ${errorResponse.message}`)
		return
	}

	alert("Login successful")
})

// async function fetchWithAuth(url, options = {}) {
// 	const xsrfToken = document.cookie.split("; ").find(row => row.startsWith("XSRF-TOKEN")).split("=")[1]
// 	options.headers = {
// 		...options.headers,
// 		"X-XSRF-TOKEN": xsrfToken,
// 	}
// 	const response = await fetch(url, options)
// 	return response.json()
// }
