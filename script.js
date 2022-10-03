// variables Global Declaration

const poke_container = document.getElementById('js-poke-container');
const types_container = document.getElementById('pokemon-dropdown-type');
const genders_container = document.getElementById('pokemon-dropdown-gender');
const stats_container = document.getElementById('status-list');
const detail_card_container = document.getElementById('detail-card');
let genderlessSpecies;
let search_word = '';
let type_filter = [];
let gender_filter = [];
let genders;
let stats;
let types;
let selectedPokemonGender = '';
let femaleSpecies;
let maleSpecies;
const pokemons_number = 150;
let pokemon_list = [];
const colors = {
	fire: '#EDC2C4',
	grass: '#C0D4C8',
	electric: '#E2E2A0',
	water: '#CBD5ED',
	ground: '#F4D1A6',
	rock: '#C5AEA8',
	fairy: '#E4C0CF',
	poison: '#CFB7ED',
	bug: '#C1E0C8',
	ghost: '#D7C2D7',
	steel: '#C2D4CE',
	ice: '#C7D7DF',
	dark: '#C6C5E3',
	shadow: '#CACACA',
	dragon: '#CADCDF',
	psychic: '#DDC0CF',
	flying: '#B2D2E8',
	fighting: '#FCC1B0',
	unknown: '#C0DFDD',
	normal: '#DDCBD0'
};
const main_types = Object.keys(colors);

// To get all gender wise pokemons 
async function getAllGender() {
	femaleSpecies = await getGender('1');
	console.log(femaleSpecies)
	maleSpecies = await getGender('2');
	genderlessSpecies = await getGender('3');
}

// To get pokemons of perticular gender
async function getGender(id) {
	try {
		const res = await fetch(`https://pokeapi.co/api/v2/gender/${id}`);
		const data = await res.json();
		let pokemon_species = []
		data.pokemon_species_details.forEach(species => {
			pokemon_species.push(species.pokemon_species.name);
		});
		return pokemon_species;
	}
	catch (error) {
		console.log('There was an error!', error);
	}
}

// Method to fetch pokemon data initially
async function fetchPokemons() {
	for (let i = 1; i <= 50; i++) {
		await getPokemon(i);
	}
	fetchOtherPokemons();
};

// Method to fetch pokemon data later
async function fetchOtherPokemons() {
	for (let i = 51; i <= pokemons_number; i++) {
		await getPokemon(i);
	}
	filterSelection('');
};

// Method to generate Html for dropdown
function createDropdown(values, container, origin) {
	for (let i = 0; i < values.length; i++) {
		const typeEl = document.createElement('li');
		const pokeInnerHTML = `<input type="checkbox" value="${values[i].name}" onclick="checkChange(this,'${origin}')">${titleCase(values[i].name)}`;
		typeEl.innerHTML = pokeInnerHTML;
		container.appendChild(typeEl);
	}
}

// Method to get individual pokemon's data
async function getPokemon(id) {
	const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
	try {
		const res = await fetch(url);
		const pokemon = await res.json();
		createPokemonCard(pokemon, 'initial');
	}
	catch (error) {
		console.log('There was an error!', error);
	}

};

//Method to get types dropdown values
async function getTypes() {
	const url = `https://pokeapi.co/api/v2/type`;
	fetch(url)
		.then(async response => {
			const resdata = await response.json();
			types = await resdata.results;
			createDropdown(types, types_container, 'type');
		})
		.catch(error => {
			console.error('There was an error!', error);
		});
}

// Method to get main gender category
async function getGendersCategories() {
	const url = `https://pokeapi.co/api/v2/gender`;
	fetch(url).then(async (res) => {
		let resdata = await res.json();
		genders = await resdata.results;
		createDropdown(genders, genders_container, 'gender');
	})
		.catch(error => {
			console.error('There was an error!', error);
		});
}

async function getStats() {
	const url = `https://pokeapi.co/api/v2/stat`;
	fetch(url).then(async (res) => {
		let resdata = await res.json();
		stats = await resdata.results;
		createDropdown(stats, stats_container, 'stats');
	})
		.catch(error => {
			console.error('There was an error!', error);
		});
}

