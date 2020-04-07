const express = require('express')
const bodyparse = require("body-parser")
const app = express()
const port = 3000
const mongoose = require('mongoose');
const _ = require('lodash');

app.set("view engine","ejs");
app.use(bodyparse.urlencoded({extended:true}));
app.use(express.static("css"));
mongoose.connect('mongodb+srv://mahyarmadad:Erfan1234@cluster0-shal3.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});


const item = new mongoose.Schema({
    name: {type:String,required: [true,"name is important!"]}});
const Task = mongoose.model('item', item);

var today = new Date();
var options = {weekday:"long",day:"numeric",month:"long"};
var day = today.toLocaleDateString("en-US",options);
task1 = new Task({name:"Welcome to your Todo List"});
task2 = new Task({name:"You can add Task buy typing it and hit the + Button"});
task3 = new Task({name:"<-- This guy will delete you complete task"});
task4 = new Task({name:"you can have your custom list , just put / and a unique name after it for example=/home"});
defaulttask = [task1,task2,task3,task4];

listschema = {
    name:String,
    items:[item]
};
const List = mongoose.model('List', listschema);


app.get('/', function (req, res){
    Task.find({}, function(err,founditem){
        if(founditem.length == 0){
            Task.insertMany(defaulttask,function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("successfully save to database");
                }
            });
        }
        res.render("list",{kindofday:day,taskitem:founditem,listtitle:"today"});
    });

}); 

app.get('/:Custemlistname', function (req, res){
    custname = _.capitalize(req.params.Custemlistname);
    List.findOne({name:custname},function(err, founditem){
        if(!err){
            if (!founditem) {

                list = new List({name:custname,items:defaulttask});
                list.save();
                res.redirect("/"+custname)
            }else{
                res.render("list",{listtitle:custname,taskitem:founditem.items,kindofday:day});
            }
        }
        }); 
});

app.post('/', function (req, res) {
    listitem = req.body.item;
    listname = req.body.list;
    const bodyitem = new Task({name:listitem});

    if (listname === "today" ) {
        bodyitem.save();
        res.redirect("/");
    }else{
        List.findOne({name:listname},function(err,foundlist){
            foundlist.items.push(bodyitem);
            foundlist.save();
            res.redirect("/"+listname);
        });
    }
});

app.post('/delete', function (req, res) {
    checkitem = req.body.checkbox
    listname = req.body.listname
    if(listname === "today"){
        Task.findByIdAndDelete(checkitem, function(err){
            if(err){
                console.log(err);
            }        
        });
        res.redirect("/");
    }else{
        List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkitem}}},function(err,foundlist){
            if(!err){
                res.redirect("/"+listname);
            }
        });
    }
});

app.listen(port, () => console.log(`Example app listening on port port!`))
