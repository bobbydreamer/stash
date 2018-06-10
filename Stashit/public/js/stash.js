document.addEventListener('DOMContentLoaded', event => {

    // get elements
    const signout = document.getElementById('aSignout');
    const name = document.getElementById('userProfile');
    const test = document.getElementById('test');
    const contentHolder = document.getElementById('contentHolder');

    var user;
    var catColors = {};

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
    
    // Signout
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
/*    
    function categoryList(uid){
        return new Promise( (resolve, reject) => {
            var catList = firebase.database().ref().child('categories').child(uid).child('categoryList');
            var catColors = {};
            
            catList.on('value', function(snap) {
                catColors = snap.val();
                console.log('catColors', catColors);
                resolve('OK');
            });            
        });        
    }
*/
    function categoryList(uid){
        var catList = firebase.database().ref().child('categories').child(uid).child('categoryList');           
        return catList.once('value').then(snap => snap.val());
    }


    $('#contentHolder').on('click','.delete', function(){
        var temp = $(this).attr('id');
        let uid = temp.split(',')[0];
        let cat = temp.split(',')[1];
        let noteId = temp.split(',')[2];

        let updates = {};
        //console.log('UID:',uid,', category:',cat,', noteId:', noteId);
        //alert('delete clicked for id: ' + no +' and '+greet);
    
        updates['/stash/' + uid + '/' + noteId ] = null;
        //updates['/categories/' + uid + '/' + cat + '/topics/' + noteId] = null;
        updates['/categories/' + uid + '/' + cat + '/topicsInfo/' + noteId] = null;
        firebase.database().ref().update(updates);            

        var catRef = firebase.database().ref().child('categories');
        catRef.child(uid + '/' + cat + '/count').transaction(function (i) {
             return i-1;
        });
        
    });
    

    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
            //console.log('stash - stash - Logged In');
            
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
            
            user = firebaseUser;            
            //console.log('UID = ', user.uid);
            categoryList(user.uid).then( catList => {
                catColors = catList;
                //console.log('2 = ',catColors);
                //This condition is on the assumpution there should be atleast one color category if there are any texts
                if(catColors != null){
                   showStash();
                }else{
                    document.getElementById("row1").style.display='none';
                    document.getElementById("contentHolder").style.display='none';                        
                    messageCard(' No Notes', 'So start writing one', false);
                }
            });

            //document.getElementById('user').innerText=firebaseUser.displayName;
            //console.log('firebaseUser - ',firebaseUser); 
            //document.getElementById("fullBody").style.display='inherit';
            
        } else {
            setTimeout( () => {
                window.location = "/";
            }, 5);            
        }
    
    });
           
    function showStash(){
        var stashData = [];

        var ref = firebase.app().database().ref('stash');
        var userStash = ref.child(user.uid);
/*
        userStash.on('child_changed', function (snap) {
            // console.log('child_changed = ',snap.val());
            //console.log('child_changed key = ',snap.key);

            let topic = snap.val().topic;
            let category = snap.val().category;
            let dateSaved = unixts2stdts(snap.val().dateSaved);
            let actionText = 'EDIT';
            let notes = snap.val().notes;
            let key = snap.key;

            makeCard(key, topic, category, dateSaved, actionText, notes);
            
        });
*/

        //TODO := Change it from child_added onValue
        userStash.limitToLast(200).on('value', (snap) => { 
        //userStash.limitToLast(5).on('child_added', function (snap) {
            //stashData.push(snap.val()); 
            //console.log('onValue = ', snap.val());
            let allData = snap.val();
            if(allData == null){
                document.getElementById("row1").style.display='none';
                document.getElementById("contentHolder").style.display='none';                        
                messageCard(' No Notes', 'So start writing one', false);            
                return 0;
            }else{
                document.getElementById("row1").style.display='inline';
                document.getElementById("contentHolder").style.display='inline';                                
            }

            //console.log('allData = ',allData);

            let keys = Object.keys(allData);

            var cH = contentHolder;
            while (cH.firstChild) {
                cH.removeChild(cH.firstChild);
            }
                        
            for(let i=0; i<keys.length; i++){
                // console.log(i, ' = ',keys[i]);
                let data = allData[keys[i]];
                let topic = data.topic;
                let category = data.category;
                let dateSaved = unixts2stdts(data.dateSaved);
                let actionText = 'EDIT';
                let notes = data.notes;
                let key = keys[i];
    
                makeCard(key, topic, category, dateSaved, actionText, notes);
            }

            //console.log('child_added key = ',snap.key);
            //console.log('child_added JSON Data = ', snap.val().notes);
            //console.log(catColors);

        });
                
    }

    function makeCard(key, topic, category, dateSaved, actionText, notes){
        var stashContainer3 = document.createElement("div");
        $(stashContainer3).attr('style', 'border-left: 10px solid '+ catColors[category] +';');
        $(stashContainer3).addClass("stash-container3");        

        var stashTitleOthers = document.createElement("div");
        $(stashTitleOthers).addClass("stash-title-others");

        var stitle2 = document.createElement("div");
        $(stitle2).addClass("stash-title3");
        $(stitle2).html(topic);
        $(stashTitleOthers).append(stitle2);

        let stashOthers = document.createElement("div");
        $(stashOthers).addClass("stash-others3");
            var stashCategory = document.createElement("div");
            $(stashCategory).addClass("stash-category3");
            var aCategory = document.createElement("a");
            $(aCategory).attr('href', '/category/'+category).attr('target','_blank').attr('class','category');
            aCategory.innerText = category;
            stashCategory.appendChild(aCategory);            
            $(stashCategory).html(aCategory);
            //$(stashCategory).html(category);
//
            var stashTime = document.createElement("div");
            $(stashTime).addClass("stash-time3");
            $(stashTime).html(unixts2stdts(dateSaved));
//
            var stashEdit = document.createElement("div");
            $(stashEdit).addClass("stash-edit3");
            var aTopicEdit = document.createElement("a");
            $(aTopicEdit).attr('href', '/put/'+key).attr('target','_blank').attr('class','edit');
            aTopicEdit.innerText = actionText;
            stashEdit.appendChild(aTopicEdit);
// 
            let stashRemove = document.createElement("div");
            $(stashRemove).addClass("stash-delete3");
            let buttonDel = document.createElement("button");
            $(buttonDel).attr('class','delete').attr('id',user.uid+','+category+','+key);
            buttonDel.innerText = "REMOVE";
            stashRemove.appendChild(buttonDel);
//
            //$(stashEdit).html(actionText);
        var stashNote = document.createElement("div");
        $(stashNote).addClass("stash-notes3");
        $(stashNote).html(notes);
        
        $(stashOthers).append(stashCategory);
        $(stashOthers).append(stashTime);
        $(stashOthers).append(stashEdit);
        $(stashOthers).append(stashRemove);

        $(stashTitleOthers).append(stashOthers);

        $(stashContainer3).append(stashTitleOthers);
        $(stashContainer3).append(stashNote);
        //$("#contentHolder").append(stashContainer3);
        contentHolder.insertBefore(stashContainer3, contentHolder.childNodes[0]);
    }

