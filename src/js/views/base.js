export const elements = {
    searchForm: document.querySelector('.search'),
    searchInput: document.querySelector('.search__field'),
    resultsList: document.querySelector('.results__list'),
    searchRes: document.querySelector('.results'),
    searchResPages: document.querySelector('.results__pages'),
    recipe: document.querySelector('.recipe'),
    shopping: document.querySelector('.shopping__list'),
    likesMenu: document.querySelector('.likes__field'),
    likesList: document.querySelector('.likes__list'),
    shoppingBtn: document.querySelector('.list__delete--btn')
};

export const elementStrings = {
    loader: 'loader',
    searchError: 'search__error'
};

export const renderLoader = parent => {
    const loader = `
        <div class="${elementStrings.loader}">
            <svg>
                <use href="img/icons.svg#icon-cw"></use>
            </svg>
        </div>`;
    parent.insertAdjacentHTML('afterbegin', loader);
};

export const clearLoader = () => {
    const loader = document.querySelector(`.${elementStrings.loader}`);

    if(loader) loader.parentElement.removeChild(loader);
}
export const searchError = (query, parent) => {
    const markup = `
    <div class="search__error">
        <span class="search__error--message"> No recipes for "${query}" </span><br />
        <span class="search__error--message">Try another recipe</span>
    </div>`

    parent.insertAdjacentHTML('beforeend', markup);
}

export const clearSearchError = () => {
    const searchError = document.querySelector(`.${elementStrings.searchError}`);
    if(searchError) searchError.parentElement.removeChild(searchError);
}