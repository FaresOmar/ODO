$( document ).ready(function() {
  firebase.database().ref("Battery Sizes").once("value").then( snap =>{
    window.batteryTypes = snap.val();
    window.batteryTypesKeys = Object.keys(batteryTypes);
    for(var i = 0; i < batteryTypesKeys.length; i++)
    {
      $("#size-select").append('<option value="' + batteryTypes[batteryTypesKeys[i]] + '">' + batteryTypes[batteryTypesKeys[i]] + ' Amperes</option>');
    }
    $('#size-select').selectpicker('refresh');
  });
  requestData();
  parseSubmittedData();
  $(".form-control.error").removeClass('error');
});

function parseSubmittedData()
{
  $('#contact-form').submit(function(e){
    e.preventDefault();
    if($(".form-control.error").length != 0){
      alert("Enter required inputs");
      $(".form-control.error").removeClass('error');
      return;
    }
    window.data = {};
    var carBrand = $("#car-type").val();
    var carModel = $("#car-model").val();
    var carYear = $("#car-year").val();
    var partType = $("#typeselect").val();
    var engineCapacity =  $('#engine_capacity').val();
    var partColor =  $('#part_color').val();

    var buyerNumber = localStorage.getItem("pNumber");
    data["buyerPhoneNumber"] = buyerNumber;
    data["carDetails"] = {
      carType: carBrand,
      carModel: carModel,
      carYear: carYear,
      engineCapacity:engineCapacity,
      partColor:partColor
    }
    data["dateAdded"] = Date.now();
    if(partType == "batteries")
      getBatteryInfo();
    if(partType == "Spare_Parts")
      getSparePartsInfo();
    if(partType == "tyres")
      getTyresInfo();
    if(partType == "accessories")
      getAccessoriesInfo();
  });
}

function getBatteryInfo()
{
  data["orderPartType"] = "batteries";
  var batteryKnow = $("input[name='battery-info']:checked").val();
  if(batteryKnow == "dntknow_battery")
  data["orderList"] = "not known";
  else {
    size = $(".know-battery-div #size-select").find(":selected").text();
    var isReversed = $('#Reversed:checked').val();
    if(isReversed == undefined)
      isReversed = false;
    else
      isReversed = true;
    var poleSize = $("input[name='battery-poles']:checked").val();
    data["orderList"] = {
      size: size,
      isReversed: isReversed,
      poleSize: poleSize
    }
  }
  addRequest();
}

function getTyresInfo()
{
  data["orderPartType"] = "tyres";
  var tyresSize = $("select[name='tyre-size']").val();
  var tyresNumber = $("select[name='tyre-flat']").find(":selected").text();
  var runFlatTyres = $('#run_flat:checked').val();
  if(runFlatTyres == undefined)
    runFlatTyres = false;
  else if(runFlatTyres == 1)
    runFlatTyres = true;
  data["orderList"] = {
    size: tyresSize,
    tyresNumber: tyresNumber,
    runFlatTyres: runFlatTyres
  }
  addRequest();
}

function getSparePartsInfo()
{
  data["orderPartType"] = "spareParts";
  addRequest();
}

function getAccessoriesInfo()
{
  data["orderPartType"] = "accessories";
  addRequest();
}
