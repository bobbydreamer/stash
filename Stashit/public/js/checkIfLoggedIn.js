function checkIfLoggedIn(){

    // Variables
    var user = firebase.auth().currentUser;
    console.log('User - ',user);

    if (!user) {
        // setTimeout( () => {
        //     window.location = "/stashlogin";
        // }, 500);
    }    

}
checkIfLoggedIn();
