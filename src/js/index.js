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
    searchView.clearResults();

    if(query){
        // 2) New search object and add to state
        state.search = new Search(query);
        // 3) Prepare UI for results
        searchView.clearResults();
        renderLoader(elements.searchRes);
        try {
            // 4) Search for recipes
            await state.search.getResults();
            // 5) Render results on UI
            searchView.clearSearchError();
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch {
            console.clear();
            clearLoader();
            searchView.searchError(query);
        };
    };
};

elements.searchForm.addEventListener('keyup', (e) => {
        e.preventDefault();
        clearLoader();
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
const controlList = ingredients => {
    if (!state.list) state.list = new List();
    
    if (state.list.items.length < 30) {
        elements.shoppingBtn.style.display = 'block';
        ingredients.forEach(el => {
            const item = state.list.addItem(el.count, el.unit, el.ingredient);
            listView.renderItem(item);
        });
        state.list.persistData();
    }
};

const controlDeleteList = () => {
    elements.shoppingBtn.style.display = 'none';

    const ids = state.list.getIds();
    ids.forEach(el => {
        state.list.deleteItem(el);
        listView.deleteItem(el);
    });
    state.list.persistData();
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
    state.list = new List();
    state.likes = new Likes();
    //Restore likes and list items
    state.likes.readStorage();
    state.list.readStorage();
    //toggle likes menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    //render existing likes
    state.likes.likes.forEach(el => likesView.renderLike(el));
    state.list.items.forEach(el => listView.renderItem(el));

    if (state.list.items.length > 0) {
        elements.shoppingBtn.style.display = 'block';
    } 
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
    state.list.persistData();
});

document.querySelector('.shopping').addEventListener('click', e => {
    if (e.target.matches('.list__delete--btn, .list__delete--btn *')) {
        controlDeleteList();
    }
})

elements.recipe.addEventListener('dblclick', e => {
    let item, obj;
    if(e.target.matches('.recipe__item, .recipe__item *')){
        item = e.target.closest('.recipe__item');
        obj = [
            {
                count: parseFloat(item.querySelector('.recipe__count').innerHTML),
                unit: item.querySelector('.recipe__unit').innerHTML,
                ingredient: item.querySelector('.recipe__ingredient--selected').innerHTML
            }
    ];
    controlList(obj);
    }
});

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
        controlList(state.recipe.ingredients);
    };

    //Likes
    if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLikes();
    };
});