async function createPokemonCard(pokemon, origin) {
	const pokemonEl = document.createElement('div');
	pokemonEl.classList.add('card');
	pokemonEl.classList.add('show');
	pokemonEl.setAttribute("id", pokemon.id);
const stats_container = document.getElementById('status-list');
	pokemonEl.setAttribute("title", pokemon.name);
	pokemonEl.setAttribute("tabindex", "0");
	pokemonEl.setAttribute("data-bs-toggle", "modal");
	pokemonEl.setAttribute("data-bs-target", "#staticBackdrop");
	pokemonEl.setAttribute("onclick", "cardClicked(this)");

	const poke_types = pokemon.types.map(type => type.type.name);
	const type = main_types.find(type => poke_types.indexOf(type) > -1);
	const name = titleCase(pokemon.name);
	const color1 = colors[type];
	let color2 = colors[type];

	if (poke_types.length > 1) {
		color2 = colors[poke_types[1]];
	}
	if (origin != 'filter') {
		const pokemonWithGender = Object.assign(pokemon, { gender: getPokemonGender(pokemon.name) })
		pokemon_list.push(pokemonWithGender);
	}
	pokemonEl.style.background = 'linear-gradient(to bottom, ' + color1 + ' 0%, ' + color2 + ' 100%)'
	const pokeInnerHTML = `
                <img class="card-image" height="130px" width="134px" src="${pokemon.sprites.other.dream_world['front_default']}" alt="${name}" aria-hidden="true"/>
                <div class="card-body">
                <span class="card-title">${name}</span>
                <p class="card-subtitle">${pokemon.id.toString().padStart(3, '0')}</p>
                </div>
    `;

	pokemonEl.innerHTML = pokeInnerHTML;

	poke_container.appendChild(pokemonEl);
}

function search(data) {
	search_word = data.value;
	filterSelection(data.value);
}

// Method to handle filter selection 
function checkChange(event, origin) {
	let jsPokedexTypeBtn = document.getElementById('js-pokedex-type-btn');
	let jsPokedexGenderBtn = document.getElementById('js-pokedex-gender-btn');
	let filtered_list = pokemon_list;

	// to manage selections from dropdown
	if (origin == 'type') {
		if (event.checked) {
			type_filter.push(event.value);
		} else {
			const index = type_filter.indexOf(event.value);
			if (index > -1) {
				type_filter.splice(index, 1);
			}
		}
	} else if (origin == 'gender') {
		if (event.checked) {
			gender_filter.push(event.value);
		} else {
			const index = gender_filter.indexOf(event.value);
			if (index > -1) {
				gender_filter.splice(index, 1);
			}
		}
	}
	// to filter data based on type selection
	if (type_filter.length != 0) {
		if (type_filter.length > 1) {
			jsPokedexTypeBtn.innerHTML = titleCase(type_filter[0]) + ' + ' + (type_filter.length - 1) + ' More';
		} else {
			jsPokedexTypeBtn.innerHTML = titleCase(type_filter[0]);
		}

		filtered_list = pokemon_list.filter(word => {
			let poke_types = word.types.map(type => type.type.name);

			for (let i = 0; i < type_filter.length; i++) {
				if (poke_types.indexOf(type_filter[i]) > -1) {
					return true;
				}
			}
		})
	} else {
		jsPokedexTypeBtn.innerHTML = 'Select Type';
	}
	// to filter data based on gender selection
	if (gender_filter.length != 0) {
		if (gender_filter.length > 1) {
			jsPokedexGenderBtn.innerHTML = titleCase(gender_filter[0]) + ' + ' + (gender_filter.length - 1) + ' More';
		} else {
			jsPokedexGenderBtn.innerHTML = titleCase(gender_filter[0]);
		}
		filtered_list = filtered_list.filter(word => {
			let poke_gender = word.gender;
			console.log(poke_gender);
			for (let i = 0; i < gender_filter.length; i++) {
				if (poke_gender.indexOf(gender_filter[i]) > -1) {
					return true;
				}
			}
		})
	} else {
		jsPokedexGenderBtn.innerHTML = 'Select Gender';
	}

	poke_container.innerHTML = "";
	for (let i = 0; i < filtered_list.length; i++) {
		createPokemonCard(filtered_list[i], 'filter');
	}
	if (poke_container.innerHTML == '') {
		poke_container.innerHTML = '<div>No records Found</div>';
	}
	filterSelection(search_word);
}

