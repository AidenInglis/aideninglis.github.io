console.log("firebase script is running"); //testing if the script is running each time the page is loaded.

//ANCHOR - Importing firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  deleteDoc,
  updateDoc // this would be needed if the edit button worked
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

//ANCHOR - Firebase configuration setup
const firebaseConfig = {
  apiKey: "AIzaSyABakjarIiyWege0jI_w0wKlF6EkJ2CEow",
  authDomain: "web504-as2-6e091.firebaseapp.com",
  databaseURL: "https://web504-as2-6e091-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "web504-as2-6e091",
  storageBucket: "web504-as2-6e091.appspot.com",
  messagingSenderId: "828817126512",
  appId: "1:828817126512:web:7a317ccb32513a6d0e70b5"
};

//ANCHOR - Initialize Firebase stuff section
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app)
const currentURL = window.location.href;  

//ANCHOR - Authentication state change
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    console.log(`User is signed in as ${user.email}`);
  } else {
    // User is signed out
    console.log("User is signed out");
  }
});

//ANCHOR - register form
if (currentURL.includes("users.html")) {
  document.getElementById('register-form').addEventListener('submit', async function(e) { // its async because we are using await
    e.preventDefault();
    const email = document.getElementById('register-email').value; // gets user input from the form
    const password = document.getElementById('register-password').value;

    try {// creating a new user with details
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Registered as:", userCredential.user.email);
      alert("Account created successfully!");

      // store data in Firestore
      await setDoc(doc(firestore, "users", userCredential.user.uid,), {
          email: userCredential.user.email,
          createdAt: serverTimestamp()
      });
    } catch (error) { // error checking
      console.error("Error during registration:", error.message);
      alert("There was an error, please try again.");
    }
  });
}

//ANCHOR - login form
if (currentURL.includes("users.html")) { // must only run on the users page.
  document.getElementById('login-form').addEventListener('submit', async function(e) { // listens for the submit button
    e.preventDefault(); // stop default form behavior
    const email = document.getElementById('login-email').value; // gets the user input data
    const password = document.getElementById('login-password').value;

    try { //trying to log in the user with the input details
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Logged in as:", userCredential.user.email); // shows the user is logged in as the entered user in console
        alert("Logged in successfully as " + userCredential.user.email + "!"); // shows the user they have been logged in as their input email
    } catch (error) {
        alert("account not found or email/passwork is incorrect. Please try again.");
    }
  });
}

//ANCHOR - Logout button
const logoutButton = document.getElementById('logout-button'); // logout button id
  if (logoutButton) {
    logoutButton.addEventListener('click', logoutUser); // logout button event listener
  }
function logoutUser() {
  const user = auth.currentUser;
  if (user) {
    auth.signOut().then(() => { // signs out the user
      // Sign-out successful.
      alert("You have been logged out successfully!");
    }).catch((error) => {
      // An error happened.
      console.error('Error logging out:', error);// prints error message
    });
  } else {
    alert("You need to be logged in to log out.");// user not logged in condition not filled
  }
}

//ANCHOR - Contact form
if (currentURL.includes("contact.html")) {
  document.getElementById('contact-form').addEventListener('submit', async function(e) { // listens for the submit button
    e.preventDefault();
    const user = auth.currentUser; // declare user variable
    if (user) {
      const name = document.getElementById('name').value; // getting the user inputs
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;
      try {
        const colRef = collection(firestore, 'contact-form');
        await addDoc(colRef, { // adding data to firestore
          fullName: name,
          Email: email,
          Message: message
        });
        // Data added to Firestore successfully
        alert("Data added to Firestore successfully!");
        // reset the form after submission
        this.reset();
      } catch (error) {
        console.error("Error adding document: ", error);
        // Handle errors
        alert("Error adding data to Firestore. Please try again later.");
      }
    } else {
      // User is not logged in, display a message or take appropriate action
      alert("You need to be logged in to submit the form.");
    }
  });
}

