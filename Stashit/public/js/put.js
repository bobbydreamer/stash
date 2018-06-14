document.addEventListener('DOMContentLoaded', event => {

    // get elements
    const txtTopic = document.getElementById('txtTopic');
    const txtCategory = document.getElementById('txtCategory');
//    const txtColor = document.getElementById('txtColor');
    const taNotes = document.getElementById('taNotes');    
    const btnAdd = document.getElementById('btnAdd');
    const txtStatus = document.getElementById('txtStatus');    
    const dlCategory = document.getElementById('dlCategory');
//    const colorPreview = document.getElementById('colorPreview');

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
    
            // if (txtColor.value == "") {
            //     errMsg = "no text in color textbox";
            //     reject('Missing value : '+errMsg);
            // }
            
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
       //alert(datevalues); //=> [2011, 3, 25, 23, 0, 0]
       //document.getElementById("demo2").innerHTML = datevalues;
       var str = datevalues[0]+"-"+datevalues[1]+"-"+datevalues[2]+" "+datevalues[3]+":"+datevalues[4]+":"+datevalues[5];
        
        return str;
    }
/*
    function titleCase(str) {
        return str.toLowerCase().split(' ').map(function(word) {
          return word.replace(word[0], word[0].toUpperCase());
        }).join(' ');
    }
*/      

    function sanitize(string) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            "/": '&#x2F;'
        };
        const reg = /[&<>"'/]/ig;
        return string.replace(reg, (match)=>(map[match]));
    }
  
    btnAdd.addEventListener('click', e => {

        //txtStatus.innerHTML
        validateForm().then( (resolved) => {

            //console.log('validate form = ',resolved);
            const auth = firebase.auth();
            const uid = auth.currentUser.uid; //var userId = firebase.auth().currentUser.uid;
    
            let topic = sanitize(txtTopic.value);
            let category = sanitize(txtCategory.value);
            let dateSaved = Date.now();
            let color = '#ff3d00'; //'#6a1b9a' - purple;

            let notes = sanitize(taNotes.value);
            notes = notes.replace(/\n/g, "<BR />");        

            //console.log(topic, category, notes, dateSaved);
    
            var addNotes = { topic, category, notes, dateSaved };
            var topicsInfo = { topic, dateSaved };
                    
            // Get a key for a new Post.
            var stashRef = firebase.database().ref().child('stash');
            var catRef = firebase.database().ref().child('categories');

            var key = stashRef.push().key;
            var temp = {};
            temp[key] = topic;
            //var addCategory = { color, "topics":temp };

            // Write the new post's data simultaneously in the posts list and the user's post list.
            var updates = {};
            updates['/stash/' + uid + '/' + key] = addNotes;
/*
            console.log('1. catColors = ', catColors[txtCategory.value]);
            console.log('2. txtColor = ', txtColor.value);
            if(!catColors.hasOwnProperty(category)){
                console.log('3. New Category = ',category);
            }else{
                console.log('3. Already existing category = ',category);
            }

            if(catColors[txtCategory.value] != txtColor.value){
                updates['/categories/' + uid + '/' + category + '/color'] = color; //User Categories
            }
*/
            //updates['/categories/' + uid + '/' + category + '/topics'] = temp; //User Categories
//            updates['/categories/' + uid + '/' + category + '/topics/' + key] = topic; //User Categories Data Key

            if(catColors == null || !catColors.hasOwnProperty(category)){//New User Category
                updates['/categories/' + uid + '/' + category + '/color'] = color; 
                catRef.child(uid +'/categoryList').child(category).set(color);
            }
            updates['/categories/' + uid + '/' + category + '/topicsInfo/' + key] = topicsInfo; 
            firebase.database().ref().update(updates);            
            //catRef.child(uid +'/' + category + '/topics').child(key).set(topic);
                        
            catRef.child(uid + '/' + category + '/count').transaction(function (i) {
                 return i+1;
            });

            // Hide txtStatus alert after 3 seconds
            document.querySelector('#txtStatus').style.display = 'inline';	
            txtStatus.innerHTML= 'Boom! Added';
            setTimeout(function(){
                document.querySelector('#txtStatus').style.display = 'none';	
            },3000);

            //return 0;

            // Get a key for a new Post.
            // var newPostKey = firebase.database().ref().child('posts').push().key;
    
            // Write the new post's data simultaneously in the posts list and the user's post list.
            // var updates = {};
            // updates['/posts/' + newPostKey] = postData;
            // updates['/user-posts/' + uid + '/' + newPostKey] = postData;
    
            // return firebase.database().ref().update(updates);
                
        }).catch( (error) => {
            txtStatus.innerHTML= error;
        });
        
    });

/*
    $('#txtCategory').on('input', function(){
        var options = $('datalist')[0].options;
        for (var i=0;i<options.length;i++){
           if (options[i].value == $(this).val()) 
            {
                let category = $(this).val();
                console.log('input = ', catColors);                
                console.log('txtCategory onChange = ', catColors[category]);
                break;
            }
        }
    });
*/

    function categoryList(uid){
        var catList = firebase.database().ref().child('categories').child(uid).child('categoryList');
        
        //console.log('DL Category Length - ',$(dlCategory).length);
        catList.on('value', function(snap) {
            $(dlCategory).empty();
            catColors = snap.val();
            //console.log('catColors', catColors);
            if(catColors == null){
                return 0;
            }

            let keys = Object.keys(snap.val());
            for(let i = 0; i<keys.length;i++){
                let option = document.createElement("option");
                $(option).attr('id', keys[i]);
                $(option).html(keys[i]);                        
                $(dlCategory).append(option);
            }

        });
            
    }    

    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
            //document.getElementById("fullBody").style.display='inherit';
            //console.log('stash - put - firebaseUser.uid = ',firebaseUser.uid);
            categoryList(firebaseUser.uid);
        }else{
            //document.getElementById("fullBody").style.display='none';
            setTimeout( () => {
                window.location = "/";
            }, 5);            
    }
    });
    
});