// Card click event to load detail page pop up
async function cardClicked(event) {


	let abilities;
	const url = `https://pokeapi.co/api/v2/pokemon/` + event.id;
	const response = await fetch(url);
	var pokemonData = await response.json();
	let pokemonGenderContainer = document.getElementById('pokemon-gender')
	let selectedPokemon = pokemon_list.filter(data => data.id == event.id); // find selected pokemon
	let selectedPokemonGender = '';
	selectedPokemon[0].gender.forEach(element => {
		if (selectedPokemonGender) {
			selectedPokemonGender = selectedPokemonGender + ', ' + element;
		} else {
			selectedPokemonGender = element;
		}
	});
	pokemonGenderContainer.innerHTML = selectedPokemonGender;

	let pokemonTypeContainer = document.getElementById('pokemon-types');
	let pokemonHeightContainer = document.getElementById('pokemon-height');
	let pokemonWeightContainer = document.getElementById('pokemon-weight');
	let abilitiesContainer = document.getElementById('abilities');
	let pokemonNameContainer = document.getElementById('pokemon-name');
	let pokemonIdContainer = document.getElementById('pokemon-id');

	pokemonNameContainer.innerHTML = pokemonData.name.toUpperCase();
	pokemonIdContainer.innerHTML = pokemonData.id.toString().padStart(3, '0')
	pokemonHeightContainer.innerHTML = pokemonData.height;
	pokemonWeightContainer.innerHTML = pokemonData.weight + ' kg';
	let pokemoneTypeInnerHtml = '';
	for (let i = 0; i < pokemonData.types.length; i++) {
		let color = colors[pokemonData.types[i].type.name];
		pokemoneTypeInnerHtml = pokemoneTypeInnerHtml + '<span class="badge" style="background-color:' + color + ';">' + titleCase(pokemonData.types[i].type.name) + '</span>';
	}
	pokemonTypeContainer.innerHTML = pokemoneTypeInnerHtml;
	for (let i = 0; i < pokemonData.abilities.length; i++) {
		if (abilities) {
			abilities = abilities + ', ' + titleCase(pokemonData.abilities[i].ability.name);
		} else {
			abilities = titleCase(pokemonData.abilities[i].ability.name);
		}
	}
	abilitiesContainer.innerHTML = abilities;
	generateDescription(pokemonData.id);
	generateImage(pokemonData, pokemonData.sprites.other.dream_world.front_default)
	generateWeakAgainst(pokemonData.id);
}

// to generate image with URL and color combination
function generateImage(pokemonData, src) {
	const poke_types = pokemonData.types.map(type => type.type.name);
	const type = main_types.find(type => poke_types.indexOf(type) > -1);
	const pokemonEl = document.createElement('div');
	pokemonEl.classList.add('detail-card');

	const color1 = colors[type];
	let color2 = colors[type];

	if (poke_types.length > 1) {
		color2 = colors[poke_types[1]];
	}
	pokemonEl.style.background = 'linear-gradient(to bottom, ' + color1 + ' 0%, ' + color2 + ' 100%)'
	const pokeInnerHTML = `
                <img class="card-image" height="144px" width="150px" src="${src}" alt="${pokemonData.name}"/>
    `;

	pokemonEl.innerHTML = pokeInnerHTML;
	detail_card_container.innerHTML = "";
	detail_card_container.appendChild(pokemonEl);
}

