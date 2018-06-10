document.addEventListener('DOMContentLoaded', event => {
    // get elements
    const txtName = document.getElementById('name');
    const txtEmail = document.getElementById('email');
    const txtMessage = document.getElementById('message')
    const btnSubmit = document.getElementById('btnSubmit');
    const alert = document.getElementById('alert');

    //Setting up firebase secondary project
    var secondaryAppConfig = {
        apiKey: "AIzaSyBQDPMJIVM8d3sYAw2FuLoOuvQOHjfWebc",
        authDomain: "feedbacks-9be7f.firebaseapp.com",
        databaseURL: "https://feedbacks-9be7f.firebaseio.com",
        projectId: "feedbacks-9be7f"
    };

    // Initialize another app with a different config
    var secondary = firebase.initializeApp(secondaryAppConfig, "secondary");

    // Retrieve the database.
    var secondaryDatabase = secondary.database();

    function feedbacks(){
        var appListRef = secondaryDatabase.ref().child('ApplicationList');
        return appListRef.once('value').then(snap => snap.val());        
    }

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
            // resolve('OK');   
            resolve(prepareData());
        });
    }

    function getYearWeek(unixts) {
        date = new Date(unixts); 
        var onejan = new Date(date.getFullYear(), 0, 1);
        return date.getFullYear()+''+Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    }

    function prepareData(){
        const auth = firebase.auth();

        var updates = {};
        const uid = auth.currentUser.uid; //var userId = firebase.auth().currentUser.uid;    
        let subject = 'Stash - Feedback from '+uid;
        let name = txtName.value;            
        let email = txtEmail.value;
        let application = 'stash';
        let message = txtMessage.value.replace(/\n/g, "<br />");     
        let dateSaved = Date.now();
        let status = 'active', category='none';
        // console.log(uid, page, name, email, comment, dateSaved);            
        var addFeedback = { subject, name, email, application, message, dateSaved, status, category };

        return addFeedback;
    }
    
    btnSubmit.addEventListener('click', e => {
        validateForm().then( (resolved) => {
            // console.log('validate form feedback() = ',resolved);
            let application = resolved.application;
            let yearweek = getYearWeek(Date.now());
            let data = {
                feedback:resolved,
                yearweek,
                application
            };

            // console.log('Before writeFeedback() - ',data);
            var writeFeedback = secondary.functions().httpsCallable('writeFeedback');
            writeFeedback(data).then( (result) => {
                // console.log('Result : ',result);
                if(result.data.status){
                    // Show alert
                    document.querySelector('.alert').style.display = 'block';
                    alert.innerHTML = 'Thank you for your feedback';

                    // Hide alert after 3 seconds
                    setTimeout(function(){
                        document.querySelector('.alert').style.display = 'none';	
                    },30000);
                }else{
                    //txtStatus.innerHTML= error;
                    document.querySelector('.alert').style.display = 'block';
                    alert.innerHTML = 'Sorry! Not able to send your feedback';
                }                
            }).catch( (error) => { 
                var code = error.code;
                var message = error.message;
                var details = error.details;
                if(code != undefined){
                    document.querySelector('.alert').style.display = 'block';                    
                    let temp = 'Sorry! Not able to send your feedback. CODE:'+code+' MESSAGE:'+message+' DETAILS:'+details;
                    console.log(temp);    
                    alert.innerHTML = temp;
                }                                                
            });
                
        }).catch( (error) => {
            //txtStatus.innerHTML= error;
            document.querySelector('.alert').style.display = 'block';
            alert.innerHTML = 'Error : ' + error;
        });
            
    });



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