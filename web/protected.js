import { handleErrorResponse } from "./errors.js"
import { SERVER_URL } from "./environment.js"

const UNPROTECTED_ENDPOINT = "public/"
const USER_PROTECTED_ENDPOINT = "user/"
const ADMIN_PROTECTED_ENDPOINT = "admin/"

document.getElementById("publicResource").addEventListener("click", async (event) => {
	event.preventDefault()

	const response = await fetch(SERVER_URL + UNPROTECTED_ENDPOINT, {
		method: "GET"
	})

	const errorResponse = await handleErrorResponse(response)
	if (errorResponse) {
		// console.log(errorResponse)
		alert(`Error: ${errorResponse.message}`)
		return
	}

	const data = await response.json()
	alert(data.message)
})


document.getElementById("userResource").addEventListener("click", async (event) => {
	event.preventDefault()

	const response = await fetch(SERVER_URL + USER_PROTECTED_ENDPOINT, {
		method:      "GET",
		// If credentials is omitted, cookies won't be sent within request NOR will be recieved and saved from response
		credentials: "include"
	})

	const errorResponse = await handleErrorResponse(response)
	if (errorResponse) {
		// console.log(errorResponse)
		alert(`Error: ${errorResponse.message}`)
		return
	}

	const data = await response.json()
	alert(data.message)
})

document.getElementById("adminResource").addEventListener("click", async (event) => {
	event.preventDefault()

	const response = await fetch(SERVER_URL + ADMIN_PROTECTED_ENDPOINT, {
		method:      "GET",
		credentials: "include"
	})

	const errorResponse = await handleErrorResponse(response)
	if (errorResponse) {
		// console.log(errorResponse)
		alert(`Error: ${errorResponse.message}`)
		return
	}

	const data = await response.json()
	alert(data.message)
})
