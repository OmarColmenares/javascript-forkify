import Search from './models/Search';
import Recipe from './models/Recipe';

import * as searchView from './views/searchView'
import * as recipeView from './views/recipeView'
import {elements, renderLoader, clearLoader} from './views/base'

const state =  {}

const controlSearch = async () => {
    // 1) Get query from view
    const query = searchView.getInput();
    console.log(query);
    if(query){
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results 
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        try{
            // 4) Search for recipes
            await state.search.getResults();
            
            // 5) Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        }catch{
            alert('Something was wrong with the search :(');
            clearLoader();
        }
    };
};

elements.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    controlSearch();
});
//document.querySelector('.results__pages').
elements.searchResPages.addEventListener('click', e => {
    let btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage = parseInt(btn.dataset.id);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

const controlRecipe = async () => {
    // 1) get hash from window
    const id = window.location.hash.replace('#', '');
    if (id) {
        // Prepare the UI
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //High Light Selected Item
        if( state.search) searchView.highLightSelected(id);

        //Create a new Recipe Object
        state.recipe = new Recipe(id);
        //Create recipe object
        try{
            //Get recipes and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //Calculing servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);

        }catch(err){
            alert('Something was wrong :( with the recipe');
            console.log(err);
        };
    };
};
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));
