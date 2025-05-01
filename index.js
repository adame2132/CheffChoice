// require express
// requiew your models
// requiew mongoose
const express = require('express')
const session = require('express-session')
const model= require('./model') 
const { default: mongoose } = require('mongoose')
const cors = require('cors')
// const toId = mongoose.Types.ObjectId
const app = express()
app.use(express.urlencoded({extended: false}))
app.use(cors())
app.use(express.static("public"))
app.use(session({
    secret: "somesecrete",
    saveUninitialized: true,
    resave: false
}))
// my middle ware for users roles
//middle ware is something that runs at between the time the server reccives the request and sends  the response
//middle ware runs in order of when you define it
// function authorizeRequest(adminOnly) {
//     return function(request, response, next) {
//         if (request.session && request.session.userId) { 
//             model.User.findOne({ _id: request.session.userId}).then(function (user) {
//                 if (user && (!adminOnly || user.role))  {
//                     next()
//                 } else {
//                     response.status(401).send("Not Authenticated")
//                 }
//             })
            
//         } else {
//             response.status(401).send("Not Authenticated")
//         }
//     }
// }
function authorizeLoggedIn(){
    return function(request, response, next){
        if(request.session && request.session.userId){
            next()
        }
        else{
            response.status(401).send("Not Authorized")
        }
    }
}



// make own middleware for authorization, more out of this 

// requests for other users, segregating users
// function authorizeRequestNonAdmin(request, response, next) {
//     authorizeRequest(false, request, response, next)
        
// }

// //requests for admins
// function authorizeRequestAdmin(request, response, next) {
//    authorizeRequest(true, request, response, next)
// }


app.get("/dishes", authorizeLoggedIn(), function(request, response){
    // var filter = {}
    // if (request.query.userId) {
    //     filter.user = request.query.userId
    // }
    //put filler in find 
    console.log("params are : ", request.query.user)
    if(request.query.user){
        model.Dish.find({user: request.query.user}).populate('ingredients').then((dishes) => {
            response.status(200).json(dishes)
        })
    }
    else{
        model.Dish.find().populate('ingredients').then((dishes) => {
            response.status(200).json(dishes)
        })
    }
    
})

app.get("/dishes/:dish_id", authorizeLoggedIn(), function(request, response){
    const id = request.params.dish_id
    model.Dish.findOne({_id: id}).populate("ingredients").then((dish) =>{
        response.status(200).json(dish)
    })
})

app.get("/ingredients",authorizeLoggedIn(), function(request, response){
    model.Ingredient.find().then((ingredients) => {
        response.status(200).json(ingredients)
    })
})

// app.get("/preps/:prep_id", async (request, response) => {
//     const id = request.params.prep_id;
//     const prep = await model.Prep.findOne({ _id: id }).populate("meals");
//     response.json(prep);
// });

// app.post("/preps/:dish_id", async function(request, response){
//     console.log("request body: ", request.body)
//     const month = request.body.month
//     const day = request.body.day
//     console.log(day, "of ", month)
//     const bundle = {month, day}
//     const prep = await model.Prep.findOne(bundle)
//     if(!prep){
//         const bundle = {month, day}
//         const newPrep = model.Prep({
//             month: request.body.month,
//             day: request.body.day,
//             meals:[dish_id]
//         })
//     }
// })
app.post("/dishes", authorizeLoggedIn(), async function(request, response){
    try{
        console.log("request body: ", request.body)
        creater = await model.User.findById(request.session.userId);
        console.log(creater);
        const newDish = model.Dish({
            _id: new mongoose.Types.ObjectId(),
            title: request.body.title,
            calories: parseInt(request.body.calories),
            desc: request.body.desc,
            user: creater
        })
        await newDish.save()
        response.status(201).send("created")
    }catch(error){
        if(error.errors){
            var errorMessages = {}
            for(var fieldName in error.errors){
                errorMessages[fieldName] = error.errors[fieldName].message
            }
            return response.status(422).json(errorMessages) // 422 but 500 because we will take responsabilty.
        }
        else{
            response.status(500).send("Unkown error creating Dish.")
        }
    }
})

app.post("/ingredients/:dish", authorizeLoggedIn(), async function(request, response){
    console.log("request body: ", request.body)
    const newIngredient = model.Ingredient({
        _id: new mongoose.Types.ObjectId(),
        name: request.body.name,
        qty: parseInt(request.body.qty),
        unit: request.body.unit
    })
    try{
        await newIngredient.save()
        await model.Dish.findByIdAndUpdate(request.params.dish, { $push: { ingredients: newIngredient._id } })
        response.status(201).send("created")
    }catch(error){
        if(error.errors){
            var errorMessages = {}
            for(var fieldName in error.errors){
                errorMessages[fieldName] = error.errors[fieldName].message
            }
            return response.status(422).json(errorMessages)
        }
        else{
            return response.status(500).send("Unkown error when creating Ingredient")
        }
    }
})

