function adjustHeader(){
  if(localStorage.getItem("userType") == "buyer"){
    $('#buyer-home').css('display','');
    $('#buyer-list').css('display','');
    $("#get-started-button").attr('href','index-buyer.html');
  }
  else if(localStorage.getItem("userType") == "seller"){
    $('#seller-home').css('display','');
    $("#get-started-button").attr('href','index-seller.html');
    if(localStorage.getItem("companyType") == "Spare parts")
      $('#seller-spare-parts-home').css('display','');
    if(localStorage.getItem("companyType") == "Tyres and batteries")
      $('#seller-tyres-requests-home').css('display','');
    if(localStorage.getItem("companyType") == "Accessories")
      $('#seller-accessories-requests-home').css('display','');
  }
  if(!localStorage.getItem("pNumber")){
      $('#sign-in-href').css('display','');
      $('#sign-in-href2').css('display','');
      $('#sign-out-href').css('display','none');
  }
  else{
    $('#sign-in-href').css('display','none');
    $('#sign-in-href2').css('display','none');
    $('#sign-out-href').css('display','');
  }
  $('#sign-out-href').click(function(){
    localStorage.removeItem("pNumber");
    localStorage.removeItem("pw");
    localStorage.removeItem("userType");
    window.location = "index.html";
  });

}

function addBuyer()
{
  var fName = $('#register-buyer-form #fname-buyer').val();
  var pw = $('#register-buyer-form #password-new').val();
  var email = $('#register-buyer-form #buyer_email').val();

  var buyerData = {
    id : window.userID,
    password: SHA256(pw),
    email: email,
    verified: false,
    fullName: fName,
    userType: "buyer",
    carType: "",
    carModel:"",
    carYear:"",
    favourites:"",

  }
  firebase.database().ref("Users/" + phoneNumber).update(buyerData).then(
    snap =>{
    localStorage.setItem("pNumber", phoneNumber);
    localStorage.setItem("pw", pw);
    localStorage.setItem("userType",  "buyer");
    window.location = "buyer-home.html";
  });
}

function addSeller()
{
  var fName = $('#register-seller-form #fname-seller').val();
  var comName = $('#register-seller-form #com_name').val();
  var comAdd = $('#register-seller-form #com_add').val();
  var speciality = $('#speciality').find(":selected").text();
  var email = $('#register-seller-form #n_email').val();
  var pw = $('#register-seller-form #password_new').val();
  var companyArea = $('#register-seller-form #area').val();

  if(speciality == 'Tyres and batteries')
    selectedCars = "";
  /*
  var cars = {}
  $.each($("#working-on option:selected"), function(){
            car = $(this).val();
            index = car.indexOf('|');
            carModel = car.substring(0,index);
            carBrand = car.substring(index + 1);
            if(cars[carModel])
              cars[carModel].push(carBrand);
            else {
                cars[carModel] = [carBrand];
            }
        }); */
  var sellerData = {
    id : window.userID,
    password: SHA256(pw),
    email: email,
    verified: false,
    fullname: fName,
    userType: "seller",
    companyName: comName,
    companyAddress: comAdd,
    companyType: speciality,
    workingOn: selectedCars,
    area: companyArea,
    companyOnMap: {
      latitude: window.lat,
      longitude: window.long
    }
  }
  firebase.database().ref("Users/" + phoneNumber).update(sellerData).then(
  snap =>     {
    localStorage.setItem("pNumber", phoneNumber);
    localStorage.setItem("pw", pw);
    localStorage.setItem("userType",  "seller");
    localStorage.setItem("workingOn",  JSON.stringify(selectedCars));
    alert("Registed successfully");
    if(speciality == 'Accessories')
      window.location = "accessories-requests.html";
    if(speciality == 'Spare parts')
      window.location = "spare-parts-requests.html";
    if(speciality == 'Tyres and batteries')
      window.location = "tyres-requests.html";
  });
}

function requestData()
{
  firebase.database().ref("Car Types").once("value").then( snap =>{
    window.cars = snap.val();
    window.carTypes = Object.keys(cars);
    for(var i = 0; i < carTypes.length; i++)
    {
      $("#car-type").append('<option value="' + carTypes[i] + '">' + carTypes[i] + '</option>');
    }
    $('#car-type').selectpicker('refresh');
    updateModelSelect();
    updateYearSelect();
  });
}

function addRequest(){
  if(data["orderPartType"] == "accessories")
  {
    window.key = firebase.database().ref("Requests/accessories").push().key;
    var numberOfAccessories = $( "#accessory-part-single1" ).siblings().length;
    data["accessoriesDescription"] = [];
    for(let i = 0; i < numberOfAccessories; i++){
      if(!uploadPhotos(i))
        return;
      let partNumber = i + 1;
      let part = $( "#accessory-part-single"+ partNumber+" #part-item").val()
      let partDetails = {
        part: part,
        photosURL: urls
      }
      data["accessoriesDescription"].push(partDetails);
    }
    firebase.database().ref("Requests/accessories/" + key).update(data).then(
    snap =>     {
      addRequestToBuyer('accessories');
    });
    return;
  }

  if(data["orderPartType"] == "spareParts")
  {
    window.key = firebase.database().ref("Requests/spareParts").push().key;
    var numberOfParts = $( "#spare-part-single1" ).siblings().length;
    data["partsDescription"] = [];
    for(let i = 0; i < numberOfParts; i++){
      if(!uploadPhotos(i))
        return;
      let partNumber = i + 1;
      let part = $( "#spare-part-single"+ partNumber+" #part").val();
      let partDetails = {
        part: part,
        photosURL: urls
      }
      data["partsDescription"].push(partDetails);
    }
    firebase.database().ref("Requests/spareParts/" + key).update(data).then(
    snap =>     {
      addRequestToBuyer('spareParts');
    });
    return;
  }
  window.key = firebase.database().ref("Requests/TyresABatteries").push().key;
  firebase.database().ref("Requests/TyresABatteries/" + key).update(data).then(
  snap =>     {
    addRequestToBuyer('TyresABatteries');
  });
}

