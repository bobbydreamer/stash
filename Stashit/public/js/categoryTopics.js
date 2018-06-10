document.addEventListener('DOMContentLoaded', event => {
    
    // get elements
    const contentHolder = document.getElementById('contentHolder');
//    const categoryName = document.getElementById('categoryName').innerText;
    var categoryName = document.getElementsByTagName("body")[0].getAttribute("id"); 
    var categoryBadge = document.getElementById('categoryBadge');
    var count = document.getElementById('count');

    var user, notesCount, color;
    var categoryData = {};

    function getCategory(uid){
        var catData = firebase.database().ref().child('categories').child(uid).child(categoryName);
        catData.on('value', (snap) => {
            // console.log('in GetCategory = ', snap.val());
            if(snap.val() == null){
                messageCard(categoryName + ' category does not exist', 'Go & Write notes of this category', false);
                return 0;
            }
            // console.log('in GetCategory Count = ', snap.val().count);
                    
            listenONspecificCategories(snap.val());
        });
                    
    }
    
    function getTopic(uid, tid){
        // console.log('in getTopic = ', uid, ' - ', tid);
        var topicData = firebase.database().ref().child('stash').child(uid).child(tid);
        return topicData.once('value').then(snap => snap.val());        
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

    $('#contentHolder').on('click','.delete', function(){
        var temp = $(this).attr('id');
        let uid = temp.split(',')[0];
        let cat = temp.split(',')[1];
        let noteId = temp.split(',')[2];

        let updates = {};
        // console.log('UID:',uid,', category:',cat,', noteId:', noteId);
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

    $('#contentHolder').on('click','#msgButton', function(){
        let updates = {};
        // console.log('UID:',user.uid,', category:',categoryName);
        //alert('delete clicked for id: ' + no +' and '+greet);
    
        firebase.database().ref().child('categories').child(user.uid).child(categoryName).off();        

        updates['/categories/' + user.uid + '/' + categoryName ] = null;
        updates['/categories/' + user.uid + '/categoryList/' +categoryName] = null;
        firebase.database().ref().update(updates); 
        firebase.database().ref().child('categories').child(user.uid).child(categoryName).off();        
        window.location.assign("/category");    
    });
    

    firebase.auth().onAuthStateChanged(firebaseUser => {        
        if(firebaseUser){
            user = firebaseUser;            
            //console.log('stash - stash - Logged In');
            //console.log('Category Name = ', categoryName);
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
                        
            //console.log('UID = ', user.uid);
            getCategory(user.uid);
            /*getCategory(user.uid).then( (data) => {
                categoryData = data;
                count.innerText = categoryData.count;
                color = categoryData.color;
                console.log('Color = ',color);
                $(categoryBadge).attr('style', 'background-color: '+ color + '; margin:0px 10px; ')   ;

                console.log('categoryData = ',categoryData);
                showStash();
            }).catch( (error) => {
                console.log('No data changes for ',categoryName);
                //txtStatus.innerHTML= error;
            }); */

            //document.getElementById('user').innerText=firebaseUser.displayName;
            //console.log('firebaseUser - ',firebaseUser); 
            //document.getElementById("fullBody").style.display='inherit';
            
        } else {
            setTimeout( () => {
                window.location = "/";
            }, 5);            
        }
    
    });
   
    function listenONspecificCategories(data){
        if(data !== null){
            categoryData = {};
            categoryData = data;

            if(categoryData.count == undefined)
                count.innerText = 0;
            else
                count.innerText = categoryData.count;

            color = categoryData.color;
            // console.log('Color = ',color);
            $(categoryBadge).attr('style', 'background-color: '+ color + '; margin:0px 10px; ')   ;

            // console.log('in listenONspecificCategories = ',categoryData);
            if(categoryData.count > 0 ){
                showStash();
            }else{
                messageCard('zero notes found', 'click button to delete "'+categoryName+'" category', true);
            }
            
        }else{
            // console.log('No data changes for ',categoryName);
        }
    }

    function showStash(){
        var cH = contentHolder;
        // console.log('in ShowStash');
        while (cH.firstChild) {
            cH.removeChild(cH.firstChild);
            // console.log('remove child');
        }
        // console.log('contentholder - childElementCount ', cH.childElementCount);

        // console.log('categoryData.topicsInfo = ',categoryData.topicsInfo);
        if(categoryData.topicsInfo == undefined){
            return 0;
        }

        let keys = Object.keys(categoryData.topicsInfo);
        // console.log('Keys = ', keys);
        var topicData = {};
        var j=0;
        var promises = [];
        for(let i=0; i<keys.length; i++){
            topicData = {}; 
            promises.push(getTopic(user.uid, keys[i]));
        }
//
        Promise.all(promises.map( p => p.catch(() => undefined))).then( data => {
            // console.log('Promises Data Length = ', data.length);
            // console.log('Promises Keys Length = ', keys.length);
            // console.log('contentholder - childElementCount ', cH.childElementCount);

            //This condition required because two events of .on are getting triggered when you add data(update (color&topics via update) & count by transaction
            if(cH.childElementCount == 0){
                for(let i=0; i<data.length; i++){
                    if(data[i] === null){
                        // console.log('Missing Link for ',keys[i],' / End of Data');
                    }
                    else{                        
                        // console.log('Data(',i,') = Keys(',keys[i],') = ',data[i]);
                        let topic = data[i].topic;
                        let category = data[i].category;
                        let dateSaved = unixts2stdts(data[i].dateSaved);
                        let actionText = 'EDIT';
                        let notes = data[i].notes;
                        let key = keys[i];
                    
                        makeCard2(key, topic, category, dateSaved, actionText, notes); 
                    }        
            }   
        }
        });
//        
    }
    
    function makeCard2(key, topic, category, dateSaved, actionText, notes){
        var stashContainer3 = document.createElement("div");
        $(stashContainer3).attr('style', 'border-left: 10px solid '+ color +';');        
        $(stashContainer3).addClass("stash-container3");        

        var stashTitleOthers = document.createElement("div");
        $(stashTitleOthers).addClass("stash-title-others");

        var stitle2 = document.createElement("div");
        $(stitle2).addClass("stash-title3");
        $(stitle2).html(topic);
        $(stashTitleOthers).append(stitle2);

        let stashOthers = document.createElement("div");
        $(stashOthers).addClass("stash-others3");

        let scat2 = document.createElement("div");
        $(scat2).addClass("stash-category2");
        $(scat2).html(category);
    
            var stashCategory = document.createElement("div");
            $(stashCategory).addClass("stash-category3");
            $(stashCategory).html(category);
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
        $(sc2).attr('style', 'border-left: 10px solid '+ color +';');
        $(sc2).addClass("stash-container2");        
                
        let stct2 = document.createElement("div");
        $(stct2).addClass("stash-titcattime2");
            let stitle2 = document.createElement("div");
            $(stitle2).addClass("stash-title2");
            $(stitle2).html(topic);
            let scat2 = document.createElement("div");
            $(scat2).addClass("stash-category2");
            $(scat2).html(category);
            let stim2 = document.createElement("div");
            $(stim2).addClass("stash-time2");
            $(stim2).html(unixts2stdts(dateSaved));

            let sedt2 = document.createElement("div");
            $(sedt2).addClass("stash-edit2");
            let anchor = document.createElement("a");
            $(anchor).attr('href', '/put/'+key).attr('class','edit');
            anchor.innerText = actionText;
            sedt2.appendChild(anchor);

            let sdel2 = document.createElement("div");
            $(sdel2).addClass("stash-delete2");
            let buttonDel = document.createElement("button");
            $(buttonDel).attr('class','delete').attr('id',user.uid+','+category+','+key);
            buttonDel.innerText = "REMOVE";
            sdel2.appendChild(buttonDel);

        let snote2 = document.createElement("div");
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
        contentHolder.appendChild(mc);
        //contentHolder.insertBefore(mc, contentHolder.childNodes[0]);

    }


});