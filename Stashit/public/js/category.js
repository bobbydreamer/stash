document.addEventListener('DOMContentLoaded', event => {

    // get elements
    const badgeHolder = document.getElementById('badgeHolder');
    const topicHolder = document.getElementById('topicHolder');
    const container = document.getElementById('container');
    const tbody = document.getElementById('tbody');

    var user;
    var categoryList = {};
    var topicList = {};
    var categoriesData;    

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
    
    function readCategories(uid) {
//    console.log('in readCategories function');
        var categoriesRef = firebase.database().ref().child('categories/' + uid);
        //return categoriesRef.once('value').then(snap => snap.val());
        categoriesRef.on('value', (snap) => {
            // console.log('in readCategories = ', snap.val());
            if(snap.val() == null){
                document.getElementById("row1").style.display='none';
                document.getElementById("row2").style.display='none';
                document.getElementById("table1").style.display='none';
                messageCard(' No Notes', 'So start writing one', false);
                return 0;
            }else{
                document.getElementById("row1").style.display='inline';
                document.getElementById("row2").style.display='inline';
                document.getElementById("table1").style.display='inline';                
            }
            let promise1 = removeChilds(badgeHolder);
            let promise2 = removeChilds(tbody);

            Promise.all([promise1, promise2]).then( function(values) {
                listBadges(snap.val());
                listAllTopics(snap.val());        
            });
           
        });                    
    }

    function removeChilds(holder){
        return new Promise( (resolve, reject) => {
            // console.log('in removeChild function');
            // console.log('Holder Before - childElementCount = ', holder.childElementCount, ' = ',holder);
            while (holder.firstChild) {
                holder.removeChild(holder.firstChild);
            }
            // console.log('Holder After - childElementCount = ', holder.childElementCount, ' = ',holder);
            resolve('success');
        });
    }

    function listBadges(data){
        // console.log('in listBadges - Data = ', data);
        //removeChilds(badgeHolder);

        if(badgeHolder.childElementCount == 0){
            let keys = Object.keys(data);
            //        console.log('in listBadges - Length = ', keys.length);
                    for(let i = 0; i<keys.length; i++){
                        let category = keys[i];
                        let count = data[category].count;
                        let color = data[category].color;
              //          console.log('Key(',category,'), count(',count,'), color(',color,')');

                        //console.log('Count = ',count);
                        if(category != 'categoryList'){                            
                            if(count == undefined)
                                count = 0;
                            makeBadges(category, count, color);
                        }
                        
                    }
        }
    }

    function listAllTopics(data){
        // console.log('in listAllTopics - Data = ', data);
        //removeChilds(topicHolder);                   

        let keys = Object.keys(data);
        // console.log('Keys = ', keys);

        let k=0;
        for(let i = 0; i<keys.length; i++){//Category Loop
            let category = keys[i];
            if(category == 'categoryList'){ continue; }

            let count = data[category].count;
            let color = data[category].color;
            let tCount;
            //catColors.hasOwnProperty(category)
            //console.log('Check topics exist in categories = ',data[category].hasOwnProperty('topics'));
            if(!data[category].hasOwnProperty('topicsInfo')){
                return 0;
            }else{
                //tCount = Object.keys(data[category].topics);
                tCount = Object.keys(data[category].topicsInfo);
            }
              //console.log('tCount(',category,') = ', tCount);
            for(let j=0; j<tCount.length; j++){//Topics in Category Loop
                k++;
                let tr = document.createElement("tr");
                let th = document.createElement("th");
                let tdCount = document.createElement("td");
                let tdDatetime = document.createElement("td");
                let tdCategory = document.createElement("td");
                let tdTopic = document.createElement("td");
                
                let topic = data[category].topicsInfo[tCount[j]]['topic'];
                let datetime = data[category].topicsInfo[tCount[j]]['dateSaved'];
                //console.log('Key = ', tCount[j], 'datetime = ',datetime,' Topic = ', topic);

                //count
                $(th).attr('scope', 'row').addClass("yellow-text").html(k);
                $(tr).append(th);

                //datetime
                let span = document.createElement("span");
                $(span).addClass("font-small").html(unixts2stdts(datetime));
                tr.appendChild(span);

                //category
                let anchor = document.createElement("a");
                span = document.createElement("span");
                $(span).addClass("badge badge-pill");
                $(span).attr('style', 'background-color: '+ color + '; font-size:13px; ');
                $(span).attr('id', category).html(category);
                $(anchor).attr('href', '/category/'+category);
                anchor.appendChild(span);
                $(tdCategory).append(anchor)
                tr.appendChild(tdCategory);
                        
                //Topic
                var anchorTopicEdit = document.createElement("a");
                $(anchorTopicEdit).attr('href', '/put/'+tCount[j]).attr('target','_blank').attr('id',tCount[j]).html(topic);
                $(anchorTopicEdit).addClass("edit");
                // sedt2.appendChild(anchorTopicEdit);
                $(tdTopic).append(anchorTopicEdit);
                $(tr).append(anchorTopicEdit);
    
                $(tbody).append(tr);
            }

        }            

    }

    function makeBadges(category, count, color){
        var anchor = document.createElement("a");
        var span = document.createElement("span");
        $(span).addClass("badge badge-pill");
        //$(span).attr('style', 'background-color: '+ color + '; margin:5px; font-weight:400');
        $(span).attr('style', 'background-color: '+ color + '; ');
        $(span).html(category+" | "+count);
        $(anchor).attr('href', '/category/'+category);
        anchor.appendChild(span);
        badgeHolder.appendChild(anchor);
    }

    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
            //document.getElementById("fullBody").style.display='inherit';
            user = firebaseUser;            
            // console.log('stash - get - firebaseUser.uid = ',user.uid);

            readCategories(user.uid);
        }else{
            setTimeout( () => {
                window.location = "/";
            }, 5);            
        }
    });
   
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