function updateBrandModel()
{
  firebase.database().ref("Car Types").once("value").then( snap =>{
    window.cars = snap.val();
    window.carTypes = Object.keys(cars);
    for(var i = 0; i < carTypes.length; i++)
    {
      $("#car-type").append('<option value="' + carTypes[i] + '">' + carTypes[i] + '</option>');
    }
    $('#car-type').selectpicker('refresh');
    updateModelSelect();
    updateYearSelect();
  });
}

function updateAreas(){
  firebase.database().ref("Areas").once("value").then( snap =>{
    var areas = snap.val();
    areasKeys = Object.keys(areas);
    var str ="";
    for(var i = 0; i < areasKeys.length; i++)
    {
      str += '<optgroup label="' + areasKeys[i] + '">';
      for(var j = 0; j < areas[areasKeys[i]].length; j++)
      {
        str += '<option value="' + areas[areasKeys[i]][j] + '">' + areas[areasKeys[i]][j] + '</option>';
      }
      str += "</optgroup>";
    }
    $('#area').append(str);
    $('#area').selectpicker('refresh');
  });
}

/*
function updateCars(){
  firebase.database().ref("Car Types").once("value").then( snap =>{
    var cars = snap.val();
    var carTypes = Object.keys(cars);
    var str = "";
    for(var i = 0; i < carTypes.length; i++)
    {
      str += '<optgroup label="' + carTypes[i] + '">';
      var carModels =cars[carTypes[i]];
      var carModelsNames = Object.keys(carModels);
      for(var j = 0; j < carModelsNames.length; j++)
      {
        str += '<option value="' +  carTypes[i] + "|" + carModelsNames[j] + '">' + carModelsNames[j] + '</option>';
      }
      str += "</optgroup>";
    }
    $('#working-on').append(str);
    $('#working-on').selectpicker('refresh');
  });
}
*/
function updateModelSelect()
{
  $("#car-type").change(function(e){
    window.selectedType = $(this).val();
    $("#car-model").html(" ");
    $("#car-year").html(" ");
    var str = "";
    let carModels = cars[selectedType];
    let carModelsNames = Object.keys(carModels);
    for(var i = 0; i < carModelsNames.length; i++)
    {
      //Get previous added cars for this car brand
      if(selectedCars[selectedType]){
        if(selectedCars[selectedType][carModelsNames[i]])
          str += '<option value="' + carModelsNames[i] + '" selected>' + carModelsNames[i] + '</option>';
        else
          str += '<option value="' + carModelsNames[i] + '">' + carModelsNames[i] + '</option>';
      }else{
        str += '<option value="' + carModelsNames[i] + '">' + carModelsNames[i] + '</option>';
      }
    }
    $("#car-model").append(str);
    $('#car-model').selectpicker('refresh');
    $('#car-year').selectpicker('refresh');
    $("#car-model-div").show();
    $("#car-year-div").show();
  });
}


function updateYearSelect()
{
  $("#car-model").change(function(e){
    var selectedModel = $(this).val();
    $("#car-year").html(" ");
    var str = "";
    var startYear =  (new Date()).getFullYear() + 1;
    for(var i = startYear; i > 1949; i--){
      if(selectedCars[selectedType] && selectedCars[selectedType][selectedModel]){
        if(selectedCars[selectedType][selectedModel].indexOf(String(i)) > -1)
          str += '<option value="' + i + '" selected>' + i + '</option>';
        else
          str += '<option value="' + i + '">' + i + '</option>';
      }
      else
        str += '<option value="' + i + '">' + i + '</option>';
    }
    $("#car-year").append(str);
    $('#car-year').selectpicker('refresh');
    $("#add_car-div").show();
  });
    /*
    var carType = $("#car-type").val();
    var carModel = $(this).val();
    var carYearRange = cars[carType][carModel];
    var startYear = Number(carYearRange.substring(0,4));
    var endYear = Number(carYearRange.substring(5));
    for(var i = endYear; i >= startYear; i--)
    {
      $("#car-year").append('<option value="' + i + '">' + i + '</option>');
    }
    $('#car-year').selectpicker('refresh');

  });
  */
}

function addRequestToBuyer(type){
  firebase.database().ref("Users/"+localStorage.getItem("pNumber")+"/Requests/"+ type+ "/" + key).update(data).then(
  snap =>     {
    alert("Request added successfully");
  });
}

function uploadPhotos(i){
  i = i + 1;
  window.urls = [];
  if(data["orderPartType"] == "accessories")
    var input = document.querySelector('#imgInp_access'+i);
  else {
    var input = document.querySelector('#imgInp'+i);
  }
  numberOfFiles = input.files.length;
  if(numberOfFiles > 5){
    alert("Maximum number of images is 5, you have selected "+numberOfFiles);
    return 0;
  }
  if(numberOfFiles == 0)
    return 1;
  i = i - 1;
  for(let j = 0; j < numberOfFiles; j++){
    let file = input.files[j];
    let fileExtension = getFileExtension(file.name);
    let url = 'Orders/' + key +'/'+i+'/'+j+'.'+fileExtension;
    firebase.storage().ref(url).put(file);
    urls.push(url);
  }
  return 1;
}

function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}
