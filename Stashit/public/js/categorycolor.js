document.addEventListener('DOMContentLoaded', event => {

    // get elements
    const tbody = document.getElementById('tbody');
    const btnUpdate = document.getElementById('btnUpdate');
    const txtStatus = document.getElementById('txtStatus');    
    const txtColor = document.getElementById('txtColor');

    var txtColorClass = document.getElementsByClassName("txtColorClass");
    var colColorClass = document.getElementsByClassName("colColorClass");
        
/*        
    const txtTopic = document.getElementById('txtTopic');
    const txtCategory = document.getElementById('txtCategory');
    
    const taNotes = document.getElementById('taNotes');    
    
    const dlCategory = document.getElementById('dlCategory');
    const colorPreview = document.getElementById('colorPreview');

    var catColors = {};
*/

    function validateColor(hex) {
        //console.log(hex);
        var isOk  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hex);
        //console.log('isOK = ', isOk,' - ',hex);
        return isOk;
    }

    btnUpdate.addEventListener('click', e => {

        //console.log('Button Clicked');
        var save = true;
        var data = {};

        $('#tbody tr').each(function(i) {
            var row = $(this).find('#category').html();
            let category = $(this).find('#category').html();
            let color = $(this).find('#txtColor'+i).val();
            if(validateColor(color) == false){
                txtStatus.innerHTML= 'Error : Color '+color+' @ row '+ (i+1) +' is not valid. Correct it';
                save = false;
                return 0;
            }         
            data[category] = color;   
            // let isOk  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
            // console.log(category,'=',color,' - ',isOk);
            
         });
                
         if(save){
            //  console.log('Saved');
            //  console.log('data = ',data);
            // Hide txtStatus alert after 3 seconds            
            document.querySelector('#txtStatus').style.display = 'inline';	
             txtStatus.innerHTML= 'Boom! Saved';
            setTimeout(function(){
                document.querySelector('#txtStatus').style.display = 'none';	
            },3000);
             

             const auth = firebase.auth();
             const uid = auth.currentUser.uid; //var userId = firebase.auth().currentUser.uid;
             const catRef = firebase.database().ref().child('categories');

             let updates = {};
             let keys = Object.keys(data);
             for(let i=0;i<keys.length;i++){
                 let category = keys[i];
                 let color = data[keys[i]];
                 //console.log(category, ' = ',color);
                 updates['/categories/' + uid + '/' + category + '/color'] = color; //User Categories
                 
             }
             firebase.database().ref().update(updates);
             catRef.child(uid +'/categoryList').set(data);
                         
         }else{
             console.log('not saved');
         }

    });

    function updateTable(uid){
        //console.log('UID =',uid);        
        var catList = firebase.database().ref().child('categories').child(uid);

        //If you use .on this listener will be triggered after every save. Using .once this will be triggered only after onAuthStateChanged
//        catList.child('categoryList').on('value', (snap) => { 
            catList.child('categoryList').once('value').then( (snap) => {
            $("table > tbody").html(""); //Clearing the existing tableBody by the fastest way known to man

            var catData = snap.val();
            //console.log('catList = ', catData);            
            var catKeys = Object.keys(catData   );
            //console.log('Keys = ', catKeys);

            var tabData = {};
            
            for(let i=0;i<catKeys.length;i++){
                var temp = {};
                //console.log('Loop ',i,' = ',catKeys[i],' = ',catData[catKeys[i]]);
                temp["color"] = catData[catKeys[i]];
                tabData[catKeys[i]] = temp;

                let stashCountRef = firebase.database().ref('categories' + '/' + uid + '/' + catKeys[i] + '/count');

                var getStashCount = stashCountRef.once('value').then( function(snap){
                    //console.log(catKeys[i], '=', snap.val());
                    tabData[catKeys[i]].count = snap.val();
                });

                /* let starCountRef = firebase.database().ref('posts/' + postId + '/starCount');
                starCountRef.on('value', function(snapshot) {
                updateStarCount(postElement, snapshot.val());
                });        */
            }

            Promise.all([getStashCount]).then( (snap) =>{
                //$("tbody").find("tr:gt(0)").remove();        
                //console.log('tabData = ',tabData);
                catKeys = Object.keys(tabData);
                for(let i=0; i<catKeys.length;i++){
                    //console.log(tabData[i]);
                    let category = catKeys[i];
                    let color = tabData[catKeys[i]].color;
                    let count = tabData[catKeys[i]].count;
                    //console.log(category,'-',color,'-',count);

        /*
                <tr>
                    <th scope="row">1</th>
                    <td>Mark</td>
                    <td>Otto</td>
                    <td><input type="text" id="exampleForm2" class="form-control form-control-sm" maxlength="7"></td>
                </tr>
        */
                    let tr = document.createElement("tr");
                    let th = document.createElement("th");
                    let tdCategory = document.createElement("td");
                    let tdCount = document.createElement("td");
                    let tdColor = document.createElement("td");
                    let inputTxtColor = document.createElement("input");
                    let inputColColor = document.createElement("input");                    

                    //th
                    $(th).attr('scope', 'row').html(i+1);
                    $(tr).append(th);

                    $(tdCategory).attr('id', 'category').html(category);
                    $(tr).append(tdCategory);

                    $(tdCount).attr('id', 'count').html(count);
                    $(tr).append(tdCount);

                    // $(tdColor).attr('id', 'color').html(color);
                    // $(tr).append(tdColor);
                    //<td><input type="text" id="exampleForm2" class="form-control form-control-sm" maxlength="7"></td>
                    $(inputTxtColor).attr('type','text').attr('id','txtColor'+ i).attr('class','txtColorClass').attr('maxlength',7).attr('size','7').attr('value',color).attr('style','display:inline; margin:0 10px 0 0;');
                    $(tdColor).append(inputTxtColor);

                    $(inputColColor).attr('type','color').attr('id','colColor'+ i).attr('value', color).attr('class','colColorClass');
                    $(tdColor).append(inputColColor);
                    $(tr).append(tdColor);

                    $(tbody).append(tr);        
                }

                for(let i = 0; i < txtColorClass.length; i++) {
                    //console.log(txtColorClass[i], '=',txtColorClass[i].value);
                   txtColorClass[i].addEventListener("blur", function() { //event.target.value is not working so using txtColorClass[i].value
                       //console.log('event.target.value = ',txtColorClass[i].value);
                       let temptxtColor = txtColorClass[i].value;	
                       txtColorClass[i].nextElementSibling.value = temptxtColor;
                 })
               }
               
               for(let i = 0; i < colColorClass.length; i++) {
                   //console.log(colColorClass.length);
                   colColorClass[i].addEventListener("change", function() {
                       let colColor = colColorClass[i].value;	
                       colColorClass[i].previousElementSibling.value = colColor;
                 })
               }
                
                
            });
            
        });

    }    

    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
            //document.getElementById("fullBody").style.display='inherit';
            //console.log('stash - put - firebaseUser.uid = ',firebaseUser.uid);
            updateTable(firebaseUser.uid);
        }else{
            //document.getElementById("fullBody").style.display='none';
            setTimeout( () => {
                window.location = "/";
            }, 5);            
    }
    });
    
});