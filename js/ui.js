//materialize components
document.addEventListener("DOMContentLoaded", function() {
    var modals= document.querySelectorAll(".modal");
    M.Modal.init(modals);

    var items = document.querySelectorAll(".collapsible");
    M.Collapsible.init(items);

    var elems = document.querySelectorAll('#mobile-links');
    var instances = M.Sidenav.init(elems, {edge: "left"});
})
$(document).ready(function(){
    $('.tooltipped').tooltip();
    $('.modal').modal();
    // $('.sidenav').sidenav();
});


const boxes = document.querySelector(".boxes");
const loggedOutLinks = document.querySelectorAll(".logged-out");
const loggedInLinks = document.querySelectorAll(".logged-in");

const setupUI = (user) => {
    //toggle UI elements
    if(user) { //logged in
        loggedOutLinks.forEach((item) => (item.style.display = "none"));
        loggedInLinks.forEach((item) => (item.style.display = "block"));
    } else { //logged out
        loggedOutLinks.forEach((item) => (item.style.display = "block"));
        loggedInLinks.forEach((item) => (item.style.display = "none"));
    }
};

const render = (data, id) => {
    const html = `
        <div class="box col l3 m4 s6" data-id="${id}">
            <div class="card small hoverable yellow lighten-4">
                <div class="card-content blue-grey-text">
                    <span class="card-title">${data.name}</span>
                    <p class="truncate" id="container">Items: ${data.items}</p>
                    <p class="truncate">Categories: ${data.categories}</p>
                </div>
                <div class="card-action">
                    <div class="row">
                        <a class="tooltipped modal-trigger" href="#editboxmodal" data-position="top" data-tooltip="edit"><i class="material-icons teal-text" 
                            data-id="${id}" boxname="${data.name}" items="${data.items}" categories="${data.categories}"  >edit</i></a>
                        <a class="tooltipped right deletebox" data-position="top" data-tooltip="delete" ><i class="material-icons teal-text" data-id="${id}">delete</i></a>
                    </div>
                </div>
            </div>
        </div>
    `;
    boxes.innerHTML += html;
};

//populate boxes 
const setupBoxes = (data) => {
    let html = "";
    data.forEach((doc) => {
        const box = doc.data();
        const li = `
            <div class="box col l3 m4 s6" data-id="${box.id}">
                <div class="card small hoverable yellow lighten-4">
                    <div class="card-content blue-grey-text">
                        <span class="card-title">${box.name}</span>
                        <p class="truncate" id="container">Items: ${box.items}</p>
                        <p class="truncate">Categories: ${box.categories}</p>
                    </div>
                    <div class="card-action">
                        <div class="row">
                            <a class="tooltipped modal-trigger" href="#editboxmodal" data-position="top" data-tooltip="edit"><i class="material-icons teal-text" 
                                data-id="${box.id}" boxname="${box.name}" items="${box.items}" categories="${box.categories}"  >edit</i></a>
                            <a class="tooltipped right deletebox" data-position="top" data-tooltip="delete" ><i class="material-icons teal-text" data-id="${box.id}">delete</i></a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        html += li;
    })
    boxes.innerHTML += html;
};

//remove Box from DOM
const removeBox = (id) => {
    const box = document.querySelector(`.box[data-id ="${id}"]`);
    box.remove();
}
