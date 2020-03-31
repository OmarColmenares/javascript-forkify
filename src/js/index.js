import Search from './models/Search';
import Recipe from './models/Recipe';

import * as searchView from './views/searchView'
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
        const goToPage = parseInt(btn.dataset.id, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

const controlRecipe = async () => {
    // 1) get hash from window
    const id = window.location.hash.replace('#', '');
    if(id){
        try{
            state.recipe = new Recipe(id);

            await state.recipe.getRecipe()

            state.recipe.calcTime();

            state.recipe.calcServings();

            console.log(state.recipe);
        }catch(err){
            alert('Something was wrong :(')
        }
    }
}
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));
