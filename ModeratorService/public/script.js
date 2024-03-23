const GW_URL = 'http://172.191.226.20:80';

let isNewType = false;
let jwtToken = '';
let start_time = new Date().toISOString();
let receivedJoke = {};

const jokeTypes = document.getElementById('jokeType');
const addNewJoke = document.getElementById('addJokeType');
const noTypes = document.getElementById('noTypes');
const jokeInput = document.getElementById('jokeInput');
const newJokeType = document.getElementById('newJokeType');
const errorNewJokeType = document.getElementById('errorNewJokeType');
const jokeText = document.getElementById('jokeText');
const jokeTextError = document.getElementById('errorJokeText');
const jokePunchline = document.getElementById('jokePunchline');
const jokePunchlineError = document.getElementById('errorJokePunchline');
const jokeActions = document.getElementById('jokeActions');
const submitNewJoke = document.getElementById('submitNewJoke');
const moderateForm = document.getElementById('moderateForm');
const loginForm = document.getElementById('loginForm');


document.addEventListener('DOMContentLoaded', (event) => {
    jwtToken = sessionStorage.getItem('token') ? sessionStorage.getItem('token') : null;
    if (!jwtToken) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var username = document.getElementById('username').value;
            var password = document.getElementById('password').value;

            login({ username: username, password: password }).then((result) => {

                if (result) {
                    sessionStorage.setItem('token', result.token);
                    jwtToken = result.token;
                    loginForm.style.display = "none";
                    document.getElementById('moderateJokes').style.display = "flex";
                    loadTypes();
                    handleSubmittedJokes();
                } else {
                    alert('Invalid credentials. Please try again!');
                }
            });
        });
    }
    else {
        loginForm.style.display = "none";
        document.getElementById('moderateJokes').style.display = "flex";
        loadTypes();
        handleSubmittedJokes();
    }

    document.getElementById('addJokeType').addEventListener('click', onAddNewTypeClick);
    document.getElementById('submitJoke').addEventListener('click', onSubmitJokeClick);
    document.getElementById('deleteJoke').addEventListener('click', onDeleteJokeClick);
    submitNewJoke.addEventListener('click', onSubmitNewJokeClick);

    document.getElementById('jokeType').addEventListener('click', function () {
        loadTypes();
    });

});

function onAddNewTypeClick() {
    if (!isNewType) {
        isNewType = true;
        jokeTypes.selectedIndex = 0;
        addNewJoke.innerText = "Cancel New Type";
        newJokeType.style.display = "block";
        errorNewJokeType.style.display = "block";
        if (jokeTypes.length == 1) {
            noTypes.style.display = "none";
            jokeInput.style.display = "block";
            jokeActions.style.display = "block";
        }
    } else {
        isNewType = false;
        jokeTypes.selectedIndex = receivedJoke.type_id;
        addNewJoke.innerText = "Add New Type";
        newJokeType.style.display = "none";
        errorNewJokeType.style.display = "none";
        if (jokeTypes.length == 1) {
            noTypes.style.display = "block";
            jokeInput.style.display = "none";
            jokeActions.style.display = "none";
        }
    }
}

function onSubmitJokeClick() {

    handleApprovedJokes();
}

function onDeleteJokeClick() {
}

function onSubmitNewJokeClick() {
    isNewType = false;
    moderateForm.style.display = "block";
    submitNewJoke.style.display = "none";
    addNewJoke.innerText = "Add New Type";
    newJokeType.style.display = "none";
    errorNewJokeType.style.display = "none";
    jokeText.value = '';
    jokePunchline.value = '';
    newJokeType.value = '';
    jokeTypes.value = 0;
    handleSubmittedJokes();
}

function handleSubmittedJokes() {
    getSubmittedJokes().then((res) => {
        if (res) {
            start_time = new Date().toISOString();
            receivedJoke = res;
            jokeText.value = res.joke_text
            jokePunchline.value = res.punch_line
            jokeTypes.value = res.type_id
        } else {
            setTimeout(handleSubmittedJokes, 5000);
        }
    });
}

