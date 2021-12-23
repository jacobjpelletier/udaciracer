// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
const store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

const RaceTracks = {
	"Track 1": "Rainbow Road",
	"Track 2": "Luigi Raceway",
	"Track 3": "Koopa Troopa Beach",
	"Track 4": "Kalimari Desert",
	"Track 5": "Yoshi Valley",
	"Track 6": "DK's Jungle Parkway",
}

const KartRacers = {
	// map default racer names to custom racer names
	"Racer 1": "Mario",
	"Racer 2": "Luigi",
	"Racer 3": "Peach",
	"Racer 4": "Yoshi",
	"Racer 5": "Wario",
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	// these two methods called when DOM is loaded
	onPageLoad()
	setupClickHandlers()
})

/** onPageLoad() **/
/* called when DOM is loaded
 * calls:
 *   1. renderTrackCards
 *   2. renderRacerCars
 *   3. renderAt
 *   4. getTracks
 * INPUT: none
 * OUTPUT: renders new html
 */
async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {

		const { target } = event
		//console.log(target)

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		// Podracer form field
		if (target.matches('.card.racer')) {
			handleSelectPodRacer(target)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	try {
		// TODO - Get player_id and track_id from the store
		const racer_id = store.player_id;
		const track_id = store.track_id;
		// TODO create race
		const race = await(createRace(racer_id,track_id));
		// TODO - update the store with the race id
		store.race_id = parseInt(race.ID) -1;
		// The race has been created, now start the countdown
		// ender UI by passing tack id argument
		renderAt('#race', renderRaceStartView(track_id, 5))
		// TODO - call the async function runCountdown
		await runCountdown()
		// TODO - call the async function startRace
		await startRace(store.race_id)
		// TODO - call the async function runRace
		console.log(`id updated: ${store.race_id}`);
		await runRace(store.race_id)
	} catch (error) {
		console.log(`Error: ${error.message}`)
	}

}

function runRace(race_ID) {
	try {
		return new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to get race info every 500ms
			const raceInterval = setInterval(async() => {
				// TODO - if the race info status property is "in-progress", update the leaderboard by calling:
				const currentRace = await getRace(race_ID);
				//console.log(race_ID);
				if(currentRace.status === "in-progress"){
					//console.log(currentRace.status);
					//console.log(currentRace.positions);
					renderAt('#leaderBoard', raceProgress(currentRace.positions));
				}
				// TODO - if the race info status property is "finished", run the following:
				else if (currentRace.status === "finished"){
					clearInterval(raceInterval); // to stop the interval from repeating
					renderAt('#race', resultsView(currentRace.positions)); // to render the results view
					resolve(currentRace); // resolve the promise
				}
			}, 500)
		})
	// remember error handling
	} catch(error) {
		console.log(`Error: ${error.message}`)
	}
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to count down once per second
			const countInterval = setInterval(() => {
				document.getElementById('big-numbers').innerHTML = --timer;
				// TODO - if the countdown is done, clear the interval, resolve the promise, and return
				if (timer <= 0) {
					clearInterval(countInterval);
					resolve("completed");
					return;
				}
			}, 1000)

			// run this DOM manipulation to decrement the countdown for the user
			// document.getElementById('big-numbers').innerHTML = --timer
		})
	} catch(error) {
		console.log(error);
	}
}

function handleSelectPodRacer(target) {
	//console.log("selected a pod", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected racer to the store
	store.player_id = target.id;
}

function handleSelectTrack(target) {

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected track id to the store
	store.track_id = target.id;

}

function handleAccelerate() {
	// TODO - Invoke the API call to accelerate
	accelerate(store.race_id).then(() => console.log("mushroom boost")).catch((error) => console.log(error));
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</h4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card racer" id="${id}">
			<img src="../assets/images/kart${id}.png" alt="${KartRacers[driver_name]}"/>
			<h3>${KartRacers[driver_name]}</h3>
			<p>Top Speed: ${top_speed}</p>
			<p>Acceleration: ${acceleration}</p>
			<p>Handling: ${handling}</p>
			<button type="button" class="card racer" id="${id}" style="padding: 15px 32px; background-color: darkseagreen;">Select</button>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `
		<li id="${id}" class="card track">
			<img src="../assets/images/track${id}.png"/>
			<h3>${RaceTracks[name]}</h3>
			<button type="button" class="card track" id="${id}" style="padding: 15px 32px; background-color: darkseagreen;">Select</button>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	const trackName = RaceTracks[`Track ${track}`];
	const racerName = KartRacers[`Racer ${store.player_id}`]
	console.log(`${trackName}`)
	return `
		<header>
			<h1>Race: ${racerName} on ${trackName}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	//console.log(`positions: ${positions}`);
	//console.log(`player id: ${store.player_id}`);
	const id = store.player_id;
	//console.log(`array: ${positions[id].driver_name}`);

	const userPlayer = positions[id];
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

/** getTracks - a fetch call (with error handling!) to each of the following API endpoints **/
/* called by onPageLoad
 * calls fetch for a GET request to server for tracks and calls defaultFetchOpts()
 * INPUT: none
 * OUTPUT:
 * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 *   1. on success: returns json from results with .json()
 *   2. on failure: error message
 */
function getTracks() {
	// GET request to `${SERVER}/api/tracks`
	return fetch (`${SERVER}/api/tracks`, {
				method: "GET",
		        // add default headers and such from defaultFetchOpts()
				...defaultFetchOpts()
	})
	.then(results => {
		// console.log(results)
		return results.json()
	})
	.catch(err => console.log("Problem with request:", err))
}

/** getRacers - a fetch call (with error handling!) to each of the following API endpoints **/
/* called by onPageLoad
 * calls fetch for a GET request to server for tracks and calls defaultFetchOpts()
 * INPUT: none
 * OUTPUT:
 * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 *   1. on success: returns json from results with .json()
 *   2. on failure: error message
 */
function getRacers() {
	// GET request to `${SERVER}/api/cars`
	return fetch (`${SERVER}/api/cars`, {
		method: "GET",
		...defaultFetchOpts()
	})
		.then(results => {
			// console.log(results)
			return results.json()
		})
		.catch(err => console.log("Problem with request:", err))
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }
	
	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with createRace request::", err))
}

function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	return fetch(`${SERVER}/api/races/${id}`).then(response => response.json())
		.catch(error => console.log(error));
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	}).catch(err => console.log("Problem with getRace request::", err))
}

function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body or datatype needed for this request
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
		method: 'POST',
		...defaultFetchOpts()
	}).catch(error => console.log(error))
}
