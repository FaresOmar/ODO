var itemNumber = localStorage.getItem('itemNumber');
var requestID = localStorage.getItem('requestID');
var buyerPhoneNumber = localStorage.getItem('buyerPhoneNumber');
var sellerPhoneNumber = localStorage.getItem('pNumber');

var pageName = window.location.pathname;
if(pageName == '/accessories-item-respond.html')
{
  firebase.database().ref("Requests/accessories/"+requestID).once("value").then( snap =>{
    var accessoriesdata = snap.val();
    assignRequestMetaData(accessoriesdata);
    $('.accessory-name').html(accessoriesdata['accessoriesDescription'][itemNumber]['part']);
  });
}

if(pageName == '/sparepart-item-respond.html')
{
  firebase.database().ref("Requests/spareParts/"+requestID).once("value").then( snap =>{
    sparePartdata = snap.val();
    assignRequestMetaData(sparePartdata);
    $('.part-name').html(sparePartdata['partsDescription'][itemNumber]['part']);
    firebase.database().ref("Users/"+buyerPhoneNumber).once("value").then( snap =>{
      userData = snap.val();
      $('.engine-cap').html(userData['engineCapacity']);
      $('.color').html(userData['partColor']);
    });
  });
}

if(pageName == '/tyre-item-respond.html')
{
  firebase.database().ref("Requests/TyresABatteries/"+requestID).once("value").then( snap =>{
    var TyresABatteriesdata = snap.val();
    assignRequestMetaData(TyresABatteriesdata);
    $('.tyre-size').html(TyresABatteriesdata['orderList']['size']);
    $('.tyre-quantity').html(TyresABatteriesdata['orderList']['tyresNumber']);
    $('.run-flat-tyres').html(TyresABatteriesdata['orderList']['runFlatTyres']);
  });
}

if(pageName == '/batteries-item-respond.html')
{
  firebase.database().ref("Requests/TyresABatteries/"+requestID).once("value").then( snap =>{
    var TyresABatteriesdata = snap.val();
    assignRequestMetaData(TyresABatteriesdata);
    if(TyresABatteriesdata['orderList'] == 'not known'){
      $('.battery-size').html('Not known battery size');
      $('.battery-poles').html('Not known battery pole');
    }
    else{
      $('.battery-size').html(TyresABatteriesdata['orderList']['size']);
      $('.battery-poles').html(TyresABatteriesdata['orderList']['poleSize']);
    }
  });
}

$('#submit-message').click(function(e){
  e.preventDefault();
  var price = $('#price').val();
  var desc = $('#desc').val();
  var data = {
    price: price,
    description: desc
  }
  var obj = {};
  obj[requestID] = true;
  firebase.database().ref("Users/"+sellerPhoneNumber+"/Responds").update(obj);

  if(pageName == '/accessories-item-respond.html')
  {
    firebase.database().ref("Requests/accessories/"+requestID+"/Responds/"+sellerPhoneNumber+"/"+itemNumber).update(data).then(
    snap => {
      firebase.database().ref("Users/"+buyerPhoneNumber+"/Requests/accessories/"+requestID+"/Responds/"+sellerPhoneNumber+"/"+itemNumber).update(data).then(snap => alert("Respond recorded successfully"));
    });

  }

  if(pageName == '/sparepart-item-respond.html')
  {
    uploadPhotos();
    data['photosURL'] = urls;
    firebase.database().ref("Requests/spareParts/"+requestID+"/Responds/"+sellerPhoneNumber+"/"+itemNumber).update(data).then(
    snap => {
      firebase.database().ref("Users/"+buyerPhoneNumber+"/Requests/spareParts/"+requestID+"/Responds/"+sellerPhoneNumber+"/"+itemNumber).update(data).then(snap => alert("Respond recorded successfully"));
    });
  }

  if(pageName == '/tyre-item-respond.html')
  {
    var tyresCount = $('#tyre-count').val();
    data['tyresCount'] = tyresCount;
    firebase.database().ref("Requests/TyresABatteries/"+requestID+"/Responds/"+sellerPhoneNumber).update(data).then(
    snap => {
      firebase.database().ref("Users/"+buyerPhoneNumber+"/Requests/TyresABatteries/"+requestID+"/Responds/"+sellerPhoneNumber).update(data).then(snap => alert("Respond recorded successfully"));
    });
  }

  if(pageName == '/batteries-item-respond.html')
  {
    firebase.database().ref("Requests/TyresABatteries/"+requestID+"/Responds/"+sellerPhoneNumber).update(data).then(
    snap => {
      firebase.database().ref("Users/"+buyerPhoneNumber+"/Requests/TyresABatteries/"+requestID+"/Responds/"+sellerPhoneNumber).update(data).then(snap => alert("Respond recorded successfully"));
    });
  }

})

function uploadPhotos(){
  window.urls = [];
  var input = document.querySelector('#spare-part-img');
  numberOfFiles = input.files.length;
  if(numberOfFiles > 5){
    alert("Maximum number of images is 5, you have selected "+numberOfFiles);
    return 0;
  }
  if(numberOfFiles == 0)
    return 1;
  for(let j = 0; j < numberOfFiles; j++){
    let file = input.files[j];
    let fileExtension = getFileExtension(file.name);
    let url = 'Responds/' + requestID +'/'+sellerPhoneNumber+'/'+j+'.'+fileExtension;
    photoUploading = true;
    firebase.storage().ref(url).put(file).then(function(snapshot) {
      photoUploading = false;
  console.log('Uploaded a blob or file!');
});
    urls.push(url);
  }
  return 1;
}

function assignRequestMetaData(data){
  $('.part-manuf').html(data['carDetails']['carType']);
  $('.part-model').html(data['carDetails']['carModel']);
  $('.car-year').html(data['carDetails']['carYear']);
  var date = new Date(data['dateAdded']);
  var year = date.getFullYear();
  var day = date.getDate();
  var month = date.getMonth() + 1;

  var formattedDate = day + '-' + month + '-' + year;
  $('.added-time').html(formattedDate);

}
