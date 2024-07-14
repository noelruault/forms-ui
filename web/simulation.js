import { handleErrorResponse } from "./errors.js"
import { SERVER_URL } from "./environment.js"

const API_ENDPOINT = "questions/self/?amount=10"
const SUBMIT_ENDPOINT = "questions/submit/"

document.addEventListener("DOMContentLoaded", async () => {
	const form = document.querySelector("#mockForm")
	const questions = await getQuestionsFromDatabase()

	generateSimulationFormContent(form, questions)
	form.addEventListener("submit", (e) => handleFormSubmit(e, form, questions))

})

async function getQuestionsFromDatabase() {
	try {
		const response = await fetch(SERVER_URL + API_ENDPOINT, {
			method:      "GET",
			headers:     { "Content-Type": "application/json" },
			credentials: "include",
		})
		const errorResponse = await handleErrorResponse(response)
		if (errorResponse) {
			alert(`Error: ${errorResponse.message}`)
			return
		}

		const data = await response.json()
		return data.questions
	} catch (error) {
		console.error("Error fetching questions:", error)
		alert("Error fetching questions, please try again later.")
	}
}

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]]
	}
}

function createQuestionElement(question, index) {
	const questionDiv = document.createElement("div")
	questionDiv.classList.add("question")

	const questionText = document.createElement("p")
	questionText.innerText = `${index + 1}. ${question.question}`
	questionDiv.appendChild(questionText)

	const answers = JSON.parse(question.wrongs)
	answers.push(question.accepted)
	shuffleArray(answers)

	answers.forEach(answer => {
		const label = document.createElement("label")

		const radioButton = document.createElement("input")
		radioButton.type = "radio"
		radioButton.name = question.id
		radioButton.value = answer
		label.appendChild(radioButton)

		const answerText = document.createTextNode(answer)
		label.appendChild(answerText)

		questionDiv.appendChild(label)
	})

	return questionDiv
}

function generateSimulationFormContent(form, questions) {
	form.innerHTML = "" // Clear the container

	questions.forEach((question, index) => {
		const questionElement = createQuestionElement(question, index)
		form.appendChild(questionElement)
	})

	const submitButton = createSubmitButton()
	form.appendChild(submitButton)
	// formContainer.appendChild(form)
	enableSubmitButtonOnAllAnswered(form, submitButton, questions.length)
}

function createSubmitButton() {
	const submitButton = document.createElement("button")
	submitButton.type = "submit"
	submitButton.innerText = "Submit"
	submitButton.id = "submitBtn"
	submitButton.disabled = true
	return submitButton
}

function enableSubmitButtonOnAllAnswered(form, submitButton, questionsAmount) {
	const radioButtons = form.querySelectorAll("input[type=\"radio\"]")
	const allAnswered = () => {
		const answers = new Set()
		radioButtons.forEach(input => {
			if (input.checked) answers.add(input.name)
		})
		return answers.size === questionsAmount
	}

	radioButtons.forEach(rb => {
		rb.addEventListener("change", () => {
			submitButton.disabled = !allAnswered()
		})
	})
}

function updateSelectedAnswers(formData, questions) {
	// const questionsWithAnswers = [...originalQuestions] // Copy the original array of question objects

	formData.forEach((value, key) => {
		const question = questions.find(q => q.id === Number(key))
		if (question) {
			question.selectedAnswer = value // Add selected answer to the question object
		}
	})

	return questions
}

async function handleFormSubmit(event, form, questions) {
	event.preventDefault() // Prevent the form from submitting normally

	if (!confirm("¿Está seguro de enviar las respuestas?")) {
		return
	}

	const formData = new FormData(form)
	updateSelectedAnswers(formData, questions)

	const modal = document.querySelector("#modal")

	try {
		const response = await fetch(SERVER_URL + SUBMIT_ENDPOINT, {
			method:      "POST",
			headers:     { "Content-Type": "application/json" },
			body:        JSON.stringify(questions),
			credentials: "include"
		})

		const errorResponse = await handleErrorResponse(response)
		if (errorResponse) {
			showModal(modal, "error", `Error: ${errorResponse.message}`)
			return
		}

		showModal(modal, "success", "Form submitted successfully!")
		form.reset()
		form.remove()

	} catch (error) {
		console.error("Error submitting form:", error)
		showModal(modal, "error", "Error submitting form, please try again later.")
	}
}

/**
* type = "error" | "success"
*/
function showModal(target, type, message) {
	// create <div class="modal-content" id="modalContent">
	const modalContent = document.createElement("div")
	modalContent.classList.add("modal-content")
	modalContent.id = "modalContent"
	modalContent.innerHTML = `<p>${message}</p>`
	target.appendChild(modalContent)

	// create <span class="close" id="closeModal">&times;</span>
	const closeModal = document.createElement("span")
	closeModal.classList.add("close")
	closeModal.id = "closeModal"
	closeModal.innerHTML = "&times;"
	target.appendChild(closeModal)

	target.style.backgroundColor = type === "error" ? "#d44c6d" : "#68e1ac"
	target.style.display = "flex"
	target.style.justifyContent = "space-between"

	// When the user clicks on <span> (x), close the modal
	closeModal.onclick = () => {
		target.style.display = "none"
		modalContent.remove()
		closeModal.remove()
	}
}
