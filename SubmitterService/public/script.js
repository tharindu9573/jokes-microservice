const GW_URL = 'http://172.191.226.20:80';

let isJokeTextModified = false;
let isJokePunchlineModified = false;
let isButtonClicked = false;

const jokeForm = document.getElementById('jokeForm');
const jokeTypes = document.getElementById('jokeType');
const errorJokeType = document.getElementById('errorJokeType');
const jokeText = document.getElementById('jokeText');
const errorJokeText = document.getElementById('errorJokeText');
const jokePunchline = document.getElementById('jokePunchline');
const errorJokePunchline = document.getElementById('errorJokePunchline');
const submitNewJoke = document.getElementById('submitNewJoke');

document.addEventListener('DOMContentLoaded', (event) => {
    loadTypes();

    document.getElementById('submitJoke').addEventListener('click', onButtonClick);
    jokeTypes.addEventListener('click', function () {
        validateForm();
        loadTypes();
    });
    jokeText.addEventListener('input', function () {
        isJokeTextModified = true;
        validateForm();
    });
    jokePunchline.addEventListener('input', function () {
        isJokePunchlineModified = true;
        validateForm();
    });
    submitNewJoke.addEventListener('click', function () {
        submitNewJoke.style.display = "none";
        jokeForm.style.display = "flex";
    });
});

function validateForm() {
    if (jokeTypes.value == 0 && jokeTypes.length > 1) {
        jokeTypes.style.borderColor = "red";
        errorJokeType.style.visibility = "visible";
    } else {
        jokeTypes.style.borderColor = "#333";
        errorJokeType.style.visibility = "hidden";
    }

    if ((jokeText.value == "" && isJokeTextModified) || isButtonClicked) {
        jokeText.style.borderColor = "red";
        errorJokeText.style.visibility = "visible";
    }
    else {
        jokeText.style.borderColor = "#333";
        errorJokeText.style.visibility = "hidden";
    }

    if ((jokePunchline.value == "" && isJokePunchlineModified) || isButtonClicked) {
        jokePunchline.style.borderColor = "red";
        errorJokePunchline.style.visibility = "visible";
    }
    else {
        jokePunchline.style.borderColor = "#333";
        errorJokePunchline.style.visibility = "hidden";
    }
}

function onButtonClick() {
    isButtonClicked = true;
    validateForm();

    const joke = {
        type_id: jokeTypes.value,
        joke_text: jokeText.value,
        punch_line: jokePunchline.value
    }

    if (jokeTypes.value != 0 && jokeText.value != "" && jokePunchline.value != "") {
        submitJoke(joke).then((response) => {
            if (response) {
                submitNewJoke.style.display = "block";
                jokeForm.style.display = "none";
                isJokeTextModified = false;
                isJokePunchlineModified = false;
                isButtonClicked = false;
                jokeText.value = "";
                jokePunchline.value = "";
                jokeTypes.value = 0;
            } else {
                alert("Error occurred while submitting the joke. Please try again!!");
            }
        });
    }
    isButtonClicked = false;
    validateForm();
}

function loadTypes() {
    const noTypes = document.getElementById('noTypes');
    const text = document.getElementById('text');
    const punchline = document.getElementById('punchline');
    const submitJoke = document.getElementById('submitJoke');
    const selectType = jokeTypes.value;


    getType().then((types) => {
        if (types.length > 0) {
            text.style.display = "block";
            punchline.style.display = "block";
            noTypes.style.display = "none";
            submitJoke.style.display = "block";

            jokeTypes.length = 1;
            types.forEach(type => {
                const option = new Option(type.name, type.id);
                jokeTypes.add(option);
            });
            jokeTypes.value = selectType;
        } else {
            noTypes.style.display = "block";
            text.style.display = "none";
            punchline.style.display = "none";
            submitJoke.style.display = "none";
        }
    });
}

async function getType() {
    try {
        const response = await fetch(`${GW_URL}/submit/types`)
        if (!response.ok) {
            return [];
        } else {
            const results = await response.json();
            return results;
        }
    } catch (err) {
        return [];
    }
}

async function submitJoke(joke) {
    try {
        const response = await fetch(`${GW_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(joke)
        });

        if (!response.ok) {
            return null;
        } else {
            return response;
        }
    } catch (err) {
        return null;
    }
}
