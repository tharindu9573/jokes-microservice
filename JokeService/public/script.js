const GW_URL = 'http://172.191.226.20:80';

const jokeTypes = document.getElementById('jokeType');
const jokeText = document.getElementById('jokeText');
const jokePunchline = document.getElementById('jokePunchline');
const jokeDisplay = document.getElementById('jokeDisplay');
const anySelect = document.getElementById('anySelect');
const noJokes = document.getElementById('noJokes');
const noTypes = document.getElementById('noTypes');


document.addEventListener('DOMContentLoaded', (event) => {
    loadTypes();

    document.getElementById('getJoke').addEventListener('click', onButtonClick);
    jokeTypes.addEventListener('click', function () {
        loadTypes();
    });
});

function onButtonClick() {

    noJokes.style.display = "none";
    noTypes.style.display = "none";
    anySelect.style.display = "none";

    jokeText.textContent = "";
    jokePunchline.textContent = "";

    if (jokeTypes.value != 0) {
        getJokeByType(jokeTypes.value).then((joke) => {
            if (joke) {
                jokeDisplay.style.display = "block";
                jokeText.textContent = joke.joke_text;

                setTimeout(() => {
                    jokePunchline.textContent = joke.punch_line;
                }, 2000);
            } else {
                jokeDisplay.style.display = "none";
                noJokes.style.display = "block";
            }
        });
    } else {
        jokeDisplay.style.display = "none";
        anySelect.style.display = "block";
    }
}

function loadTypes() {
    const selectType = jokeTypes.value;

    getType().then((types) => {
        if (types.length > 0) {
            noTypes.style.display = "none";
            anySelect.style.display = "none";

            jokeTypes.length = 1;
            types.forEach(type => {
                const option = new Option(type.name, type.id);
                jokeTypes.add(option);
            });
            jokeTypes.value = selectType;
        } else {
            noTypes.style.display = "block";
            jokeDisplay.style.display = "none";
            anySelect.style.display = "none";
            noJokes.style.display = "none";
        }
    });
}

async function getType() {
    try {
        const response = await fetch(`${GW_URL}/types`)
        if (!response.ok) {
            return []
        } else {
            const results = await response.json()
            return results
        }
    } catch (err) {
        return [];
    }
}

async function getJokeByType(id) {
    try {
        const response = await fetch(`${GW_URL}/jokes/types/${id}`)
        if (!response.ok) {
            return null;
        } else {
            const results = await response.json()
            return results
        }
    } catch (err) {
        return null;
    }
}