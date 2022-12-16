// I added this helper file from lab1-10 to allow us to quickly and easily grab generic functions,
// feel free to grab whatever
const {ObjectId} = require('mongodb');

//checks if paramter exists
//this shouldn't need to be asynchronous
const paramExists = (parameter) => {
    if(parameter){
        return true;
    }
    return false;
};

//generic check input function, throw error for invalid input
//this shouldn't need to be asynchronous
const checkInput = (parameter, expectedType, minLength = 0) => {
    //check that the parameter exists and is not null or NaN
    if (!paramExists(parameter)){ 
        throw new Error(`Invalid input: Parameter ${parameter} does not exist.`);
    }

    //type checking
    if (expectedType === "array"){ //check array
        if(!(Array.isArray(parameter))){
            throw new Error(`Invalid input: Expected type ${expectedType}. Received type ${typeof parameter} for parameter ${parameter}.`);
        }
    }
    else if (typeof parameter !== expectedType){ //already checked array, now check everything else
        throw new Error(`Invalid input: Expected type ${expectedType}. Received type ${typeof parameter} for parameter ${parameter}.`);
    }
    
    //length checking
    //we use expected type here since by now we know that expectedType === typeof parameter
    if (expectedType === "string"){ //strings are special --> call trim before checking length
        if(parameter.trim().length < minLength){
            throw new Error(`Invalid input: Parameter ${parameter} needs to be at least ${minLength} non-whitespace characters long.`);
        }
    }
    else if (expectedType === "object"){//objects do not have a length, use keys()
        if(Object.keys(myArray).length < minLength){
            throw new Error(`Invalid input: Parameter ${parameter} needs to have minimum length ${minLength}.`);
        }
    }
    else if (expectedType === "array"){//get array length directly
        if(parameter.length < minLength){
            throw new Error(`Invalid input: Parameter ${parameter} needs to have minimum length ${minLength}.`);
        }
    }
    //all other types do not care about length
};

//this checks multiple input at once, but assumes they are all the same type
const checkMultipleInputs = (expectedType, minLength = 0, ...parameters) => {
    for (parameter in parameters){
        checkInput(parameter, expectedType, minLength)
    }
};

const checkAZ = (parameter) => {
    if(!(/^[a-z ]+$/i.test(parameter.trim()))){
        throw new Error(`Invalid input: Parameter ${parameter} can only contain letters.`);
    }
}

const checkAZNum = (parameter) => {
    if(!(/^[a-z0-9 ]+$/i.test(parameter.trim()))){
        throw new Error(`Invalid input: Parameter ${parameter} can only contain letters and numbers.`);
    }
}

const checkAZNumNoSpaces = (parameter) => {
    if(!(/^[a-z0-9]+$/i.test(parameter.trim()))){
        throw new Error(`Invalid input: Parameter ${parameter} can only contain letters.`);
    }
}

const checkContainsSpaces = (parameter) => {
    return /\s/.test(parameter);
}

const checkContainsUpper = (parameter) => {
    return /[A-Z]/.test(parameter);
}

const checkContainsNum = (parameter) => {
    return /[0-9]/.test(parameter);
}

const checkContainsSpecial = (parameter) => {
    return /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(parameter);
}

const checkPositiveWholeNum = (parameter) => {
    if(!(/^[0-9]+$/i.test(parameter)) || parseInt(parameter, 10) <= 0){
        throw new Error(`Invalid input: Parameter ${parameter} can only be a postive whole number.`);
    }
}

const checkValidReviewRating = (parameter) => {
    checkInput(parameter, "number");
    if(parameter < 1 || parameter > 5){
        throw new Error(`Invalid input: Rating ${parameter} can only be a postive number between 1 and 5.`);
    }
}

const checkName = (parameter) => {
    if(!(/^[a-z]{3,} [a-z]{3,}$/i.test(parameter.trim()))){
        throw new Error(`Invalid input: Parameter ${parameter} must be a correctly formatted name.`);
    }
}

const VALID_DATE_LENGTH = 10;
const MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MIN_YEAR = 1900;
const CURRENT_YEAR = new Date().getFullYear();

const checkValidDate = (parameter) => {
    checkInput(parameter, "string", VALID_DATE_LENGTH); //string, length >= VALID_DATE_LENGTH, need to check for equality next
    if(parameter.length != VALID_DATE_LENGTH){ //checks the length of the whole string, individual components will be checked later
        throw new Error(`Invalid input: Date ${parameter} must be a correctly formatted date.`);
    }

    //get each component part
    const date = parameter.split("/");
    const [month, day, year] = date;

    //check month formatting
    if (!(MONTHS.includes(month))){
        throw new Error(`Invalid input: Date ${parameter} must be a correctly formatted date.`);
    }

    //check day formatting
    const dayAsNum = parseInt(day, 10);
    const max_days = DAYS[MONTHS.indexOf(month)];
    if (dayAsNum == NaN || dayAsNum < 1 || dayAsNum > max_days){
        throw new Error(`Invalid input: Date ${parameter} must be a correctly formatted date.`);
    }

    //check year formatting
    const yearAsNum = parseInt(year, 10);
    if (yearAsNum < MIN_YEAR || yearAsNum > CURRENT_YEAR + 2){
        throw new Error(`Invalid input: Date ${parameter} must be a correctly formatted date.`);
    }
}