// to load pokemon details 
async function generateDescription(id) {
	const url = `https://pokeapi.co/api/v2/pokemon-species/` + id;
	const response = await fetch(url);
	var pokemonData = await response.json();
	let egg_groups_raw;
	let eggGroupContainer = document.getElementById('egg-groups');
	let descriptionContainer = document.getElementById('pokemon-detail');
	for (let i = 0; i < pokemonData.egg_groups.length; i++) {
		if (egg_groups_raw) {
			egg_groups_raw = egg_groups_raw + ', ' + titleCase(pokemonData.egg_groups[i].name);
		} else {
			egg_groups_raw = titleCase(pokemonData.egg_groups[i].name);
		}
	}
	eggGroupContainer.innerHTML = egg_groups_raw;
	let description = await getDescription(id);
	descriptionContainer.innerHTML = description.substr(0, 530) + '... <a href="#">read more</a>';
	;
}

// to load pokemon properties to display in detail page
async function generateWeakAgainst(id) {
	let pokemonWeakContainer = document.getElementById('pokemon-weak-against');

	const url = `https://pokeapi.co/api/v2/type/` + id;
	const response = await fetch(url);
	var pokemonData = await response.json();

	let pokemoneWeakInnerHtml = '';
	for (let i = 0; i < pokemonData.damage_relations.double_damage_from.length; i++) {
		console.log(pokemonData.damage_relations.double_damage_from[i].name)
		let color = colors[pokemonData.damage_relations.double_damage_from[i].name];
		pokemoneWeakInnerHtml = pokemoneWeakInnerHtml + '<span class="badge" style="background-color:' + color + ';">' + titleCase(pokemonData.damage_relations.double_damage_from[i].name) + '</span>';
	}
	pokemonWeakContainer.innerHTML = pokemoneWeakInnerHtml;
}

// to convert string in to title case
function titleCase(string) {
	return string[0].toUpperCase() + string.slice(1);
}

// to get the description of pokemon
async function getDescription(id) {
	let description = '';
	let flavorTextArray = [];
	let result = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
	result = await result.json();

	let flavorTextEntries = result.flavor_text_entries;
	let flavorTexts = flavorTextEntries.filter(desc => {
		if (desc.language.name === 'en') {
			flavorTextArray.push(desc.flavor_text.replace(/[\f\n]/gm, ' '));
			return true;
		}
		return false;
	});
	let uniqueTexts = [...new Set(flavorTextArray)];
	description = uniqueTexts.join(',').replaceAll(',', ' ');
	return description;
}

// Method to filter data as per search criteria
function filterSelection(c) {
	var x, i;
	x = document.getElementsByClassName("card");
	
	//if (c == "all") c = "";
	// Add the "show" class (display:block) to the filtered elements, and remove the "show" class from the elements that are not selected
	for (i = 0; i < x.length; i++) {
		w3RemoveClass(x[i], "show");
		if (c != '') {
			if (x[i].id.toString().padStart(3, '0').includes(c) || x[i].title.includes(c)) w3AddClass(x[i], "show");

		} else {
			w3AddClass(x[i], "show");
		}
	}
}

// Show filtered elements
function w3AddClass(element, name) {
	var i, arr1, arr2;
	arr1 = element.className.split(" ");
	arr2 = name.split(" ");
	for (i = 0; i < arr2.length; i++) {
		if (arr1.indexOf(arr2[i]) == -1) {
			element.className += " " + arr2[i];
		}
	}
}

// Hide elements that are not selected
function w3RemoveClass(element, name) {
	var i, arr1, arr2;
	arr1 = element.className.split(" ");
	arr2 = name.split(" ");
	for (i = 0; i < arr2.length; i++) {
		while (arr1.indexOf(arr2[i]) > -1) {
			arr1.splice(arr1.indexOf(arr2[i]), 1);
		}
	}
	element.className = arr1.join(" ");
}

function getPokemonGender(name) {
	let gender = [];
	if (femaleSpecies && femaleSpecies.includes(name)) {
		gender.push('Female');
	}
	if (maleSpecies && maleSpecies.includes(name)) {
		gender.push('Male');
	}
	if (genderlessSpecies && genderlessSpecies.includes(name)) {
		gender.push('Genderless');
	}
	return gender;
}


// API call to fetch the data 
async function getApiCall() {
	getAllGender();
	await getTypes();
	await getGendersCategories();
	await getStats();
	await fetchPokemons();
}

getApiCall();
