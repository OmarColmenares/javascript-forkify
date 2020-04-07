import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';

import * as searchView from './views/searchView'
import * as recipeView from './views/recipeView'
import * as listView from './views/listView'
import {elements, renderLoader, clearLoader} from './views/base'

const state =  {}
window.state = state;
const controlSearch = async () => {
    // 1) Get query from view
    const query = searchView.getInput();
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

const controlList = () => {
    if (!state.list) state.list = new List();

        state.recipe.ingredients.forEach(el => {
            const item = state.list.addItem(el.count, el.unit, el.ingredient);
            listView.renderItem(item);
        });
};

elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //Delete
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        state.list.deleteItem(id);

        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count--value')) {
        const val = parseFloat(e.target.value);

        if (val >= 0) state.list.updateCount(id, val);
    };
});

//Handle Serving
elements.recipe.addEventListener('click', e => {
    //Decrease
    if (e.target.matches('.btn-decrease, .btn-decrease *')){
        
        if(state.recipe.servings > 1) { 
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredientes(state.recipe);
        };
    };

    //Increase
    if (e.target.matches('.btn-increase, .btn-increase *')){
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredientes(state.recipe);
    };

    if (e.target.matches('.recipe__btn--shoping, .recipe__btn--shoping *')){
        controlList()
    }
});
