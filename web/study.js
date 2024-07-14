import { handleErrorResponse } from "./errors.js"
import { SERVER_URL } from "./environment.js"

const API_ENDPOINT = "questions/self/?amount=5"
const SUBMIT_ENDPOINT = "questions/submit/"

document.addEventListener("DOMContentLoaded", async () => {
	const form = document.querySelector("#quizForm")
	const questions = await getQuestionsFromDatabase()
	generateQuizFormContent(form, questions)
	addFloatingSubmitButtonListener(form, questions)
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
	const article = document.createElement("article")
	article.classList.add("article")
	if (index !== 0) {
		article.classList.add("hidden")
	}

	const bodyDiv = document.createElement("div")
	bodyDiv.classList.add("body")

	const questionDiv = document.createElement("div")
	questionDiv.classList.add("question")

	const questionText = document.createElement("p")
	questionText.innerText = `${index + 1}. ${question.question}`
	questionDiv.appendChild(questionText)

	const answersDiv = document.createElement("div")
	answersDiv.classList.add("answers")

	const answers = JSON.parse(question.wrongs)
	answers.push(question.accepted)
	shuffleArray(answers)

	answers.forEach((answer, _i) => {
		const input = document.createElement("input")
		input.type = "radio"
		input.name = question.id
		input.value = answer
		answersDiv.appendChild(input)

		const label = document.createElement("label")
		label.htmlFor = question.id
		label.innerText = answer
		answersDiv.appendChild(label)

		answersDiv.appendChild(document.createElement("br"))
	})

	bodyDiv.appendChild(questionDiv)
	bodyDiv.appendChild(answersDiv)
	article.appendChild(bodyDiv)

	const footerDiv = document.createElement("div")
	footerDiv.classList.add("footer")

	const navDiv = document.createElement("div")
	navDiv.classList.add("nav")

	const prevButton = document.createElement("button")
	prevButton.type = "button"
	prevButton.innerText = "←"
	prevButton.disabled = index === 0
	prevButton.addEventListener("click", () => navigateToCard(index - 1))
	navDiv.appendChild(prevButton)

	const explanationButton = document.createElement("button")
	explanationButton.type = "button"
	explanationButton.innerText = "Ver explicación"
	explanationButton.disabled = true
	explanationButton.addEventListener("click", () => toggleExplanation(index))
	navDiv.appendChild(explanationButton)

	const nextButton = document.createElement("button")
	nextButton.type = "button"
	nextButton.innerText = "→"
	nextButton.disabled = true // Initially disabled
	nextButton.addEventListener("click", () => navigateToCard(index + 1))
	navDiv.appendChild(nextButton)

	const submitButton = document.createElement("button")
	submitButton.type = "button"
	submitButton.innerText = "Submit Answer"
	submitButton.addEventListener("click", () => {
		const selectedAnswer = article.querySelector(`input[name="${question.id}"]:checked`)
		if (selectedAnswer) {
			explanationButton.disabled = false
			nextButton.disabled = false
			if (selectedAnswer.value === question.accepted) {
				article.style.backgroundColor = "#d4edda" // Green for correct
			} else {
				article.style.backgroundColor = "#f8d7da" // Red for incorrect
			}
		}
	})
	navDiv.appendChild(submitButton)

	footerDiv.appendChild(navDiv)

	const explanationDiv = document.createElement("div")
	explanationDiv.classList.add("explanation")
	explanationDiv.hidden = true
	explanationDiv.innerHTML = `<p>${question.explanation}</p>`
	footerDiv.appendChild(explanationDiv)

	article.appendChild(footerDiv)
	return article
}

function generateQuizFormContent(form, questions) {
	form.innerHTML = ""
	questions.forEach((question, index) => {
		const questionElement = createQuestionElement(question, index)
		form.appendChild(questionElement)
	})

	const submitButton = document.createElement("button")
	submitButton.type = "submit"
	submitButton.innerText = "Submit"
	submitButton.id = "floatingSubmitBtn"
	submitButton.style.position = "fixed"
	submitButton.style.bottom = "20px"
	submitButton.style.right = "20px"
	form.appendChild(submitButton)
}

function navigateToCard(index) {
	const articles = document.querySelectorAll("article")
	articles.forEach((article, i) => {
		if (i === index) {
			article.classList.remove("hidden")
		} else {
			article.classList.add("hidden")
		}
	})
}

function toggleExplanation(index) {
	const articles = document.querySelectorAll("article")
	const explanationDiv = articles[index].querySelector(".explanation")
	explanationDiv.hidden = !explanationDiv.hidden
}

function addFloatingSubmitButtonListener(form, questions) {
	const submitButton = document.querySelector("#floatingSubmitBtn")
	submitButton.addEventListener("click", async (e) => {
		e.preventDefault()
		const formData = new FormData(form)
		updateSelectedAnswers(formData, questions)
		try {
			const response = await fetch(SERVER_URL + SUBMIT_ENDPOINT, {
				method:      "POST",
				headers:     { "Content-Type": "application/json" },
				body:        JSON.stringify(questions),
				credentials: "include"
			})

			const errorResponse = await handleErrorResponse(response)
			if (errorResponse) {
				alert(`Error: ${errorResponse.message}`)
				return
			}

			alert("Form submitted successfully!")
		} catch (error) {
			console.error("Error submitting form:", error)
			alert("Error submitting form, please try again later.")
		}
	})
}

function updateSelectedAnswers(formData, questions) {
	formData.forEach((value, key) => {
		const question = questions.find(q => q.id === Number(key))
		if (question) {
			question.selectedAnswer = value // Add selected answer to the question object
		}
	})
	return questions
}
