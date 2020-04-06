import axios from 'axios';

export default class Recipe {
    constructor(id){
        this.id = id;
    };

    async getRecipe(){
        try{
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        }catch(err){
            alert('Something was wrong with the data');
            console.log(err);
        };
    };
    calcTime(){
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng/3);
        this.time = periods * 15;
    };
    calcServings(){
        this.servings = 4;
    };
    parseIngredients(){
        const unitLongs = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitShorts = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound']
        const units = [...unitShorts, 'kg', 'g']

        const newIngredients = this.ingredients.map(el => {
            // 1) Uniform units
            let ingredient = el.toLowerCase();
            unitLongs.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitShorts[i]);
            });

            // 2) Remove parenthesis
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // 3) Parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));
            
            let objIng
            if(unitIndex > -1){
                // There is a unit
                const arrCount = arrIng.slice(0, unitIndex);

                let count
                if (arrCount.length === 1) {
                   count = eval(arrIng[0].replace('-', '+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }
                
            }else if(parseInt(arrIng[0], 10)){
                //There isn't a unit, but 1st element is a number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit :'',
                    ingredient: arrIng.slice(1).join(' ')
                };

            }else if(unitIndex === -1){
                //there isn't a unit and NO number in 1st position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                };
            };
            return objIng;
        });

        this.ingredients = newIngredients;
    };

    updateServings(type) {
        //Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        //Ingredients
         this.ingredients.forEach((el, i) => {
            el.count *= (newServings / this.servings)
         });

        this.servings = newServings;
    };
};