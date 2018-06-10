document.addEventListener('DOMContentLoaded', event => {
    // get elements
    const txtName = document.getElementById('name');
    const txtEmail = document.getElementById('email');
    const txtMessage = document.getElementById('message')
    const btnSubmit = document.getElementById('btnSubmit');
    const alert = document.getElementById('alert');

    //function
    function getName(firebaseUser){
        var userNameRef = firebase.database().ref().child('users/' + firebaseUser.uid +'/name');
        return userNameRef.once('value').then(snap => snap.val());        
    }

    function fillName(firebaseUser){
        //        user.innerText=firebaseUser.displayName;
        getName(firebaseUser).then( values => {
            if(firebaseUser.displayName != null){
                txtName.value = firebaseUser.displayName;
            } else if(values === null){
                txtName.value = 'Bruce Wayne';
            }else    
                txtName.value = values;
        });        
        txtEmail.value=firebaseUser.email;
    }
            
    function validateForm() {
        return new Promise( (resolve, reject) => {
            var errMsg;
            if (txtName.value == "") {
                errMsg = "no name mentioned";
                reject('Missing value : '+errMsg);
            }
    
            if (txtEmail.value == "") {
                errMsg = "no text in email box";
                reject('Missing value : '+errMsg);
            }
    
            if (txtMessage.value == "") {
                errMsg = "no text in message box";
                reject('Missing value : '+errMsg);
            }          
            resolve('OK');   
        });
    }

    btnSubmit.addEventListener('click', e => {
        //txtStatus.innerHTML
        validateForm().then( (resolved) => {
            //console.log('validate form = ',resolved);
            // Firebase References
            var ref = firebase.database().ref().child('feedbacks');
            var stashRef = ref.child('stash');

            const auth = firebase.auth();

            var updates = {};
            const uid = auth.currentUser.uid; //var userId = firebase.auth().currentUser.uid;    
            let page = 'Stash';
            let name = txtName.value;            
            let email = txtEmail.value;
            let comment = txtMessage.value.replace(/\n/g, "<br />");     
            let dateSaved = Date.now();
    
            // console.log(uid, page, name, email, comment, dateSaved);    
            var addFeedback = { uid, page, name, email, comment, dateSaved };
                    
            // Add the new Stash
            var key = stashRef.push().key;
            // console.log('key = ',key);
            // console.log(addFeedback);
            updates['/feedbacks/' + page + '/' + key] = addFeedback;            
            firebase.database().ref().update(updates);            

            // Show alert
            document.querySelector('.alert').style.display = 'block';
            alert.innerHTML = 'Thank you for your feedback';

            // Hide alert after 3 seconds
            setTimeout(function(){
                document.querySelector('.alert').style.display = 'none';	
            },3000);
            
        }).catch( (error) => {
            //txtStatus.innerHTML= error;
            document.querySelector('.alert').style.display = 'block';
            alert.innerHTML = 'Error : ' + error;
        });
        
    });
    //---------------------------------

    // Check AUTH state change   
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){    
            if(firebaseUser.providerData[0].providerId == 'password'){
                // console.log('Firebase Email User = ',firebaseUser); 
                fillName(firebaseUser);
            }else{//google.com
                //document.getElementById('lblMessage').innerHTML = 'Hello '+firebaseUser.displayName+' - '+firebaseUser.email+' - '+firebaseUser.photoURL+' - '+firebaseUser.emailVerified+' - '+firebaseUser.uid;
                // console.log('Firebase Google User = ',firebaseUser);
                fillName(firebaseUser);                
            }
        }else{
            setTimeout( () => {
                window.location = "/";
            }, 5);                        
        }
    });        

});