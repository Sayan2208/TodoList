const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine','ejs');

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({name: "Welcome to your todolist!"});
const item2 = new Item({name: "Hit the + button to add a new item."});
const item3 = new Item({name: "<-- Hit this to delete an item."});
const defaultItems = [item1, item2, item3];


const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});
const List = mongoose.model("List", listSchema);



app.get("/", (req,res)=>{

    Item.find({})
    .then((foundItems)=>{ //foundItems here is an array of objects.
        if(foundItems.length === 0){
            Item.insertMany(defaultItems)
            .then(()=>{ console.log("Successfully saved to the database.") })
            .catch((err)=>{ console.log(err) });
            res.redirect("/");
        }else{
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        }})
    .catch((err)=>{ console.log(err) });
    
    // const day = date.getDate();
    // res.render("list", {listTitle: day, newListItems: items});
});

// app.get("/work", (req,res)=>{
//     res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/:customListName", (req,res)=>{
    const customListName = _.capitalize(req.params.customListName); //res.params is an object used to access route paramters.
    List.findOne({name: customListName})
        .then((foundList)=>{
            if(!foundList){ //If foundList doesn't exist (foundList is an object here)
                console.log("Doesn't exist!");
                //Create a new List.
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }else{
                //Show an existing List.
                console.log("Exists");
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items})

            }
        })
        .catch((err)=>{
            console.log(err);
        })

});

app.post("/", (req,res)=>{

    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    })

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName})
            .then((foundList)=>{
                foundList.items.push(item);
                foundList.save();
                res.redirect("/"+listName)
            })
            .catch((err)=>{
                console.log(err);
            })
    }    

    // const item = req.body.newItem;
    // if(req.body.list === "Work List"){
    //     workItems.push(item);
    //     res.redirect("/work");
    // }else{
    //     items.push(item);
    //     res.redirect("/");
    // }
});

app.post("/delete", (req,res)=>{
    // console.log(req.body);
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId)
        .then(()=>{ 
            console.log("Successfully deleted checked item");
            res.redirect("/"); 
        })
        .catch((err)=>{ console.log(err);} );
    }else{
         List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
            .then((foundList)=>{
                res.redirect("/"+listName);
            })
            .catch((err)=>{
                console.log(err);
            })
    }
    
})

app.listen(3000, ()=>{
    console.log("Server started on port 3000");
});