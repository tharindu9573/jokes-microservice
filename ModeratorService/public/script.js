document.addEventListener('DOMContentLoaded', (event) => {
    console.log('hello from moderator');
    const button = document.getElementById('addJokeType'); // Get the button element
    button.addEventListener('click', onButtonClick);
    // fetch('/api/endpoint')
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error('Network response was not ok');
    //         }
    //         return response.json();
    //     })
    //     .then(data => {
    //         console.log(data); // Here's your data
    //         // Do something with the data, like inserting it into the DOM
    //     })
    //     .catch(error => {
    //         console.error('There has been a problem with your fetch operation:', error);
    //     });
});

function onButtonClick() {
    console.log('Button was clicked!');
}