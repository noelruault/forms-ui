import { SERVER_URL } from "./environment.js"

fetch(SERVER_URL + "status")
	.then(response => {
		if (!response.ok) {
			throw new Error("Network response was not ok")
		}
		return response.json()
	})
	.then(data => {
		console.log("Server status:", data)
	})
	.catch(error => {
		console.error("Error fetching data:", error)
	})
