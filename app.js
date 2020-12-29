// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public")); //express assumes all file are static except app.js and views file

app.set('view engine', 'ejs');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = new mongoose.Schema({
    task : String
});

const Item = mongoose.model('Item', itemSchema);


const defaultItem1 = new Item({
    task: 'Drink Water'
});

const defaultItem2 = new Item({
    task: 'Hit the + button to add new item'
});

const defaultItem3 = new Item({
    task: '<--- Hit this to delete an item'
});

const defaultItems = [defaultItem1,defaultItem2,defaultItem3];

const listSchema = new mongoose.Schema({
    names: String,
    items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

const date = require(__dirname +'/date.js');
let day = date();

app.listen(3000,function(){
    console.log("Server is running at port 3000.");
});

app.get('/',function(request,response){ 


    Item.find({}, function (err, foundItems) {
        
        if(foundItems.length===0){
            Item.insertMany(defaultItems, function(error) {
                if(error){
                    console.log(error);
                }
                else{
                    console.log("successfully saved dedaultItems array to Items Collection");
                }
                response.redirect('/');
            });
            
        }
        
        else {
                response.render('List-f', {ListTitle: day , ListOfItems : foundItems});
                
        }
    });

    
});


app.post('/',function(req,res){
    const userTask = req.body.newItem ;
    const listName = req.body.list;
   
    

    const newItem = new Item({
        task: userTask
    });

    if(listName===day){
        newItem.save(); // much shorter than Item.insertOne
        res.redirect('/');     
    }
    else{
        List.findOne({names: listName}, function(err, foundList){
            foundList.items.push(newItem);
            foundList.save();
            res.redirect('/'+listName);
        })
    }
    
})


app.get('/about' ,function (req,res) {
    res.render('about');
})

app.post('/delete', function(request,response){
    const checkboxItem = request.body.checkbox;     // value associated to that name element overrides.
    const listName = request.body.listName; 

    if(listName === day){
        Item.findByIdAndRemove(checkboxItem, function (err) {
            if(!err) {
                console.log("item successfully removed");
                response.redirect('/');
            } 
        })
    }
    else{
        List.findOneAndUpdate(
            {names : listName},
            {$pull : {items: {_id : checkboxItem}}},
            function (err,foundList) {
                if(!err) {response.redirect('/'+listName);}
            }
        )
    }
    

} )

app.get('/favicon.ico', (req, res) => res.status(204).end); 

//note next is used o remove direct request to favicon.ico or robot.txt
app.get("/:customListName" ,function (req,res,next) {

    if (req.params.customListName === "Robots.txt" || req.params.customListName === "Favicon.ico") {
        next();
    }

    else{   
        const customListName = _.capitalize(req.params.customListName) ;
        //console.log(customListName);
        List.findOne({names: customListName},function (err, foundList) {
            if(!err){
                if(!foundList)
                {
                     //Create a new list
                    
                
                     const list = new List({
                        names: customListName,
                        items: defaultItems
                        });
                   
                     list.save();
                     res.redirect('/' + customListName);
                    
                }
                else{
                   //show an existing list
                
                   res.render("List-f",    {ListTitle:foundList.names, ListOfItems:foundList.items})
                }
            }
        })

    }
    
    
})

