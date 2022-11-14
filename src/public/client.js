let store = Immutable.Map({
    project: Immutable.Map({ title: "MARS Dashboard" }),
    apod: '',
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
    currentRover: ''
})

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (state, newState) => {
    store = state.merge(newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    const apod = state.get('apod');
    ImageOfTheDay(state)
    return `
        <header>${Greeting(store, getTitle)} <ul>${Menu(state)}</ul></header>
        <main>
            
            <section style="background-image: url('${apod.image.url}'); background-repeat: no-repeat; background-size: 100% 100%">
                ${showSelectedRover(store, getRoverDetails)}
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.

//Higher order function which takes a function and return the title.
const Greeting = (state, callback) => {
    return `<h1 style='display:inline-block'>${callback(state)} </h1>`
}

//callback function which will be used to get the title of project
const getTitle = (state) => {
    try{
        return state.get('project').get('title');
    }
    catch (e){
        return 'MARS DASHBOARD'
    }
    
}

//callback function to return selected rover
const getRoverDetails = (state) => {
    return state.get('currentRover');
}

//get rovers menu
const Menu = (state) => {

    return Array.from(state.get('rovers')).map( menu_item => `<li id=${menu_item} onclick="handleSelect(event)">${menu_item}</li>`)
}

//handle clicking menu item
const handleSelect = (event) =>{
    getSelectedRover(event.currentTarget.innerHTML, store);
}

//Higher order function 2 that will return the details of rover by getting the information from callbackfunction
const showSelectedRover = (state, callback) => {
    
    if(callback(state) === ''){
        return `<div id="emptyRover"> <h2>Select Rover from the menu to display elements </h2> </div>`
    }
    else{
        return Array.from(callback(state).latest_photos).map( menu_item => `
        <div class="rover_item">
        <img src="${menu_item.img_src}"/>
        <div class="rover_text">
        <p>Launch date ${menu_item.rover.launch_date} </p>
        <p>Landing Date:  ${menu_item.rover.landing_date} </p>
        <p>Status: ${menu_item.rover.status} </p>
        <p>Earth date: ${menu_item.earth_date} </p>
        </div>
        </div>
        `)
    }
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (state) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(state.get('apod').date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!state.get('apod') || state.get('apod').date === today.getDate() ) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (state.get('apod').media_type === "video") {
        return (`
            <p>See today's featured video <a href="${state.get('apod').url}">here</a></p>
            <p>${state.get('apod').title}</p>
            <p>${state.get('apod').explanation}</p>
        `)
    } else {
        return (`
            <img src="${state.get('apod').image.url}" height="350px" width="100%" />
            <p>${state.get('apod').image.explanation}</p>
        `)
    }
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = async (state) => {


    let apod = '';
    const response = await fetch('http://127.0.0.1:3000/apod');
    apod = await response.json();
    const newState = Immutable.Map({'apod': apod});
    updateStore(store, newState)
    return apod;

}


//call api and return rover details
const getSelectedRover = async (name, state) => {
    let selectedRover = '';
    const response = await fetch(`http://127.0.0.1:3000/rovers/${name}`);
    selectedRover = await response.json();
    const newState = Immutable.Map({'currentRover': selectedRover});
    updateStore(store, newState);
    return selectedRover;

}