document.addEventListener('DOMContentLoaded', event => {

    // get elements
    const signout = document.getElementById('aSignout');
    const name = document.getElementById('userProfile');
    const test = document.getElementById('test');

    signout.addEventListener('click', e => {

        const auth = firebase.auth();
        const promise = auth.signOut();
        promise.catch(e => {
            console.log('Error : Stash : Logout : There was an unexpected error during logout');
            console.log('Error : Stash : Logout : Message = ', e);
        });
        promise.then(e => {
            setTimeout( () => {
                window.location = "/";
            }, 500);    
        });

    });

    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
            //console.log('stash-common - firebaseUser');
            if(firebaseUser.providerData[0].providerId == 'password'){
                if(firebaseUser.displayName == null){
                   name.innerText = firebaseUser.email;
                }else
                   name.innerText = firebaseUser.displayName;
                //console.log('Firebase Email User = ',firebaseUser);
            }else{//google.com
                name.innerText = firebaseUser.displayName;
                //console.log('Firebase Google User = ',firebaseUser);
            }            
            //document.getElementById('user').innerText=firebaseUser.displayName;
            //console.log('firebaseUser - ',firebaseUser); 
            //document.getElementById("fullBody").style.display='inherit';

        }else{
            setTimeout( () => {
                window.location = "/";
            }, 5);            
    }
    });
    
});