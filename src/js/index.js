import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';

import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

const state =  {};
window.state = state;

/*SEARCH CONTROLLER*/
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
        };
    };
};

elements.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    let btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage = parseInt(btn.dataset.id);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

/*RECIPE CONTROLLER*/
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
            
            //Calculating servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
           
            //Render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );

        }catch(err){
            alert('Something was wrong :( with the recipe');
            console.log(err);
        };
    };
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/*LIST CONTROLLER*/
const controlList = () => {
    if (!state.list) state.list = new List();
    
    if (state.list.items.length === 0) {
        elements.shoppingBtn.style.display = 'block';
        state.recipe.ingredients.forEach(el => {
            const item = state.list.addItem(el.count, el.unit, el.ingredient);
            listView.renderItem(item);
        });
    }
};

const controlDeleteList = () => {
    elements.shoppingBtn.style.display = 'none';

    const ids = state.list.getIds();
    ids.forEach(el => {
        state.list.deleteItem(el);
        listView.deleteItem(el);
    });
};

/*LIKES CONTROLLER*/
const controlLikes = () => {
    if (!state.likes) state.likes = new Likes();

    const currentID = state.recipe.id;
    if ( !state.likes.isLiked(currentID) ){
        //Add like to the state
        const newLike = state.likes.addLike(
            state.recipe.id,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        //Toggle the like button
        likesView.toggleLikeBtn(true);
        //Add like to the UI like
        likesView.renderLike(newLike);
    } else {
        //remove like from the state
        state.likes.deleteLike(currentID);
        //Toggle the like button
        likesView.toggleLikeBtn(false);
        //remove like from UI like
        likesView.deleteLike(currentID);
    };
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes 
window.addEventListener('load', () => {
    state.likes = new Likes();
    //Restore likes
    state.likes.readStorage();
    //toggle likes menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    //render existing likes
    state.likes.likes.forEach(el => likesView.renderLike(el));

});
//elements.shopping
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //Delete
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        state.list.deleteItem(id);

        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count--value')) {
        const val = parseFloat(e.target.value);

        if (val >= 0) state.list.updateCount(id, val);
    }
});

document.querySelector('.shopping').addEventListener('click', e => {
    if (e.target.matches('.list__delete--btn, .list__delete--btn *')) {
        controlDeleteList();
    }
})

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

    //Shopping List
    if (e.target.matches('.recipe__btn--shoping, .recipe__btn--shoping *')){
        controlList();
    };

    //Likes
    if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLikes();
    };
});
