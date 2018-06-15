document.addEventListener('DOMContentLoaded', event => {
    
    // get elements
    const email = document.getElementById('txtEmail');
    const password = document.getElementById('txtPassword');
    const signInGoogle = document.getElementById('btnGoogle');
    const signInEmail = document.getElementById('btnEmail');
    const register = document.getElementById('btnRegister');
    const signout = document.getElementById('btnSignout');
    const Loginbox = document.getElementsByClassName('Loginbox');
    const message = document.getElementById('lblMessage');
    const loginbox = document.getElementById('Loginbox');
    
    const demo = document.getElementById('demo');
    const demoP = document.getElementById('demoP');
    
    demoP.innerHTML = 'hello Paragraph';
    demo.innerHTML = 'hello anchor';
/*
    if(document.getElementsByClassName('Loginbox').style.display == 'none'){
        document.getElementsByClassName('Loginbox').style.display = 'visible';
    }
*/

function getStatus(user){
    var statusRef = firebase.database().ref().child('/users/' + user.uid +'/status');
    return statusRef.once('value').then(snap => snap.val());        
}

const setUserDetails = user => {
    return new Promise( (resolve, reject) => {            

        getStatus(user).then( (snap) => {
            // console.log('Snap = ',snap);
            if(snap==null || snap == 'active'){
                var name, email, photoUrl, uid, emailVerified, providerId, lastloginTime, creationTime, status;        
                // console.log('New User ', user);
                name = (user.displayName == null)?'Bruce Wayne' : user.displayName.toLowerCase();
                email = user.email;
                photoUrl = user.photoURL;
                emailVerified = user.emailVerified;
                uid = user.uid;
                lastloginTime = user.metadata.lastSignInTime;
                creationTime = user.metadata.creationTime;
                status = 'active';

                // Get a user's provider-specific profile information
                user.providerData.forEach(function (profile) {
                    providerId = profile.providerId;
                    // console.log("Sign-in provider: " + providerId);
                    // console.log("  Provider-specific UID: " + profile.uid);
                    // console.log("  Name: " + profile.displayName);
                    // console.log("  Email: " + profile.email);
                    // console.log("  Photo URL: " + profile.photoURL);
                });

                var userData = { name, email, photoUrl, uid, emailVerified, providerId, lastloginTime, creationTime, status };
                
                var updates = {};
                updates['/users/' + uid] = userData;      
                firebase.database().ref().update(updates);          
                resolve('authorized');
            }else{
                reject('Sorry! You are not authorized');
            }

        });
        
    });
};

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
        
        $("body").fadeIn("fast");            
                
        if(firebaseUser){
            
            setUserDetails(firebaseUser).then( (results) => {
                // console.log('onAuthStateChanged - FBAuth', results);

                message.style.display='inline';
        /*        console.log(firebaseUser.createdAt, ' ', firebaseUser.lastLoginAt); //Not able to get this data */
        
                if(firebaseUser.providerData[0].providerId == 'password'){
                    message.innerHTML = 'Hello '+firebaseUser.email;
                    // console.log('Firebase Email User = ',firebaseUser);
                }else{//google.com
                    //message.innerHTML = 'Hello '+firebaseUser.displayName+' - '+firebaseUser.email+' - '+firebaseUser.photoURL+' - '+firebaseUser.emailVerified+' - '+firebaseUser.uid;
                    message.innerHTML = 'Hello '+firebaseUser.displayName;
                    // console.log('Firebase Google User = ',firebaseUser);
                }
        
                setTimeout( () => {
                    // console.log('Routing to /stash')
                    window.location = "/stash";
                }, 2000);
        
                document.getElementById('lblEmail').style.display='none';
                email.style.display = 'none';
                document.getElementById('lblPassword').style.display='none';
                password.style.display = 'none';
                
                signInGoogle.style.display = 'none';
                signInEmail.style.display = 'none';
                register.style.display = 'none';
                signout.style.display = 'inline';
            }).catch( (error) => { 
                message.style.display='inline';
                message.innerHTML = error;                

                document.getElementById('lblEmail').style.display='none';
                email.style.display = 'none';
                document.getElementById('lblPassword').style.display='none';
                password.style.display = 'none';
                
                signInGoogle.style.display = 'none';
                signInEmail.style.display = 'none';
                register.style.display = 'none';
                signout.style.display = 'none';
                
                console.log('Status : ',error);
                setTimeout( () => {
                    const auth = firebase.auth();
                    auth.signOut();            
                }, 5000);                
            });

        }else{

            message.style.display='none';
    
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