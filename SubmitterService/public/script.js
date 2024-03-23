const GW_URL = 'http://172.191.226.20:80';

let isJokeTextModified = false;
let isJokePunchlineModified = false;
let isButtonClicked = false;


document.addEventListener('DOMContentLoaded', (event) => {
    loadTypes();

    document.getElementById('submitJoke').addEventListener('click', onButtonClick);
    document.getElementById('jokeType').addEventListener('click', function () {
        validateForm();
        loadTypes();
    });
    document.getElementById('jokeText').addEventListener('input', function () {
        isJokeTextModified = true;
        validateForm();
    });
    document.getElementById('jokePunchline').addEventListener('input', function () {
        isJokePunchlineModified = true;
        validateForm();
    });
    document.getElementById('submitNewJoke').addEventListener('click', function () {
        document.getElementById('submitNewJoke').style.display = "none";
        document.getElementById('jokeForm').style.display = "flex";
    });
});

function validateForm() {
    console.log(isButtonClicked);
    const selectElement = document.getElementById('jokeType');
    const jokeText = document.getElementById('jokeText');
    const jokePunchline = document.getElementById('jokePunchline');

    if (selectElement.value == 0 && selectElement.length > 1) {
        selectElement.style.borderColor = "red";
        document.getElementById('errorJokeType').style.visibility = "visible";
    } else {
        selectElement.style.borderColor = "#333";
        document.getElementById('errorJokeType').style.visibility = "hidden";
    }

    if ((jokeText.value == "" && isJokeTextModified) || isButtonClicked) {
        jokeText.style.borderColor = "red";
        document.getElementById('errorJokeText').style.visibility = "visible";
    }
    else {
        jokeText.style.borderColor = "#333";
        document.getElementById('errorJokeText').style.visibility = "hidden";
    }

    if ((jokePunchline.value == "" && isJokePunchlineModified) || isButtonClicked) {
        jokePunchline.style.borderColor = "red";
        document.getElementById('errorJokePunchline').style.visibility = "visible";
    }
    else {
        jokePunchline.style.borderColor = "#333";
        document.getElementById('errorJokePunchline').style.visibility = "hidden";
    }
    console.log('22',isButtonClicked);
}

function onButtonClick() {
    isButtonClicked = true;
    validateForm();

    const selectElement = document.getElementById('jokeType');
    const jokeText = document.getElementById('jokeText');
    const jokePunchline = document.getElementById('jokePunchline');

    const submitNewJoke = document.getElementById('submitNewJoke');
    const jokeForm = document.getElementById('jokeForm');

    const joke = {
        type_id: selectElement.value, 
        joke_text: jokeText.value, 
        punch_line: jokePunchline.value
    }
    
    if (selectElement.value != 0 && jokeText.value != "" && jokePunchline.value != "") {
        submitJoke(joke).then((response) => {
            if (response) {
                submitNewJoke.style.display = "block";
                jokeForm.style.display = "none";
                isJokeTextModified = false;
                isJokePunchlineModified = false;
                isButtonClicked = false;
                jokeText.value = "";
                jokePunchline.value = "";
                selectElement.value = 0;
            } else {
                alert("Error occurred while submitting the joke. Please try again!!");
            }
        });
    }
    isButtonClicked = false;
    validateForm();
}

function loadTypes() {
    const selectElement = document.getElementById('jokeType');
    const noTypes = document.getElementById('noTypes');
    const text = document.getElementById('text');
    const punchline = document.getElementById('punchline');
    const submitJoke = document.getElementById('submitJoke');
    const selectType = selectElement.value;


    getType().then((types) => {
        if (types.length > 0) {
            text.style.display = "block";
            punchline.style.display = "block";
            noTypes.style.display = "none";
            submitJoke.style.display = "block";

            selectElement.length = 1;
            types.forEach(type => {
                const option = new Option(type.name, type.id);
                selectElement.add(option);
            });
            selectElement.value = selectType;
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
