// get songReviews to use createSongReview
// we use createRequire since this is a script
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { songReviews } = require("../data");

// get form for refresh
const newReviewForm = document.getElementById("newReview");

// get all input fields
const newReviewUsername = document.getElementById("newReviewUsername");
const newReviewTitleInput = document.getElementById("newReviewTitleInput");
const newReviewRatingInput = document.getElementById("newReviewRatingInput");
const newReviewCommentInput = document.getElementById("newReviewCommentInput");

// hidden fields, use innerHTML to pulkl out data
const songId = document.getElementById("songId");
const userId = document.getElementById("userId");

// get current list of reviews to add the new review without rereshing
const currentReviews = document.getElementsByClassName("reviews")[0]; // should only be 1 instance of reviews

const updateReviewsList = (newReview) => {
    return; // TODO
}

// processes new review on submit click
const processNewReview = async (event) => {
    console.log("Attempting to add new review.");

    // Confirm form submission 
    console.log('Form submitted.');
    event.preventDefault();

    // from hidden div
    const userID = userId.innerHTML;
    const songID = songId.innerHTML;
    
    // from input
    const name = newReviewUsername.value;
    const title = newReviewTitleInput.value;
    const rating = newReviewRatingInput.value;
    const comment = newReviewCommentInput.value;

    try{
        // attempt to add the new review
        const resp = await songReviews.createSongReview(title, userID, songID, name, rating, comment);
        
        // if it's successful, append it to the list and update the DOM
        updateReviewsList(resp);

        console.log(`Success! Successfully added review for song with id ${songID}.`)
    }
    catch (err) {
        //show error
        console.log(err);
        errorDiv.hidden = false;
        errorDiv.innerHTML = err;

        // reset the form 
        newReviewForm.reset();
        console.log(`Failure! Failed to sort and parse lists.`)
    }
    
};

// add the listener if the form exists
console.log("Adding listener to review form.")
if(newReviewForm){
    newReviewForm.addEventListener('submit', processNewReview);
    console.log("Success!")
}