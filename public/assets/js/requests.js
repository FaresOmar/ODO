var pageName = window.location.pathname;

firebase.database().ref("Users/" + localStorage.getItem("pNumber") + "/Responds").once('value').then( snap => {
  window.responded = snap.val();
  if(!responded)
    responded = [];
});

var workingOn = JSON.parse(localStorage.getItem("workingOn"));

  if(pageName == '/spare-parts-requests.html'){
    firebase.database().ref("Requests/spareParts").once("value").then(snap => {
      window.requests = snap.val();
      window.keys = Object.keys(requests);
      parts("spareParts");
      });
  }
  else if(pageName == '/accessories-requests.html'){
    firebase.database().ref("Requests/accessories").once("value").then(snap => {
      window.requests = snap.val();
      window.keys = Object.keys(requests);
      parts("accessories");
      });
  }
  else if(pageName == '/tyres-requests.html'){
    firebase.database().ref("Requests/TyresABatteries").once("value").then(snap => {
      window.requests = snap.val();
      window.keys = Object.keys(requests);
      tyresBatteries();
      });
  }




async function parts(type){
  if(type == "spareParts" )
  {
    var partType = 'partsDescription';
    var href = 'sparepart-item-respond.html';
  }
  else if(type == "accessories")
  {
    var partType = 'accessoriesDescription';
    var href = 'accessories-item-respond.html';
  }
  for(let i=0; i < keys.length; i++){
    if(requests[keys[i]]['orderPartType'] == type && !responded[keys[i]]){
      for(let j = 0; j < requests[keys[i]][partType].length; j++){

        let carModel = requests[keys[i]]['carDetails']['carModel'];
        let carType = requests[keys[i]]['carDetails']['carType'];
        if(checkCar(carModel,carType)){
          //
          str = '#';
          if(requests[keys[i]][partType][j]['photosURL'] != undefined){
            var url = requests[keys[i]][partType][j]['photosURL'][0];
            str = url;
            if( url.indexOf('https') == -1 )
            {
              await firebase.storage().ref().child(url).getDownloadURL().then( url =>{
                str = url;
              }).catch(function(error) { });
            }
          }
          var itemDiv = $('.product-item:first');
          var itemDivClone = itemDiv.clone();
          itemDivClone.find('.bg-img').css('background-image','url('+str+')');
          itemCommonData(itemDivClone,i,href);
          itemDivClone.find('.respond-button').attr('itemNumber',j);
          itemDivClone.find('.product-description').text(requests[keys[i]][partType][j]['part']);
          itemDivClone.show();
          $(".equalize").append(itemDivClone);
        }
        }
      }
    }
  assignRespond();
}

function tyresBatteries(){
  for(let i=0; i < keys.length; i++){
    let type = requests[keys[i]]['orderPartType'];
    if((type == "batteries" || type == "tyres") && !responded[keys[i]])
      fetchTyreBattery(type,i);

  }
  assignRespond();
}

function fetchTyreBattery(type,index){
  if(type == 'tyres')
    appendTyre(index);
  else if(type == 'batteries' && requests[keys[index]]['orderList'] != 'not known') {
    var itemDiv = $('.battery-known-item:first');
    var itemDivClone = itemDiv.clone();
    itemCommonData(itemDivClone,index,'batteries-item-respond.html');
    itemDivClone.find('.battery-size').text(requests[keys[index]]['orderList']['size']);
    itemDivClone.find('.pole-size').text(requests[keys[index]]['orderList']['poleSize']);
    if(requests[keys[index]]['orderList']['isReversed'] == true)
      itemDivClone.find('.is-reversed').text(' - Reversed');
    $(".equalize").append(itemDivClone);
  }
  else{
    var itemDiv = $('.battery-notknown-item:first');
    var itemDivClone = itemDiv.clone();
    itemCommonData(itemDivClone,index,'batteries-item-respond.html');
    itemDivClone.find('.product-description').text('Not Known');
    $(".equalize").append(itemDivClone);
  }
}

function appendTyre(index){
  var itemDiv = $('.tyre-item:first');
  var itemDivClone = itemDiv.clone();
  itemCommonData(itemDivClone,index,'tyre-item-respond.html');
  itemDivClone.find('.tyre-size').text(requests[keys[index]]['orderList']['size']);
  itemDivClone.find('.tyre-quantity').text(requests[keys[index]]['orderList']['tyresNumber']);
  if(requests[keys[index]]['orderList']['runFlatTyres'] == true)
    itemDivClone.find('.run-flat-tyres').text(' - Run Flat Typres');
  $(".equalize").append(itemDivClone);
  return;
}

function assignRespond(){

  $('.respond-button').click(function(e){
    e.preventDefault();
    localStorage.setItem('requestID',$(this).attr('requestid'));
    localStorage.setItem('itemNumber',$(this).attr('itemnumber'));
    localStorage.setItem('buyerPhoneNumber',$(this).attr('buyerphonenumber'));
    var requestid = $(this).attr('requestid');
    var obj = {};
    obj[requestid] = true;
    firebase.database().ref("Users/" + localStorage.getItem("pNumber") + "/Visited").update(obj);
    window.location = $(this).attr('href');
  })

  $('.fa-star').click(function(e){
    e.preventDefault();
    var requestid = $(this).attr('requestid');
    var obj = {};
    obj[requestid] = true;
    firebase.database().ref("Users/" + localStorage.getItem("pNumber") + "/favourites").update(obj).then( snap =>  { alert("Added to favourites") });
  });
}

function itemCommonData(itemDivClone,index,url){
  itemDivClone.find('.fa-star').attr('requestID',keys[index]);
  itemDivClone.find('.respond-button').attr('buyerphonenumber',requests[keys[index]]['buyerPhoneNumber']);
  itemDivClone.find('.respond-button').attr('requestID',keys[index]);
  itemDivClone.find('.respond-button').attr('href',url);
  itemDivClone.show();
  return;
}

function checkCar(carModel,carType){
  var carKeys = Object.keys(workingOn);
  for(let i =0; i < carKeys.length; i++)
  {
    if(carKeys[i] == carType){
      for(let j =0; j < carKeys[i].length; j++)
      {
        if(workingOn[carKeys[i]][j] == carModel)
          return true;
      }
    }
  }
  return false;
}