const checkValidRuntime = (parameter) => {
    checkInput(parameter, "string", 7); //check string, shortest possible input is #h #min, which is 7 chars
    const timeToArr = parameter.split("h ");

    //checkfor bad spaces
    if(timeToArr[0].trim() !== timeToArr[0]){
        throw new Error(`Invalid input: Runtime ${parameter} must be a correctly formatted runtime.`);
    }
    if(timeToArr[1].trim() !== timeToArr[1]){
        throw new Error(`Invalid input: Runtime ${parameter} must be a correctly formatted runtime.`);
    }

    if(timeToArr.length != 2 || !(timeToArr[1].endsWith("min"))){//check for presence of h and min
        throw new Error(`Invalid input: Runtime ${parameter} must be a correctly formatted runtime.`);
    }
    //split time into h and min
    const h = Number(timeToArr[0]);
    const min = Number(timeToArr[1].replace("min",""));
    
    if(!(Number.isInteger(h)) || h <= 0 || h > 99){
        throw new Error(`Invalid input: Runtime ${parameter} must be a correctly formatted runtime.`);
    }
    if(!(Number.isInteger(min)) || min < 0 || min > 59){
        throw new Error(`Invalid input: Runtime ${parameter} must be a correctly formatted runtime.`);
    }
}

const RATINGS = ["G", "PG", "PG-13", "R", "NC-17"];
const checkValidMovie = (
    title,
    plot,
    genres,
    rating,
    studio,
    director,
    castMembers,
    dateReleased,
    runtime 
  ) => {
    //check title
    checkInput(title, "string", 2); //string, length >= 2
    checkAZNum(title); //Letters, numbers only

    //check plot
    checkInput(plot, "string", 1)

    //check studio
    checkInput(studio, "string", 5); //string, length >= 5
    checkAZ(studio); //Letters only

    //check director
    checkName(director); //check valid name 

    //check ratings
    if(!(RATINGS.includes(rating))){ //check ratings
        throw new Error(`Invalid input: Parameter rating (${rating}) must be valid rating.`);
    }

    //check genres and each genre within
    checkInput(genres, "array", 1) //check genres is an array of at least length one
    genres.forEach(genre => {//for each genre, we need to check it's validity
        checkInput(genre, "string", 5)//string, length >= 5
        checkAZ(genre);//only letters
    });

    //check cast members and each member within
    checkInput(castMembers, "array", 1) //check castMembers is an array of at least length one
    castMembers.forEach(castMember => {//for each cast member, we need to check their validity
        checkInput(castMember, "string")//check that input is a string
        checkName(castMember);//check valid name
    });

    //check date released
    checkValidDate(dateReleased); //check proper date formatting

    //check run time
    checkValidRuntime(runtime); //check proper runtime formatting
}

const checkValidReview = (movieId, reviewTitle, reviewerName, review, rating) => {
    //check movieId
    checkId(movieId);

    //check reviewTitle
    checkInput(reviewTitle, "string", 1) //string, length >= 1

    //check reviewerName
    checkName(reviewerName); //check valid name

    //check review
    checkInput(review, "string", 1) //string, length >= 1

    //check rating
    checkValidReviewRating(rating);
}

//note that this check returns id on success
const checkId = (id) => {
    //check input
    checkInput(id, "string", 1);

    //check objectId validity
    id = id.trim();
    if (!ObjectId.isValid(id)){
        throw new Error(`Invalid input: Invalid ObjectId ${id}.`);
    }
}

//prints a dashed line, used for nice formatting
const printDashedLine = () => {
    console.log();
    console.log("-----------------------------------");
    console.log();
}

//this function takes a function and set of parameters and returns the result, whether it throws or not
const runFunction = async(func, ...parameters) => {
    try{
        const parametersDefined = parameters.length > 0 ? true : false; //checks if params is at least of length 1
        const res = parametersDefined ? await func(...parameters) : await func();//this runs with nothing or the given parameters, depending on if the params are defined
        return res;
    }catch(err){
        return err;
    }
};

//given a function, runs the given parameters and compares it to the output
const testFunction = async(func, showOutput, expectedOutput, ...parameters) => {
    const parametersDefined = parameters.length > 0 ? true : false; //checks if params is at least of length 1
    let res;
    try{
        res = parametersDefined ? await runFunction(func, ...parameters) : await runFunction(func); //this runs with nothing or the given parameters, depending on if the params are defined
    }
    catch (err) {
        res = err;
    }

    //check if the output matched what we expected
    let success = false;
    if (expectedOutput === Error){
        success = (res instanceof Error);
    }
    else{
        success = (JSON.stringify(res) === JSON.stringify(expectedOutput));
    }
    console.log(`Function: ${func.name} had ${success ? "correct" : "incorrect"} output with input (${parameters}).`);
    if(showOutput){
        console.log("Output: ")
        console.log(res);
        if(!success){
            console.log("Expected: ");
            console.log(expectedOutput);
        }
    }
    console.log(); //additional whitespace for nice formatting

    //optionally used return
    return success;
};

module.exports = {
    paramExists,
    checkInput,
    checkMultipleInputs,
    checkAZ,
    checkAZNum,
    checkAZNumNoSpaces,
    checkContainsSpaces,
    checkContainsUpper,
    checkContainsNum,
    checkContainsSpecial,
    checkPositiveWholeNum,
    checkValidReviewRating,
    checkName,
    checkValidDate,
    checkValidRuntime,
    checkValidMovie,
    checkValidReview,
    checkId,
    printDashedLine,
    runFunction,
    testFunction
};