const express = require("express");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(
  "mongodb+srv://is9678:ZHDtJpzrPxtHti33@cluster0.wkjoxs6.mongodb.net/todolistDB"
);

const listSchema = {
  name: String,
};
const customListScheme = {
  name: String,
  items: [listSchema],
};

const Item = mongoose.model("Item", listSchema);
const CustomList = mongoose.model("CustomList", customListScheme);

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  listTitle = date.getDate();
  Item.find()
    .then((items) => {
      res.render("list", { listTitle: listTitle, items: items });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/:customList", (req, res) => {
  const customListName = _.capitalize(req.params.customList);
  CustomList.findOne({ name: customListName })
    .then((found) => {
      if (!found) {
        const list = new CustomList({
          name: customListName,
          items: [],
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", { listTitle: customListName, items: found.items });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/", (req, res) => {
  let itemName = req.body.newItem;
  let listName = req.body.listTitle;

  const item = new Item({
    name: itemName,
  });

  if (listName === date.getDate()) {
    Item.insertMany([item]);
    res.redirect("/");
  } else {
    CustomList.findOne({ name: listName })
      .then((found) => {
        found.items.push(item);
        found.save();
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.post("/delete", (req, res) => {
  const itemId = req.body.itemId;
  let listName = req.body.customListTitle;
  if (listName === date.getDate()) {
    Item.deleteOne({ _id: itemId })
      .then(() => {
        console.log("delete succ");
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    CustomList.findOne({ name: listName })
      .then((customList) => {
        if (customList) {
          customList.items.pull({ _id: itemId });
          return customList.save();
        } else {
          throw new Error("Custom list not found");
        }
      })
      .then(() => {
        console.log("Item removed from custom list");
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.error(err);
      });
  }
});

app.listen(3000, () => {
  console.log("Server running at port 3000");
});
