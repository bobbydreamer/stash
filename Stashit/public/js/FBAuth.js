document.addEventListener('DOMContentLoaded', event => {

    /*    
    // Initialize Firebase - Already Initialized via <script defer src="/__/firebase/init.js"></script>, so commenting below code.
    var config = {
        apiKey: "AIzaSyBcMCBrkdWqigsCACR3MWF6r6G5e2MYcpQ",
        authDomain: "api-project-333122123186.firebaseapp.com",
        databaseURL: "https://api-project-333122123186.firebaseio.com",
        projectId: "api-project-333122123186",
        storageBucket: "api-project-333122123186.appspot.com",
        messagingSenderId: "333122123186"
    };
    firebase.initializeApp(config);
    */
    
    // get elements
    const email = document.getElementById('txtEmail');
    const password = document.getElementById('txtPassword');
    const signInGoogle = document.getElementById('btnGoogle');
    const signInEmail = document.getElementById('btnEmail');
    const register = document.getElementById('btnRegister');
    const signout = document.getElementById('btnSignout');
    const Loginbox = document.getElementsByClassName('Loginbox');
    
    const demo = document.getElementById('demo');
    const demoP = document.getElementById('demoP');
    
    demoP.innerHTML = 'hello Paragraph';
    demo.innerHTML = 'hello anchor';
/*
    if(document.getElementsByClassName('Loginbox').style.display == 'none'){
        document.getElementsByClassName('Loginbox').style.display = 'visible';
    }
*/
     function updateUserDetails() {
        // Update USER details.

        var user = firebase.auth().currentUser;
        var name, email, photoUrl, uid, emailVerified, providerId, lastloginTime, creationTime;
        
        if (user != null) {
          name = user.displayName;
          email = user.email;
          photoUrl = user.photoURL;
          emailVerified = user.emailVerified;
          uid = user.uid;
          lastloginTime = user.metadata.lastSignInTime;
          creationTime = user.metadata.creationTime;

          // Get a user's provider-specific profile information
          user.providerData.forEach(function (profile) {
            providerId = profile.providerId;
            // console.log("Sign-in provider: " + providerId);
            // console.log("  Provider-specific UID: " + profile.uid);
            // console.log("  Name: " + profile.displayName);
            // console.log("  Email: " + profile.email);
            // console.log("  Photo URL: " + profile.photoURL);
          });
          
        }

        var user = { name, email, photoUrl, uid, emailVerified, providerId, lastloginTime, creationTime };
                
        // Write the new post's data simultaneously in the posts list and the user's post list.
        var updates = {};
        updates['/users/stash/' + uid] = user;      
        return firebase.database().ref().update(updates);
    }

    // sign-in with email
    signInEmail.addEventListener("click", e =>{
    
        if(email.style.display == 'none'){
            document.getElementById('lblEmail').style.display='inline';
            email.style.display = 'inline';
    
            document.getElementById('lblPassword').style.display='inline';
            password.style.display = 'inline';
    
            signInEmail.style.display = 'inline';
            register.style.display = 'none';
            signInGoogle.style.display = 'none';
            return 0;
        }
    
        if(email.value.length == 0 || password.value.length == 0){
            return console.log('email & password required');
        }
    
        const auth = firebase.auth();
        const promise = auth.signInWithEmailAndPassword(email.value, password.value);
        promise.then( firebaseUser => {
            // console.log('Trying to go to success.html');
        });
        promise.catch(e => {
            console.log(e.code, ' ',e.message)
            if(e.code == 'auth/user-not-found'){
                document.getElementById('lblMessage').style.display='inline';
                document.getElementById('lblMessage').innerHTML = 'Register first to stash stuff';
                signInEmail.style.display = 'none';
                register.style.display = 'inline';        
            }        
        });  
    
    });
    
    // register with email
    register.addEventListener("click", e =>{

        if(email.style.display == 'none'){
            document.getElementById('lblEmail').style.display='inline';
            email.style.display = 'inline';
    
            document.getElementById('lblPassword').style.display='inline';
            password.style.display = 'inline';
    
            signInEmail.style.display = 'none';
            register.style.display = 'inline';
            signInGoogle.style.display = 'none';
            return 0;
        }
        
        const auth = firebase.auth();
        const promise = auth.createUserWithEmailAndPassword(email.value, password.value);
        promise.catch(e => {
            if(e.code == 'auth/email-already-in-use'){
                document.getElementById('lblMessage').style.display='inline';
                document.getElementById('lblMessage').innerHTML = 'Hello,  '+e.message;
            }else if(e.code == 'auth/weak-password'){
                document.getElementById('lblMessage').style.display='inline';
                document.getElementById('lblMessage').innerHTML = e.message;
            }else
                console.log(e.code, ' ',e.message);
        });
        promise.then(e => console.log(e.user, ' ', e.email));
    });
    
    // sign-in with google
    signInGoogle.addEventListener("click", e =>{
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });          
        firebase.auth().signInWithPopup(provider);
        
        /*firebase.auth().signInWithPopup(provider).then(function(result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            // ...
          }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log('Google Error : ', errorCode,' ',errorMessage);
            // The email of the user's account used.
            var email = error.email;
            console.log('Email used : ',error.email);
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            console.log('Credential Used : ',credential);
            // ...
          }); */
    });    
    
    // signout
    signout.addEventListener('click', e => {
        const auth = firebase.auth();
        // console.log('Current user : ',firebase.User);
        // console.log('BEfore Signout - ', auth);
        auth.signOut();
        // console.log('After Signout - ', auth);
        // console.log('Current user : ',firebase.User);
    });

    // Check AUTH state change
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
            updateUserDetails();
            // console.log('onAuthStateChanged - FBAuth');

            document.getElementById('lblMessage').style.display='inline';
    /*        console.log(firebaseUser.createdAt, ' ', firebaseUser.lastLoginAt); //Not able to get this data */
    
            if(firebaseUser.providerData[0].providerId == 'password'){
                document.getElementById('lblMessage').innerHTML = 'Hello '+firebaseUser.email;
                // console.log('Firebase Email User = ',firebaseUser);
            }else{//google.com
                //document.getElementById('lblMessage').innerHTML = 'Hello '+firebaseUser.displayName+' - '+firebaseUser.email+' - '+firebaseUser.photoURL+' - '+firebaseUser.emailVerified+' - '+firebaseUser.uid;
                document.getElementById('lblMessage').innerHTML = 'Hello '+firebaseUser.displayName;
                // console.log('Firebase Google User = ',firebaseUser);
            }
    
            setTimeout( () => {
                // console.log('Routing to /stash')
                window.location = "/stash";
            }, 1000);
    
            document.getElementById('lblEmail').style.display='none';
            email.style.display = 'none';
            document.getElementById('lblPassword').style.display='none';
            password.style.display = 'none';
            
            signInGoogle.style.display = 'none';
            signInEmail.style.display = 'none';
            register.style.display = 'none';
            signout.style.display = 'none';
        }else{
            document.getElementById('lblMessage').style.display='none';
    
            document.getElementById('lblEmail').style.display='none';
            email.style.display = 'none';
            document.getElementById('lblPassword').style.display='none';
            password.style.display = 'none';
                    
            signout.style.display = 'none';
            signInGoogle.style.display = 'inline';
            signInEmail.style.display = 'inline';
            register.style.display = 'inline';        
        }
        //Loginbox.style.display='visible';            
   

    });
    
});