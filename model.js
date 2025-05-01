const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
mongoose.connect('mongodb+srv://hectorjadame213:Secybeast213@cluster0.7x0hikq.mongodb.net/dish?retryWrites=true&w=majority&appName=Cluster0');

const ingredientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    qty: {
        type: Number,
        required: [true, "qty is requied"]
    },
    unit: {
        type: String,
        required: true
    },
    // this means it will be an id that is a refreance to a dish 
    dish: {type:mongoose.Types.ObjectId, ref: 'Dish'}
});

const dishSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    calories: {
        type: Number,
        required: true 

    },
    desc: {
        type: String
    },
        // this will be a list of ids that are all refrances to a dish 
    ingredients: [{type: mongoose.Types.ObjectId, ref: 'Ingredient'}],
    user:{type:mongoose.Types.ObjectId, ref: 'User'}
});
// const prepSchema =  new mongoose.Schema({
//     month:{
//         type: String,
//         required: true,
//     },
//     day:{
//         type: Number,
//         required: true,
//     },
//     calories:{
//         type: Number
//     },
//     meals:[{type:mongoose.Types.ObjectId, ref: 'Dish'}],
// });

const UserSchema = new mongoose.Schema({
    fname:{
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    address:{
        type:String,
        required: true
    },
    zip:{
        type:String,
        required: true,
    },
    state:{
        type: String,
        required: true
    },
    card:{
        type: String
    },
    email: {
        type: String, 
        required: true,
        unique: true //not a mongoose validator

    },
    encripted_password: {
        type: String,
        required: true
    },
    // determind if the email starts with admin....
    role:{
        type: String,
        required: true
    },
    meals:[{type:mongoose.Types.ObjectId, ref: 'Dish'}]
},
{
    toJSON: {
        versionKey: false,
        transform(doc, ret){
            delete ret.encripted_password;
        }
    }
}
)
// this is creating the model for your schemas
const Dish = mongoose.model('Dish', dishSchema);
const Ingredient = mongoose.model('Ingredient', ingredientSchema);

// const Prep = mongoose.model('Prep', prepSchema);
// adding a function to my user schema. they belong to instances of your user
// can use for total calories. 
UserSchema.methods.setEncryptedPassword = function(plainPassword){
    // this is adding a that sets an encrypted plainPassword. that can be used ny the user schema
    // it gets feed a plain passwored and should encrypt it. 
    // we are creating a new promise to will owe us an encryoted password.
    // resolve is like .then promise is done. 
    // reject is like .catch error in the promise
    var promise = new Promise((resolve, reject) => {
        bcrypt.hash(plainPassword, 12).then(hash => {
            this.encripted_password = hash
            resolve();
        });
    });
    // this returns even while the return is empty later it gets filled
    return promise;
}
UserSchema.methods.verifyPassword = function(atempt){
    //verify attemted password to stored encripted passowrd 
    // create a new promise that will check the hashed passwords and compare them.
    var promise = new Promise((resolve, reject) =>{
        // the .then is using the result of the .compare method and setting it to result. 
        bcrypt.compare(atempt, this.encripted_password).then(result =>{
            resolve(result);
        })
    })
    return promise
}
UserSchema.methods.assignRole = function(email){
    var promise = new Promise((resolve, reject) => {
        var admin = false;
        if (email.slice(0, 5) === "admin") {
            admin = true;
        }
        if (admin) {
            this.role = "admin";
        } else {
            this.role = "User";
        }
        resolve();
    });
    
    return promise;
}

const User = mongoose.model("User", UserSchema)
// you can only export one thing, so you will make an object(dictionry) out of the two models and export that
module.exports = {
    Dish: Dish,
    Ingredient: Ingredient,
    // Prep: Prep,
    User: User,
};