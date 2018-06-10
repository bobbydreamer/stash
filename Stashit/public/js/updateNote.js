document.addEventListener('DOMContentLoaded', event => {

    // get elements
    const txtTopic = document.getElementById('txtTopic');
    const txtCategory = document.getElementById('txtCategory');
    const taNotes = document.getElementById('taNotes');    
    const btnAdd = document.getElementById('btnAdd');
    const txtStatus = document.getElementById('txtStatus');    
    const dlCategory = document.getElementById('dlCategory');
    const noteId = document.getElementById('pointerTs').innerText;    
    var oldCategory ;

    var catColors = {};

    function validateForm() {
        return new Promise( (resolve, reject) => {
            var errMsg;
            if (txtTopic.value == "") {
                errMsg = "no text in topic textbox";
                reject('Missing value : '+errMsg);
            }
    
            if (txtCategory.value == "") {
                errMsg = "no text in category textbox";
                reject('Missing value : '+errMsg);
            }
    
            if (taNotes.value == "") {
                errMsg = "no text in notes textbox";
                reject('Missing value : '+errMsg+" = "+taNotes);
            }          
            resolve('OK');   
        });
    }
    
    function unixts2stdts(unixts){
        var timestamp = unixts;
       date = new Date(timestamp),
       datevalues = [
            date.getFullYear(),
            date.getMonth()+1 <10?"0"+(date.getMonth()+1):(date.getMonth()+1),
            date.getDate() <10?"0"+date.getDate():date.getDate(),
            date.getHours() <10?"0"+date.getHours():date.getHours(),
            date.getMinutes() <10?"0"+date.getMinutes():date.getMinutes(),
            date.getSeconds() <10?"0"+date.getSeconds():date.getSeconds(),
       ];
       var str = datevalues[0]+"-"+datevalues[1]+"-"+datevalues[2]+" "+datevalues[3]+":"+datevalues[4]+":"+datevalues[5];
        
        return str;
    }

    function titleCase(str) {
        return str.toLowerCase().split(' ').map(function(word) {
          return word.replace(word[0], word[0].toUpperCase());
        }).join(' ');
    }

    btnAdd.addEventListener('click', e => {

        //txtStatus.innerHTML
        validateForm().then( (resolved) => {
            //console.log('validate form = ',resolved);

            // Firebase References
            var stashRef = firebase.database().ref().child('stash');
            var catRef = firebase.database().ref().child('categories');

            const auth = firebase.auth();
            const uid = auth.currentUser.uid; //var userId = firebase.auth().currentUser.uid;
    
            let topic = txtTopic.value;
            //let category = titleCase(txtCategory.value).replace(' ','');
            let category = txtCategory.value;
            let notes = taNotes.value.replace(/\n/g, "<br />");        
            let dateSaved = Date.now();
            let color = '#6a1b9a'; //default color --todo - later can be modified to be in profile page.
    
            //console.log(topic, category, notes, dateSaved);
    
            var addNotes = { topic, category, notes, dateSaved };
            var topicsInfo = { topic, dateSaved };
                    
            // Add the new Stash
            var key = stashRef.push().key;
            var updates = {}, temp = {};

            temp[key] = topic;
            var addCategory = { color, "topics":temp };

            updates['/stash/' + uid + '/' + key] = addNotes;

            if(!catColors.hasOwnProperty(category)){//New User Category
                updates['/categories/' + uid + '/' + category + '/color'] = color; 
                catRef.child(uid +'/categoryList').child(category).set(color);
            }
            updates['/categories/' + uid + '/' + category + '/topicsInfo/' + key] = topicsInfo; 
            firebase.database().ref().update(updates);            
            //catRef.child(uid +'/' + category + '/topics').child(key).set(topic);

            catRef.child(uid + '/' + category + '/count').transaction(function (i) {
                return i+1;
           });

            //No Updates required as its a looklike update
            // catRef.child(uid + '/' + category + '/count').transaction(function (i) {
            //      return i+1;
            // });

            // Delete the old stash
            //console.log('oldCategory = ', oldCategory);
            updates = {};
            updates['/stash/' + uid + '/' + noteId ] = null;
            updates['/categories/' + uid + '/' + oldCategory + '/topicsInfo/' + noteId] = null;
            firebase.database().ref().update(updates);            

            catRef.child(uid + '/' + oldCategory + '/count').transaction(function (i) {
                return i-1;
           });
            
            // Hide txtStatus alert after 3 seconds
            document.querySelector('#txtStatus').style.display = 'inline';	
            txtStatus.innerHTML= 'Boom! Updated';
            setTimeout(function(){
                document.querySelector('#txtStatus').style.display = 'none';	
            },3000);
            
               
        }).catch( (error) => {
            txtStatus.innerHTML= error;
        });
        
    });

    function categoryList(uid){
        var catList = firebase.database().ref().child('categories').child(uid).child('categoryList');
        
        // console.log('DL Category Length - ',$(dlCategory).length);
        catList.on('value', function(snap) {
            $(dlCategory).empty();
            // console.log('catList', snap.val());
            catColors = snap.val();
            // console.log('catColors', catColors);

            let keys = Object.keys(snap.val());
            for(let i = 0; i<keys.length;i++){
                let option = document.createElement("option");
                $(option).attr('id', keys[i]);
                $(option).html(keys[i]);                        
                $(dlCategory).append(option);
            }

        });
            
    }    

    function getTopicToUpdate(uid, noteId){
        var topic = firebase.database().ref().child('stash').child(uid).child(noteId);
        return topic.once('value').then(snap => snap.val());
    }

    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
            //document.getElementById("fullBody").style.display='inherit';
            // console.log('stash - put - firebaseUser.uid = ',firebaseUser.uid);
            // console.log('noteId = ',noteId);

            categoryList(firebaseUser.uid);            
            getTopicToUpdate(firebaseUser.uid, noteId).then( data => {
                const txtTopic = document.getElementById('txtTopic');
                const txtCategory = document.getElementById('txtCategory');
                const taNotes = document.getElementById('taNotes');                    

                txtTopic.value = data.topic
                txtCategory.value = data.category;
                //let notes = taNotes.value.replace(/\n/g, "<br />");        
                //taNotes.value = data.notes;                
                taNotes.value = data.notes.replace(/<br\s*[\/]?>/gi, "\n");
                //console.log(taNotes.value);
                oldCategory = txtCategory.value;
            }).catch( (error) => {
                txtStatus.innerHTML= 'Topic not Found';
            });
            
        }else{
            //document.getElementById("fullBody").style.display='none';
            setTimeout( () => {
                window.location = "/";
            }, 5);            
    }
    });
    
});