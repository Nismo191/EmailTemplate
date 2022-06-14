// Vars
let fontSize = 3
let elements = []
var db

window.addEventListener('load', function () {
  // Elements
  elements = document.querySelectorAll(".btn");

  // Event
  elements.forEach((element) => {
    element.addEventListener("click", () => {
      let command = element.dataset["element"];

      console.log(command)

      if (command == "createLink" || command == "insertImage") {
        let url = prompt("Enter the link here:", "http://");
        document.execCommand(command, false, url);
      } else if (command == "intoHeader") {
        document.execCommand("formatBlock", false, "<h1>");
      } else if (command == "intoParagraph") {
        document.execCommand("formatBlock", false, "<p>");
      } else if (command == "fontBig") {
        if(fontSize != 7){
          fontSize++
        }
        document.execCommand("fontSize", false, fontSize);
      } else if (command == "fontSmall") {
        if(fontSize != 1){
          fontSize--
        }
        document.execCommand("fontSize", false, fontSize);
      } else {
        document.execCommand(command, false, null);
      }
    });
  });

  db = createDB()
  showDb()
})


function postContent(){
  let subject = document.getElementById("subject").innerHTML;
  let content = document.getElementById("content").innerHTML;

  // Post the content to the server
  fetch('https://elastic.snaplogic.com/api/1/rest/slsched/feed/Roadchef_dev/Sandbox_BL/EmailTemplateEditor/ProcessData%20Task?bearer_token=123', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "subject": subject,
      "content": content
    })
  }).then(function(response) {
    return response.json();
  });
}

function createDB(){
  var db = new PouchDB('email_templates');
  console.log(db)
  return db;
}

function addToDb(){
  var template = {
    _id: new Date().toISOString(),
    title: document.getElementById("subject").innerHTML,
    content: document.getElementById("content").innerHTML
  }
  db.put(template, function callback(err, result) {
    if (!err){
      console.log("Saved")
    }
  });
  showDb()
}

function deleteItem(item){
  console.log("Delete")
  console.log(item)
  db.remove(item.split(",")[0], item.split(",")[1], function callback(err, result) {
    if (!err){
      console.log("Deleted")
    }
  });
  showDb()
}

function updateItem(item){
  db.get(item.split(",")[0], function(err, doc) {
    console.log(doc)
    return db.put({
      _id: doc._id,
      _rev: doc._rev,
      title: document.getElementById("subject").innerHTML,
      content: document.getElementById("content").innerHTML
    });
  }).then(function(response) {
    console.log(response)
    showDb()
  });
}

function loadItem(item){
  console.log("Load")
  console.log(item)
  db.get(item.split(",")[0], {rev: item.split(",")[1]}, function(err, doc) {
    document.getElementById("subject").innerHTML = doc.title;
    document.getElementById("content").innerHTML = doc.content;
  })
}

function showDb(){
  db.allDocs({include_docs: true}, function(err, docs) {
    console.log(docs)
    var ul = document.getElementById("saved")
    ul.innerHTML = ""
    docs.rows.forEach(function(template) {
      ul.appendChild(createListItem(template.doc));
    })
  });
}

function createListItem(item){
  var li = document.createElement("li");
  li.setAttribute("id", "li_" + item._id);
  li.innerHTML = "<p>"+item.title+"</p>"
  li.innerHTML += "<button class='button' onclick='deleteItem(\"" + item._id + "," + item._rev + "\")'>Delete</button>";
  li.innerHTML += "<button class='button' onclick='updateItem(\"" + item._id + "," + item._rev + "\")'>Update</button>";
  li.innerHTML += "<button class='button' onclick='loadItem(\"" + item._id + "," + item._rev + "\")'>Load</button>";
  return li;
}