var beforeImage = '<div class="col-xs-12 col-sm-3 col-md-3 product-item clearfix"><div class="product-img"><div class="bg-img" style="background-image: url(';
var userId = localStorage.getItem("pNumber");
var requestID = localStorage.getItem("requestID");
var type = localStorage.getItem("type");
var typeImgMap = {
  batteries: 'battery.jpg',
  tyres: 'tyre.jpg'
};

firebase.database().ref("Users/"+userId+ "/Requests/" + type + "/" + requestID ).once("value").then(snap => {
  window.request = snap.val();
  window.responds = request['Responds'];
  if(!responds)
    return false;
  window.keys = Object.keys(responds);
  parts(type);
  });

async function parts(type){
  for(let i=0; i < keys.length; i++){
    var itemDiv = $('.product-item:first');
    var itemDivClone = itemDiv.clone();
    if(type == 'accessories' || type == 'spareParts'){
      var responses = Object.keys(responds[keys[i]]);
      itemDivClone.find('.info').text(responses.length + ' responses');
      if(responds[keys[i]][0]['photosURL'] != undefined ){
        var url = responds[keys[i]][0]['photosURL'][0];
    }
    else if(request['orderPartType'] == "batteries"){
      str = 'assets/images/requests/battery.jpg';
      itemDivClone.find('.info').text(responds[keys[i]]['description']);
    }
    else if(request['orderPartType'] == "tyres")
    {
      str = 'assets/images/requests/tyre.jpg';
      itemDivClone.find('.info').text(responds[keys[i]]['description']);
    }
    itemDivClone.find('.bg-img').css('background-image','url('+url+')');
    itemDivClone.find('.buyer-phone').text(keys[i]);
    itemDivClone.show();
    $(".equalize").append(itemDivClone);
  }
  assignButtons();
}


function assignButtons(){
  $('.more-info-button').click(function(e){
    e.preventDefault();
    alert('Buyer phone number: ' + $(this).attr('responsephone') + '\nDescription: '+ $(this).attr('desc'));
  })
}
