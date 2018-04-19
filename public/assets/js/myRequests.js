var pageName = window.location.pathname;
var userId = localStorage.getItem("pNumber") ;
var href = 'responds.html';

  if(pageName == '/spare-parts-myrequests.html'){
    firebase.database().ref("Users/"+userId+ "/Requests/spareParts").once("value").then(snap => {
      window.requests = snap.val();
      window.keys = Object.keys(requests);
      parts("spareParts");
      });
      localStorage.setItem('type','spareParts');
  }
  else if(pageName == '/accessories-myrequests.html'){
    firebase.database().ref("Users/"+userId+ "/Requests/accessories").once("value").then(snap => {
      window.requests = snap.val();
      window.keys = Object.keys(requests);
      parts("accessories");
      });
      localStorage.setItem('type','accessories');
  }
  else if(pageName == '/tyres-myrequests.html'){
    firebase.database().ref("Users/"+userId+ "/Requests/TyresABatteries").once("value").then(snap => {
      window.requests = snap.val();
      window.keys = Object.keys(requests);
      tyresBatteries();
      });
      localStorage.setItem('type','TyresABatteries');
  }




async function parts(type){
  if(type == "spareParts" )
    var partType = 'partsDescription';
  else if(type == "accessories")
    var partType = 'accessoriesDescription';
  for(let i=0; i < keys.length; i++){
    if(requests[keys[i]]['orderPartType'] == type){
      str = '#';
      if(requests[keys[i]][partType][0]['photosURL'] != undefined){
        var url = requests[keys[i]][partType][0]['photosURL'][0];
        str = url;
        if( url.indexOf('https') == -1 )
        {
          await firebase.storage().ref().child(url).getDownloadURL().then( url =>{
            str = url;
          }).catch(function(error) { console.log(error);});
        }
      var itemDiv = $('.product-item:first');
      var itemDivClone = itemDiv.clone();
      itemDivClone.find('.bg-img').css('background-image','url('+str+')');
      itemCommonData(itemDivClone,i,href);
      $(".equalize").append(itemDivClone);
    }
    }
  }
  viewResponds();
}

function tyresBatteries(){
  for(let i=0; i < keys.length; i++){
    let type = requests[keys[i]]['orderPartType'];
    if(type == "tyres"){
      var itemDiv = $('.tyre-item:first');
      var itemDivClone = itemDiv.clone();
      itemDivClone.find('.responses-button').attr('requestID',keys[i]);
      itemDivClone.find('.responses-button').attr('href',href);
      itemDivClone.find('.tyre-size').text(requests[keys[i]]['orderList']['size']);
      itemDivClone.find('.tyre-quantity').text(requests[keys[i]]['orderList']['tyresNumber']);
      if(requests[keys[i]]['orderList']['runFlatTyres'] == true)
        itemDivClone.find('.run-flat-tyres').text(' Run Flat Typres');
    }
    if(type == "batteries"){
      var itemDiv = $('.battery-item:first');
      var itemDivClone = itemDiv.clone();
      itemDivClone.find('.responses-button').attr('requestID',keys[i]);
      itemDivClone.find('.responses-button').attr('href',href);
      if(requests[keys[i]]['orderList'] == 'not known')
        itemDivClone.find('.product-description').text('Not Known');
        else{
          itemDivClone.find('.battery-size').text(requests[keys[i]]['orderList']['size']);
          itemDivClone.find('.pole-size').text(requests[keys[i]]['orderList']['poleSize']);
        }
    }
    itemDivClone.show();
    $(".equalize").append(itemDivClone);
  }
  viewResponds();
}


function viewResponds(){
  $('.responses-button').click(function(e){
    e.preventDefault();
    localStorage.setItem('requestID',$(this).attr('requestID'));
    window.location = $(this).attr('href');
  })
}

function itemCommonData(itemDivClone,index,url){
  itemDivClone.find('.responses-button').attr('requestID',keys[index]);
  itemDivClone.find('.responses-button').attr('href',url);
  itemDivClone.find('.car-model').text(requests[keys[index]]['carDetails']['carModel']);
  itemDivClone.find('.car-type').text(requests[keys[index]]['carDetails']['carType']);
  itemDivClone.find('.car-year').text(requests[keys[index]]['carDetails']['carYear']);
  itemDivClone.show();
  return;
}