app.delete("/dishes/:dish", authorizeLoggedIn(), async function(request, response){ // middelware to check session_id for user matches the user id of the dish 
    const id = request.params.dish;
    console.log("dish id is: ", id)
    const dish = await model.Dish.findById(id)
    console.log("deleter has to be:", dish.user)
    console.log("this is the person deleting rn: ", request.session.userId)
    if(dish){
        if(dish.user.toString() === request.session.userId){
            if(dish.ingredients){
                for(let i of dish.ingredients){
                    // console.log("this is the ingredient: ", model.Ingredient.findById(i._id))
                    await model.Ingredient.findByIdAndDelete(i._id);
                }
            }
            await model.Dish.findByIdAndDelete(id);
            return response.status(204).send("delted right ")
        }
        return response.status(401).send("Not Authorized")
    }
    return response.status(404).send("Not found")
})

app.delete("/ingredients/:ingredient_id", authorizeLoggedIn(), async function (request, response){ 
    const id = request.params.ingredient_id
    const found = await model.Ingredient.findById(id)
    console.log("this is the ingredient found: ", found)
    if(found){
        await model.Dish.findByIdAndDelete(found.dish_id, {$pull:{ ingredients: id}})
        await model.Dish
        await model.Ingredient.deleteOne({_id: id})
        return response.status(204).send("ingredent was deleted")
    }
    return response.status(404).send("ingredent was not found")
})

app.put("/dishes/:dish_id", authorizeLoggedIn(), async function(request, response){
    const id = request.params.dish_id
    const dish = await model.Dish.findById(id)
    console.log("function was called")
    try{
        if(dish){
            if(dish.user.toString() === request.session.userId){
                dish.title = request.body.title
                dish.calories = request.body.calories
                dish.desc = request.body.desc
                await dish.save()
                return response.status(201).send("dish was updated")
            }
            return response.status(401).send("Not Authorized")
        }
        return response.status(404).send("Dish was not found")
    }catch(error){
        if(error.errors){
            var errorMessages = {}
            for(var fieldName in error.errors){
                errorMessages[fieldName] = error.errors[fieldName].message
            }
            return response.status(422).json(errorMessages)
        }
        else{
            return response.status(500).send("Unknown error attempting to update Dish.")
        }
    }
})

app.get("/users", authorizeLoggedIn(), function(request, response){ // for admin use 
    model.User.find().then((users) => {
        response.json(users)
    })
})
app.post("/users",async function(request, response){
    console.log("request body is: ", request.body)
    //check if the email is unique if it is create the new user else
    // return a 400 status code saying that the email is already existing
    try{
        const existingUser = await model.User.findOne({email: request.body.email})
        if(existingUser){
            console.log("email already tied with a user: ", request.body.email)
            return response.status(400).json({error: "Email already used."})
        }
        const newUser = new model.User({
            fname: request.body.fname,
            lname: request.body.lname,
            address: request.body.address,
            zip: request.body.zip,
            state: request.body.state,
            email: request.body.email,
        });
        //now encrypt the password
        try{
            await newUser.setEncryptedPassword(request.body.plainPass)
            await newUser.assignRole(request.body.email)
            await newUser.save()
            return response.status(201).send("Created")
        }catch(error){
            if(error.errors){
                var errorMessages = {}
                for(var feildName in error.errors){
                    errorMessages[feildName] = error.errors[feildName].message
                }
                return response.status(422).json(errorMessages)
            }
            else if(error.code == 11000){
                return response.status(422).json({email: "User with email already exists"})
            }
            else{
                return response.status(500).send("Unknown error creating User.")
            }
        }
    }catch(error){
        console.log("error saving user: ", error)
        return response.status(500).json({error: "Internal Server Error"})
    }
})
app.get("/sessions", async function(request, response){ 
    if(request.session && request.session.userId){
        var user = await model.User.findById(request.session.userId)
        console.log(user)
        if(user){
            return response.status(200).json(user)
        }
    }
    
})

app.post("/sessions", async function(request, response){
    console.log("email is: ", request.body.email)
    const user = await model.User.findOne({email: request.body.email})
    if(user){
        const match = await user.verifyPassword(request.body.plainPass)
        if(match){
            request.session.userId = user._id
            return response.status(201).send("Authenticated")
        }
        else{
            return response.status(401).send("Not Authenticated")
        }

    }
    else{
        return response.status(401).send("Not Authenticated")
    }

})

app.delete("/sessions", authorizeLoggedIn(),function(request, response){
    request.session.userId = null
    response.status(200).send("Logged out" )
})

app.listen(8080, function() {
    console.log("Server is running...");
})