//ANCHOR - Comment form
if (currentURL.includes("contact.html")) {
  document.getElementById('comment-form').addEventListener('submit', async function (e) { // listens for the submit button
    e.preventDefault(); // stops the default form behavior
    const user = auth.currentUser;
    if (user) {
      const email = user.email; // Get the user's details
      const message = document.getElementById('comment-message').value;
      try {
        const colRef = collection(firestore, 'comments');
        await addDoc(colRef, { // adding to firestore
          userEmail: email,
          message: message,
          timestamp: serverTimestamp()
        });
        alert("Comment added successfully!");
        displayComments(); // reloads comments
        this.reset();
      } catch (error) {
        alert("Error adding comment. Please try again later."); // error checking
      }
    } else {
      alert("You need to be logged in to submit a comment."); // login check
    }
  });
}

//ANCHOR - Display comments
function displayComments() {
  const commentsList = document.getElementById('comments-list');

  if (commentsList) {
    // Clear previous comments
    commentsList.innerHTML = '';

    const colRef = collection(firestore, 'comments');

    getDocs(query(colRef, orderBy('timestamp', 'desc'))).then((querySnapshot) => {
      querySnapshot.forEach((doc) => { // loops through the comments so they all can be presented to the user
        const commentData = doc.data(); // get the comment data
        const commentElement = document.createElement('div'); // new element for the comment
        commentElement.id = 'unique-comment'; // id for the comment
        const buttonsHTML = commentData.userEmail === auth.currentUser?.email // only shows the buttons if the user is the same as the user who made the comment
          ? `
            <button class="delete-comment" data-comment-id="${doc.id}"  >Delete</button>
            <button class="edit-comment" class="edit-comment-form" data-comment-id="${doc.id}">Edit</button>
          `: '';
        commentElement.innerHTML = `
          <p><strong>User:</strong> ${commentData.userEmail}</p>
          <p><strong>Message:</strong> ${commentData.message}</p>
          <p><strong>Timestamp:</strong> ${commentData.timestamp.toDate()}</p>
          ${buttonsHTML}
        `; // adds the comment data to the html element
        commentsList.appendChild(commentElement);
      });
      addDeleteCommentEventListener(); // calls the delete button function
      addEditCommentEventListener(); // does not work but will still try to reference it
      toggleEditFormVisibility(); // attempts to make the form visible when the user clicks edit
    })
  }
}
displayComments(); // calls the function so that the comments are displayed on the page

//ANCHOR - Delete comments
async function deleteComment(commentId) { // constantly listens for the delete button
  const docRef = doc(firestore, 'comments', commentId);
  try {
    await deleteDoc(docRef); // deletes the comment
    console.log('Comment deleted successfully!');
    displayComments(); // updates the comments
    console.log('Comments refreshed successfully!');
  } catch (error) {
    console.error('Error deleting comment:', error); // error checking
  }
}
function addDeleteCommentEventListener() { // listens for the delete button
  const deleteButtons = document.querySelectorAll('.delete-comment');
  deleteButtons.forEach((button) => {
    button.addEventListener('click', function() {
      const commentId = this.dataset.commentId; // what comment is going to be deleted
      deleteComment(commentId);
    });
  });
}

//ANCHOR - Edit comments - does not function correctly
function addEditCommentEventListener() { // listens for the edit button
  const editForms = document.querySelectorAll('.edit-comment-form');
  editForms.forEach((form) => {
      form.addEventListener('submit', async function (e) { // listens for the edit form
          e.preventDefault();
          const commentId = this.dataset.commentId;
          const editedMessage = this.querySelector('.edit-comment-input').value;

          try {
              const docRef = doc(firestore, 'comments', commentId);
              await updateDoc(docRef, {
                  message: editedMessage
              });

              console.log('Comment edited successfully!');
              displayComments();
          } catch (error) {
              console.error('Error editing comment:', error);
          }
      });
  });
}
function toggleEditFormVisibility() { // is meant to make the form visible once the edit button is clicked
  const editButtons = document.querySelectorAll('.edit-comment');
  editButtons.forEach((button) => {
      button.addEventListener('click', function () { // listens for the edit button
          const commentId = this.dataset.commentId;
          console.log('Comment ID:', commentId); // says what comment to edit

          const editForm = document.querySelector(`.edit-comment-form[data-comment-id="${commentId}"]`);
          console.log('Edit Form:', editForm);// this was to test whether the edit form was being found which it was not.

          if (editForm) {// this never got run because it couldn't find the edit form.
          editForm.style.display = (editForm.style.display === 'none' || editForm.style.display === '') ? 'block' : 'none';
          }
        
      });
  });
}