function handleApprovedJokes() {
    let is_changed = false;
    let changeFields = '';
    let new_type = '';
    let new_type_id = 0;

    if (jokeText.value != receivedJoke.joke_text) {
        is_changed = true;
        changeFields += 'joke_text, ';
    }
    if (jokePunchline.value != receivedJoke.punch_line) {
        is_changed = true;
        changeFields += 'punch_line, ';
    }
    if (isNewType && newJokeType.value != '') {
        is_changed = true;
        changeFields += 'type, ';
        new_type = newJokeType.value;
    }
    else if (jokeTypes.value != receivedJoke.type_id && jokeTypes.value != 0) {
        is_changed = true;
        changeFields += 'type, ';
        new_type_id = jokeTypes.value;
        new_type = jokeTypes.options[jokeTypes.selectedIndex].text;
    }
    else {
        new_type_id = jokeTypes.value;
        new_type = jokeTypes.options[jokeTypes.selectedIndex].text;
    }

    const newJoke = {
        id: receivedJoke.id,
        joke_text: jokeText.value,
        punch_line: jokePunchline.value,
        type_id: new_type_id,
        type_name: new_type,
        original_joke: JSON.stringify({ 'joke_text': receivedJoke.joke_text, 'punch_line': receivedJoke.punch_line, 'type_id': receivedJoke.type_id }),
        is_changed: is_changed,
        change_properties: changeFields,
        start_time: start_time,
        end_time: new Date().toISOString()
    };

    approveJoke(newJoke).then((res) => {
        if (res) {
            moderateForm.style.display = "none";
            submitNewJoke.style.display = "block";
            isNewType = true;
            addNewJoke.innerText = "Add New Type";
            newJokeType.style.display = "none";
            errorNewJokeType.style.display = "none";
        } else
            alert('An error occurred while submitting the joke. Please try again!');
    });

}

function validateForm() {

    // if (jokeTypes.value == 0 && jokeTypes.length > 1) {
    //     jokeTypes.style.borderColor = "red";
    //     document.getElementById('errorJokeType').style.visibility = "visible";
    // } else {
    //     jokeTypes.style.borderColor = "#333";
    //     document.getElementById('errorJokeType').style.visibility = "hidden";
    // }

    if ((jokeText.value == "" && isJokeTextModified) || isButtonClicked) {
        jokeText.style.borderColor = "red";
        jokeTextError.style.visibility = "visible";
    }
    else {
        jokeText.style.borderColor = "#333";
        jokeTextError.style.visibility = "hidden";
    }

    if ((jokePunchline.value == "" && isJokePunchlineModified) || isButtonClicked) {
        jokePunchline.style.borderColor = "red";
        jokePunchlineError.style.visibility = "visible";
    }
    else {
        jokePunchline.style.borderColor = "#333";
        jokePunchlineError.style.visibility = "hidden";
    }
}

function loadTypes() {
    const selectType = jokeTypes.value;

    getTypes().then((types) => {
        if (types.length > 0) {
            noTypes.style.display = "none";
            jokeInput.style.display = "block";
            jokeActions.style.display = "block";

            jokeTypes.length = 1;
            types.forEach(type => {
                const option = new Option(type.name, type.id);
                jokeTypes.add(option);
            });
            jokeTypes.value = selectType;
        } else {
            noTypes.style.display = "block";
            jokeInput.style.display = "none";
            jokeActions.style.display = "none";
        }
    });
}

function validateResponse(response) {
    if (response.status == 401) {
        alert('Session has expired. Please login again!');
        sessionStorage.removeItem('token');
        loginForm.style.display = "block";
        document.getElementById('moderateJokes').style.display = "none";
        return null;
    }
}

async function getTypes() {
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

async function login(loginRequest) {
    try {
        const response = await fetch(`${GW_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginRequest)
        });

        if (!response.ok) {
            return null;
        } else {
            return await response.json();
        }
    } catch (err) {
        return null;
    }
}

async function getSubmittedJokes() {
    try {
        const response = await fetch(`${GW_URL}/moderate/unapproved`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        validateResponse(response);
        if (!response.ok) {
            return null;
        } else {
            return await response.json();
        }
    } catch (err) {
        return null;
    }
}

async function approveJoke(approvedJoke) {
    try {
        const response = await fetch(`${GW_URL}/moderate/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify(approvedJoke)
        });
        validateResponse(response);
        if (!response.ok) {
            return null;
        } else {
            return await response.json();
        }
    } catch (err) {
        return null;
    }
}

