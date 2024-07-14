// errors.js

/**
 * Handles error responses and extracts error details if present.
 * @param {Response} response - The fetch response object.
 * @returns {Promise<Object|null>} - A promise that resolves to the error details or null if no error structure is found.
 */
export async function handleErrorResponse(response) {
	if (!response.ok) {
		try {
			const body = await response.json()

			// Check if the response contains the expected error structure
			if (body.status === "error" && body.error) {
				return {
					code:       body.error.code,
					message:    body.error.message,
					statusCode: body.statusCode
				}
			}
		} catch (error) {
			console.error("Error parsing response JSON:", error)
		}
	}
	return null
}
