// use this API_URL to acess API
const API_URL = 'https://fsa-crud-2aa9294fe819.herokuapp.com/api/2309-FSA-ET-WEB-FT-SF/recipes.'

const state = {
  recipes: []
}
console.log(state)

const recipesList = document.querySelector('#recipes')
const addRecipeForm = document.querySelector('#addRecipe')
addRecipeForm.addEventListener("submit", addRecipe);


// a function to fetch the list of recipes
async function getRecipes(){
  // attempt to request the recipes
  try{
    // fetch is async. It returns a promise.
    // so we have to use await to assign the value of that promise to the `response` variable.
    const response = await fetch(API_URL);
    // turn the reponse into a JSON format
    // JSON = JavaScript Object Notation
    const json = await response.json();
    // update our state.recipes array to be the list from the response
    state.recipes = json;
  } catch(err){
    // if something goes wrong, console.log the error we receive
    console.log(err)
  }
}

// a function to render the list of recipes
function renderRecipes() {
  if (!state.recipes.length) {
    // if there aren't any recipes, tell the user
    // see note below about innerHTML
    recipesList.innerHTML = `<li>No recipes found.</li>`;
    return;
  }
  // use map to turn the array of JS objects representing recipes into an array of elements representing recipe cards to display in the browser
  const recipeCards = state.recipes.map((recipe) => {
    const recipeCard = document.createElement("li");
    recipeCard.classList.add("recipe");
    // you could also use document.createElement to manually create the h2, img, and p tags, and then modify them -- but this method of using `innerHTML` to set the recipeCard HTML is more concise
    recipeCard.innerHTML = `
      <h2>${recipe.title}</h2>
      <img src="${recipe.image_url}" alt="${recipe.title}" />
      <p>${recipe.instructions}</p>
    `;

  // We use createElement for the delete button because we need to attach an event listener.
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete Recipe";
    recipeCard.append(deleteButton);
    // the event listener attached to this recipe's delete button will call the deleteRecipe function with this specific recipe's id
    deleteButton.addEventListener("click", () => deleteRecipe(recipe.id));

    return recipeCard;
  });
  recipesList.replaceChildren(...recipeCards);
}

// fetch + render the recipes
async function render() {
  // get the recipes first -- we use the `await` keyword to make sure we have a response from the asynchronous getRecipes() function before we render recipes
  await getRecipes();
  renderRecipes();
}
render();

// a function to create new recipe
async function createRecipe(title, image_url, instructions) {
  try {
    // fetch takes the following parameters:
    // - the API URL for the request
    // - an object representing options you can set
    //
    // we have set the following options:
    // - use the POST method to send a POST request instead of the default GET
    // - send some specific headers telling the server about how the content is formatted
    // - a body, which is just a JSON string (so, a string representing a JS object) that includes the title, image_url, and instructions that we want to send to the server
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, image_url, instructions }),
    });
    // then we look at the response from that request to see if it succeeded
    const json = await response.json();

    // it's possible that a response is "successful" (in that it successfully returns a message) but also "unsuccessful" (in that the message was an error message from the server)
    if (json.error) {
      throw new Error(json.message);
    }

    // We have to re-fetch/re-render the data after we've modified the data in the database with our POST request
    render();
  } catch (error) {
    console.error(error);
  }
}

// this is our event handler, assigned in the .addEventListener call
// it handles responding to the event by calling createRecipe()
async function addRecipe(event) {
  event.preventDefault();
  // call our async function to create a recipe
  await createRecipe(
    // accessing the fields in this form using the addRecipeForm element we selected, rather than the previous pattern of using event.target.title.value
    // this is just a different way of doing things!
    addRecipeForm.title.value,
    addRecipeForm.image_url.value,
    addRecipeForm.instructions.value
  );
  // clear the inputs
  addRecipeForm.title.value = '';
  addRecipeForm.image_url.value = '';
  addRecipeForm.instructions.value = '';
}

// a function to update existing recipe
// NOT USED IN THE APP
// BUT HERE FOR REFERENCE
async function updateRecipe(id, title, image_url, instructions) {
  // Note that this is almost identical to `createRecipe`
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, image_url, instructions }),
    });
    const json = await response.json();
    if (json.error) {
      throw new Error(json.message);
    }
    render();
  } catch (error) {
    console.error(error);
  }
}

// a function to delete an existing recipe
async function deleteRecipe(id) {
  // Notice that we are using fetch to send an API request using the DELETE method to the API URL with /id after it, where `id` is the id of a specific recipe to delete.
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    // we're handling errors a bit differently here, because a successful deletion only sends back a status code.
    if (!response.ok) {
      throw new Error("Recipe could not be deleted.");
    }
    // re-render the list, since it has changed
    render();
  } catch (error) {
    console.log(error);
  }
}