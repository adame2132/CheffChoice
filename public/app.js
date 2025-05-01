Vue.createApp({
    data: function(){
        return{
            user:{},
            role:"",
            loggedIn: false,
            loginmodal: true,
            signupmodal: false,
            signupPage: false,
            loginPage:true, 
            currentPage: 'Recipeies',
            fname: "",
            lname: "",
            email: "",
            plainPass: "",
            confirmPass: "",
            attempt:"",
            address: "",
            zip: "",
            state:"", 
            title: "",
            calories: "", 
            desc: "",
            name: "",
            qty: "",
            unit:"",
            userRecipes: [],
            recipies: [],
            ingredients: [],
            shoppingModal: false,
            viewRecipeMoadal:false,
            addBtnModal: false,
            blur: false,
            showAdd: false,
            disableEdit: true,
            dish: {},
            daysInMonths: [],
            index: 0,
            monthsArray: ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"],
            day: 0,
            validate: [],
            states: [
                "Alabama", "Alaska", "Arizona", "Arkansas", "California",
                "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
                "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
                "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
                "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana",
                "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
                "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma",
                "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
                "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia",
                "Washington", "West Virginia", "Wisconsin", "Wyoming"
              ],
            search: ""
        };
    },
    methods:{
        getDay: function(month, day) {
            console.log("teh day selected is: ", day , "on: ", month);
        },
        nextMonth() {
            console.log("nextbtn was clicked");
            this.index = (this.index + 1) % 12;
        },
        prevMonth() {
            console.log("prevbtn was clicked");
            this.index = (this.index - 1 + 12) % 12;
        },
        calculateDaysInMonths() {
            const daysInMonths = [];
            for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
              const year = new Date().getFullYear();
              const month = monthIndex + 1;
              const totalDays = new Date(year, month, 0).getDate();
              const days = Array.from({ length: totalDays }, (_, i) => i + 1);
              daysInMonths.push(days);
            }
            this.daysInMonths = daysInMonths;
          },
        loadRecipies: function(){
            fetch("/dishes").then((response) => {
                if(response.status === 200){
                    response.json().then((recipiesFromServer) => {
                        console.log("recipe data recived: ", recipiesFromServer);
                        this.recipies = recipiesFromServer;
                    })
                }
            })
        },
        loadRecipe: function(id){
            fetch("/dishes/" + id).then((response) => {
                if(response.status == 200){
                    response.json().then((dishFromServer) =>{
                        console.log("dish retrived: ", dishFromServer);
                        this.dish = dishFromServer;
                    })
                }
            })
        },
        // searchRecipes: function(){
        //     console.log("search btn was clicked with: ", this.search);
        //     var filter = {filter: this.search};
        //     var filter = new URLSearchParams(filter);
        //     fetch("/dishes?" + filter).then((response) =>{
        //         if(response.status == 200){
        //             response.json().then((dishesFromServer)=>{
        //                 console.log
        //             })
        //         }
        //     })
        // },
        getUserRecipes: function(){
            console.log(this.user);
            console.log(this.user._id);
            var filter = {user: this.user._id};
            var filter = new URLSearchParams(filter);
            fetch("/dishes?" + filter).then((response) => {
                if(response.status == 200){
                    response.json().then((dishsFromServer) =>{
                        console.log("user dishes retrived: ", dishsFromServer);
                        this.userRecipes = dishsFromServer;
                    })
                }
            })
        },
        loadIngredients:function(){
            fetch("/ingredients").then((response) => {
                if(response.status === 200){
                    response.json().then((ingredientsFromServer) => {
                        console.log("ingredient data recived: ", ingredientsFromServer);
                        this.ingredients = ingredientsFromServer;
                    })
                }
            })
        },
        createRecipe: function(){
            console.log("Create recipe btn clicked");
            this.validate = [];
            if (this.title === "") {
                this.validate.push("Recipe Name is required");
            }
            if (this.calories === "") {
                this.validate.push("Calories Are required");
            }
            if (isNaN(this.calories)){
                this.validate.push("Calories must be a number");
            }
            if (this.validate.length > 0) {
                console.log("Validation errors:", this.validate);
            }else{
                var data = 'title=' + encodeURIComponent(this.title);
            data += '&calories=' + encodeURIComponent(this.calories);
            data += '&desc=' + encodeURIComponent("");
            console.log("data being sent is: ", data);
            fetch("/dishes",{
                method: "POST",
                body:data,
                headers:{
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then((response)=>{
                if(response.status === 201){
                    console.log("recipe created");
                    this.title = "";
                    this.calories = "";
                    this.closeAddBtnModal();
                    this.reloadData();
                    this.getUserRecipes();
                }
            })
            } 

        },
        createUser: function(){
            console.log("register Btn was clicked");
            console.log(this.fname, " " , this.lname, " ", this.address, " ", this.zip, " ", this.state, " ", this.plainPass, " ", this.confirmPass);
            this.validate = [];
            if(this.fname === ""){
                this.validate.push("First Name Required");
            }
            if(this.lname === ""){
                this.validate.push("Last Name Required");
            }
            if(this.address === ""){
                this.validate.push("Street Address Required");
            }
            if(this.zip === ""){
                this.validate.push("Zip Code Required");
            }
            if(this.state === ""){
                this.validate.push("State Required");
            }
            if(this.email === ""){
                this.validate.push("Email Required")
            }
            if(this.email != "" && !this.email.includes('@')){
                this.validate.push("Email Requires a @")
            }
            if(this.plainPass === ""){
                  this.validate.push("Password Required")
            }
            if(this.confirmPass === ""){
                this.validate.push("Please Confirm Password")
            }
            if(this.plainPass != "" && this.plainPass != this.confirmPass){
                this.validate.push("Please Confirm Password correctly")
            }
            if(this.validate.length > 0){
                console.log("errors are:", this.validate);
            }
            else{
                var data = "fname=" + encodeURIComponent(this.fname);
                data += "&lname=" + encodeURIComponent(this.lname);
                data += "&address=" + encodeURIComponent(this.address);
                data += "&zip=" + encodeURIComponent(this.zip);
                data += "&state=" + encodeURIComponent(this.state);
                data += "&email=" + encodeURIComponent(this.email);
                data += "&plainPass=" + encodeURIComponent(this.plainPass);
                console.log("data being sent to server: ", data);
                fetch("/users", {
                    method: "POST",
                    body: data,
                    headers:{
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }).then((response) => {
                    if(response.status === 201){
                        console.log("created");
                        this.fname = "";
                        this.lname = "";
                        this.address = "";
                        this.zip = "";
                        this.confirmPass = "";
                        this.attempt = this.plainPass
                        this.plainPass = "";
                        this.createSession();

                    }
                })
            }
        },
        createSession: function(){
            this.validate = []
            console.log("login btn was clicked");
            console.log("email for login is: ", this.email);
            console.log("plain pass attempt is: ", this.attempt);
            if(this.email === ""){
                this.validate.push("Email is Required");
            }
            if (this.email != "" && !this.email.includes("@")) {
                this.validate.push("Email must contain a @");
            }
            if(this.attempt == ""){
                this.validate.push("Password is Required");
            }
            if(this.validate.length > 0){
                console.log("Validation Errors: ", this.validate);
            }
            else{
                var data = 'email=' + encodeURIComponent(this.email);
                data += '&plainPass=' + encodeURIComponent(this.attempt);
                fetch("/sessions", {
                    method:"POST",
                    body: data,
                    headers:{
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }).then((response)=>{
                    if(response.status === 201){
                        console.log("session created");
                        this.email = "";
                        this.attempt = "";
                        this.validate = [];
                        this.loggedIn = true;
                        this.getSesions();
                        this.reloadData();
                        this.calculateDaysInMonths();
                    }
                    else if(response.status === 401){
                        this.validate.push("Bad Credentials. Please Check email and password.");
                    }
                })
            }
        },
        createIngredient: function(rId) {
            console.log("create Ingredient btn was pressed");
            this.validate = [];
            if (this.name === "") {
                this.validate.push("Ingredient name is required");
            }
            if (this.qty === "") {
                this.validate.push("Ingredient quantity is required");
            }
            if (isNaN(this.qty)){
                this.validate.push("Ingredient quantity must be a number");
            }
            if (this.unit ===""){
                this.validate.push("Ingredient unit is required");
            }
            if (this.validate.length > 0) {
                console.log("Validation errors:", this.validate);
            }else{
                var data = "name=" + encodeURIComponent(this.name);
                data += "&qty=" + encodeURIComponent(this.qty);
                data += "&unit=" + encodeURIComponent(this.unit);
                fetch("/ingredients/" + rId, {
                    method: "POST",
                    body: data,
                    headers:{
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }).then((response)=>{
                    if(response.status === 201){
                        console.log("ingrediant was added");
                        this.name = "";
                        this.qty = "";
                        this.unit = "";
                        this.showAdd = false;
                        this.loadRecipe(rId);
                    }
                })  
            }
        },
        Logout: function(){
            console.log("log out btn was clicked")
            fetch("/sessions", {
                method:"DELETE"
            }).then((response) => {
                if(response.status === 200){
                    console.log("Logged out")
                    this.loggedIn = false;
                    this.user = {};
                }
            })
        },
        deleteIngredient: function(id){
            console.log("deletebtn for items was clicked");
            console.log("item id being delted is: ", id);
            fetch("/ingredients/" + id,{
                method:"DELETE"
            }).then((response)=>{
                console.log(response.status);
                if(response.status === 204){
                    console.log("Item deleted");
                    this.openShopingModal();
                }
            })
        },
        deleteDish: function(dish_id){
            console.log("deleteBtn was clicked");
            console.log("this is the id: ", dish_id);
            fetch("/dishes/" + dish_id,{
                method:"DELETE"
            }).then((response) =>{
                if(response.status === 204){
                    console.log("delete succesful");
                    this.loadRecipies();
                    this.getUserRecipes();
                }
            })

        },
        updateDish:function(dish_id){
            console.log("Save Btn was clicked")
            this.disableEdit = true;
            var data = 'title=' + encodeURIComponent(this.dish.title);
            data += '&calories=' + encodeURIComponent(this.dish.calories);
            console.log(this.dish.desc);
            data += '&desc=' + encodeURIComponent(this.dish.desc);
            console.log("data being sent is: ", data);
            fetch("/dishes/" + dish_id,{
                method: "PUT",
                body:data,
                headers:{
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then((response)=>{
                if(response.status === 201){
                    console.log("recipe updated");
                    // this.loadRecipe(rId);
                }
            })
        },
        openShopingModal: function(){
            this.shoppingModal = true;
            this.blur = true;
            this.loadIngredients();
        },
        closeShoppingModal: function(){
            this.shoppingModal = false;
            this.blur = false;
        },
        openViewRecipeModal: function(){
            this.viewRecipeMoadal = true;
            this.blur = true;
        },
        closeViewRecipeModal: function(){
            this.viewRecipeMoadal = false;
            this.blur = false;
            this.disableEdit = true;
            this.validate = [];
        },
        openAddBtnModal: function(){
            this.addBtnModal = true;
            this.blur = true;
        },
        closeAddBtnModal: function(){
            this.addBtnModal = false;
            this.blur = false;
            this.validate = [];

        },
        showAddInput: function(){
            this.showAdd = !this.showAdd;
        },
        openAndLoad: function(id){
            this.openViewRecipeModal();
            this.loadRecipe(id);
            this.showAdd = false;
        },
        reloadData: function(){
            this.loadRecipies();
            this.loadIngredients();
            console.log("data was reloaded");
        },
        showSignup: function(){
            this.loginmodal = false;
            this.signupmodal = true;
            this.validate = [];

        },
        showLogin: function(){
            this.loginmodal = true;
            this.signupmodal = false;
            this.validate = [];
        },
        getSesions: function(){
            fetch("/sessions").then((response) => {
                if(response.status == 200){
                    response.json().then((userFromServer) =>{
                        console.log("credentials are:  ", userFromServer);
                        if(userFromServer){
                            this.loggedIn = true;
                            this.user = userFromServer;
                            console.log(this.user._id);
                            this.getUserRecipes();
                        }
                        else{
                            this.loggedIn = false; 
                        }
                    })
                }
            })
        }
    },
    created: function(){
        this.getSesions();
        this.reloadData();
        this.calculateDaysInMonths();
    }

}).mount("#app");