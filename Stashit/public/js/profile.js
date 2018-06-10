document.addEventListener('DOMContentLoaded', event => {
    // get elements
    const user = document.getElementById('user')
    const name = document.getElementById('cellName');
    const email = document.getElementById('cellEmail');
    const uid = document.getElementById('cellUid');
    const ev = document.getElementById('cellEv');
    const photo = document.getElementById('cellPhoto');
    const lastLogintime = document.getElementById('cellLlt');
    const dataProvider = document.getElementById('cellDp');

    //function
    function getName(firebaseUser){
        var userNameRef = firebase.database().ref().child('users/' + firebaseUser.uid +'/name');
        return userNameRef.once('value').then(snap => snap.val());        
    }
    
    function populateUserDetails(firebaseUser){
//        user.innerText=firebaseUser.displayName;
        var fbName;
        getName(firebaseUser).then( values => {
            if(firebaseUser.displayName != null){
                name.innerText = firebaseUser.displayName;
            } else if(values === null){
                name.innerText = 'Bruce Wayne';
            }else    
                name.innerText = values;
        });        
        email.innerText=firebaseUser.email;
        uid.innerText=firebaseUser.uid;       
        ev.innerText=firebaseUser.emailVerified;
        lastLogintime.innerText = firebaseUser.metadata.lastSignInTime;        
        photo.src=(firebaseUser.photoURL === null)? '../images/batman.svg' : firebaseUser.photoURL;        
        dataProvider.innerText=firebaseUser.providerData[0].providerId;
    }

    $('#cellName').dblclick(function(){
        $this = $(this)
        let span = document.createElement("span");
/*
        <label class="sr-only" for="updNameGroup">Username</label>
        <div class="input-group mb-2">
            <input type="text" class="form-control-sm py-0" id="updNameGroup" placeholder="Username">
            <div class="input-group-append">
                    <button type="button" class="btn btn-primary btn-sm">Update</button>                
            </div>            
        </div>
*/
let lblName = document.createElement("label");
let divGroup = document.createElement("div");
let txtName = document.createElement("input");
let divGroupAppendButton = document.createElement("div");
let btnUpdate = document.createElement("button");
var oldName = $this.text();

$(lblName).addClass("sr-only").attr("for","updNameGroup");
lblName.innerText = name.innerText;
$(txtName).addClass("form-control-sm py-0").attr("type","text").attr("id","updNameGroup").attr("placeholder",name.innerText);
$(btnUpdate).addClass("btn btn-primary btn-sm").attr("type","button");
btnUpdate.innerText = "Update";
btnUpdate.addEventListener("click", function(v) {    
    let txtName = document.getElementById("updNameGroup");    
    if(txtName.value.length > 0){        
        let updates = {};
        updates['/users/' + uid.innerText + '/name'] = txtName.value; //User Categories
        firebase.database().ref().update(updates);    
        $("#cellName").html( txtName.value );
    }else{
        $("#cellName").html( oldName );
    }
});
$(divGroupAppendButton).addClass("input-group-append");
divGroupAppendButton.appendChild(btnUpdate);
$(divGroup).addClass("input-group mb-2");
divGroup.appendChild(txtName);
divGroup.appendChild(divGroupAppendButton);
span.appendChild(lblName);
span.appendChild(divGroup);
//$this.replaceWith( span );
$this.html(span);

    })

    // Check AUTH state change   
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
        //console.log('photo - ', (firebaseUser.photoURL === null)? 'user.svg' : firebaseUser.photoURL);
    
            if(firebaseUser.providerData[0].providerId == 'password'){
                //console.log('Firebase Email User = ',firebaseUser); 
                populateUserDetails(firebaseUser);
            }else{//google.com
                //document.getElementById('lblMessage').innerHTML = 'Hello '+firebaseUser.displayName+' - '+firebaseUser.email+' - '+firebaseUser.photoURL+' - '+firebaseUser.emailVerified+' - '+firebaseUser.uid;
                //console.log('Firebase Google User = ',firebaseUser);
                populateUserDetails(firebaseUser);                
            }
        }else{
            setTimeout( () => {
                window.location = "/";
            }, 5);                        
        }
    });        

});