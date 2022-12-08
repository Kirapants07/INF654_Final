// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
//for db manipulation
import {getFirestore, collection, getDocs, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, where, orderBy, serverTimestamp, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";
//for user Auth
import {getAuth, createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";


//web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAXs5EqmXzHzw49sUOrgFE-4B2q83qePPg",
    authDomain: "boxes-d9710.firebaseapp.com",
    projectId: "boxes-d9710",
    storageBucket: "boxes-d9710.appspot.com",
    messagingSenderId: "21099836371",
    appId: "1:21099836371:web:b81cba976511f42386b526"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

//USER AUTHENTICATION:
let user_uid = "none";
//listen for auth status changes
onAuthStateChanged(auth, (user) => {
    if(user){
        //get user uid
        user_uid = user.uid;
        //display logged-in elements
        setupUI(user);

    }else {
        user_uid = "none";
        console.log("User is logged out");
        //display logged-out elements
        setupUI();
    }
})

//signup
const signupForm = document.querySelector("#signup-form");
signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    //get user info
    const email = signupForm["signup-email"].value;
    const password = signupForm["signup-password"].value;
    
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        const modal = document.querySelector("#modal-signup");
        M.Modal.getInstance(modal).close();
        signupForm.reset();
        })
        .catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage);
        });
        signupForm.reset();
});

//Logout
const logout = document.querySelectorAll(".logout");
logout.forEach (click => {
    click.addEventListener("click", (e) => {
        e.preventDefault();
        signOut(auth).then(() => {
            console.log("User signed out");
        }).catch((error) => {
            console.log("Failed to logout user.");
            console.log(error.message);
        })
    })
});

//Login
const loginForm = document.querySelector("#login-form");
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = loginForm["login-email"].value;
    const password = loginForm["login-password"].value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        const modal = document.querySelector("#modal-login");
        M.Modal.getInstance(modal).close();
        signupForm.reset();
        })
        .catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage);
        });
    loginForm.reset();
})

//syncs Firebase with Chrome database to store query results for offline app use
// Subsequent queries will use persistence, if it was enabled successfully
enableIndexedDbPersistence(db)
  .catch((err) => {
      if (err.code == 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
          console.log("Persistence failed");
      } else if (err.code == 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
          console.log("Persistence is not valid");
      }
  });

//CRUD CREATE
//add new box
const boxmodal = document.querySelector(".add-box");
boxmodal.addEventListener("submit", (event) => {
    event.preventDefault();
    addDoc(collection(db, "Box"), {
        name: boxmodal.name.value,
        items: boxmodal.items.value,
        categories: [...boxmodal.category.value.split(',')],
        user_uid: user_uid,
        createdAt: serverTimestamp(),
    }).catch((error) => console.log(error));
    //clear text fields
    boxmodal.reset();
});

// READ
// get data from collection Box
async function getBoxes(db){
    const boxesCol = collection(db, "Box");
    const boxSnapshot = await getDocs(boxesCol);
    const BoxList = boxSnapshot.docs.map((doc) => doc);
    return BoxList;
}

//get all records in Box collection
const boxCollection = collection(db, "Box");
//get filtered records in Box collection
const boxQuery = query(boxCollection, orderBy("name"));
// const boxQuery = query(boxCollection, where("user_uid", "==", user_uid), orderBy("name"));

let boxArray = [];
//check for changes to collection and re-render when changes occur
const unsub = onSnapshot(boxQuery, (doc) =>{
    doc.docChanges().forEach((change) => {
        if(change.type === "added") {
            //call render function in ui
            render(change.doc.data(), change.doc.id);
            boxArray.push({ data: change.doc.data(), id: change.doc.id });
        }
        if(change.type === "modified") {
            //update array
            boxArray = boxArray.filter(box => box.id != change.doc.id);
            boxArray.push({ data: change.doc.data(), id: change.doc.id });

            //remove old box and re-render
            removeBox(change.doc.id);
            render(change.doc.data(), change.doc.id);
        }
        if(change.type === "removed") {
            //remove box from array
            boxArray = boxArray.filter(box => box.id != change.doc.id);

            //remove box from display
            removeBox(change.doc.id);
        }
    });
});

//get searchbar input with each letter
const searchbar = document.querySelectorAll(".search");
searchbar.forEach(bar => {
    bar.addEventListener('keyup', function(e){
        let currentword = e.target.value.toLowerCase();
        const filteredData = boxArray.filter(box => box.data.items.toLowerCase().includes(currentword) || 
            box.data.name.toLowerCase().includes(currentword) );

        const boxes = document.querySelectorAll(".box");
        boxes.forEach((box) => {
            removeBox(box.getAttribute("data-id"));
        })
        filteredData.forEach((box) => {
            render(box.data, box.id);
        })
    })
});

//UPDATE
//populate modal form fields with existing box info
const fillBoxFields = document.querySelector("#boxes");
fillBoxFields.addEventListener("click", (event) => {
    if (event.target.textContent === 'edit') {
        editboxmodal.uniqueid.value= event.target.getAttribute("data-id");
        editboxmodal.name.value= event.target.getAttribute("boxname");
        editboxmodal.items.value= event.target.getAttribute("items");
        editboxmodal.categories.value= event.target.getAttribute("categories");
    }
});
//update existing box
const editboxmodal = document.querySelector(".edit-box");
editboxmodal.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = editboxmodal.uniqueid.value;
    const upDoc = doc(db, "Box", id);
    updateDoc(upDoc, {
        name: editboxmodal.name.value,
        items: editboxmodal.items.value,
        categories: [...boxmodal.category.value.split(',')],
    }).catch((error) => console.log(error));
    //clear text fields
    editboxmodal.reset();
});

//DELETE:
//delete box
const boxContainer = document.querySelector("#boxes");
boxContainer.addEventListener("click", (event) => {
    if (event.target.textContent === 'delete') {
        //if alert response is yes:
        if (confirm("Are you sure you want to delete this box? This action cannot be undone.")){
            const id = event.target.getAttribute("data-id");
            deleteDoc(doc(db, "Box", id));
        }
    }
});