/*
    function makeCard(key, topic, category, dateSaved, actionText, notes){
        var sc2 = document.createElement("div");
        $(sc2).attr('style', 'border-left: 10px solid '+ catColors[category] +';');
        $(sc2).addClass("stash-container2");        

        let stct2 = document.createElement("div");
        $(stct2).addClass("stash-titcattime2");
            var stitle2 = document.createElement("div");
            $(stitle2).addClass("stash-title2");
            $(stitle2).html(topic);
            var scat2 = document.createElement("div");
            $(scat2).addClass("stash-category2");
            var anchorCategory = document.createElement("a");
            $(anchorCategory).attr('href', '/category/'+category).attr('target','_blank').attr('class','category');
            anchorCategory.innerText = category;
            scat2.appendChild(anchorCategory);            
            $(scat2).html(anchorCategory);
            //$(scat2).html(category);
//
            var stim2 = document.createElement("div");
            $(stim2).addClass("stash-time2");
            $(stim2).html(unixts2stdts(dateSaved));
//
            var sedt2 = document.createElement("div");
            $(sedt2).addClass("stash-edit2");
            var anchorTopicEdit = document.createElement("a");
            $(anchorTopicEdit).attr('href', '/put/'+key).attr('target','_blank').attr('class','edit');
            anchorTopicEdit.innerText = actionText;
            sedt2.appendChild(anchorTopicEdit);
// 
            let sdel2 = document.createElement("div");
            $(sdel2).addClass("stash-delete2");
            let buttonDel = document.createElement("button");
            $(buttonDel).attr('class','delete').attr('id',user.uid+','+category+','+key);
            buttonDel.innerText = "REMOVE";
            sdel2.appendChild(buttonDel);
//
            //$(sedt2).html(actionText);
        var snote2 = document.createElement("div");
        $(snote2).addClass("stash-notes2");
        $(snote2).html(notes);
        $(stct2).append(stitle2);
        $(stct2).append(scat2);
        $(stct2).append(stim2);
        $(stct2).append(sedt2);
        $(stct2).append(sdel2);
        $(sc2).append(stct2);
        $(sc2).append(snote2);
        //$("#contentHolder").append(sc2);
        contentHolder.insertBefore(sc2, contentHolder.childNodes[0]);
    }
*/
    function messageCard(title, subtitle, close){
        var mc = document.createElement("div");
        $(mc).addClass("message-container");        

        var msgbox = document.createElement("div");
        $(msgbox).addClass("view gradient-card-header blue-gradient white-text");       

        var center = document.createElement("center");

        var h2Title = document.createElement("h2");
        $(h2Title).addClass("card-header-title");       
        h2Title.innerText = title;

        var h5Subtitle = document.createElement("h5");
        $(h5Subtitle).addClass("mb-0 pb-3 pt-2");       
        h5Subtitle.innerText = subtitle;

        var closeButton, iclose;
        if(close == true){
            closeButton = document.createElement("a");
            $(closeButton).addClass("btn-floating");       
            $(closeButton).attr("type","button").attr("id","msgButton");
            h5Subtitle.innerText = subtitle;                

            iclose = document.createElement("i");
            $(iclose).addClass("fa fa-close");       
            closeButton.appendChild(iclose);
        }

        center.appendChild(h2Title);
        center.appendChild(h5Subtitle);
        if(close == true){
            center.appendChild(closeButton);
        }
        msgbox.appendChild(center);
        mc.appendChild(msgbox);
        container.appendChild(mc);
        //contentHolder.insertBefore(mc, contentHolder.childNodes[0]);

    }


});