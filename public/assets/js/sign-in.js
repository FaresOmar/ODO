$(document).ready(function() {
  attachRecaptcha();
  registerBuyerEvents();
  registerSellerEvents();
  signinEvent();
  updateAreas();
  //updateCars();
  updateBrandModel();
  addCar();
  toggleSelectCar();
});
var selectedCars = {};
function addCar(){
  $("#add_car").click(function(e){
    var carType = $('#car-type').val();
    var carModel = $('#car-model').val();
    var carYear = $('#car-year').val();
    if(!carType || !carModel || !carYear ){
      alert("please select a car");
      return;
    }
    else{
      if(!selectedCars[carType])
        selectedCars[carType] = {};
        selectedCars[carType][carModel] = [];
        $.each($("#car-year option:selected"), function(){
            var carYear = $(this).val();
            selectedCars[carType][carModel].push(carYear);
            });
      alert("Car added");
    }
  });
}

function registerBuyerEvents()
{
  $('#verify-code-buyer-form #verify-code-buyer').change(function(){
    var number = $(this).val();
    if(isCodeValid(number))
      $('#verify-code-buyer-form #verify-button-buyer').prop('disabled',false);
    else
      $('#verify-code-buyer-form #verify-button-buyer').prop('disabled',true);
  });

  $('#verify-code-buyer-form #verify-button-buyer').click(function(e){
    e.preventDefault();
    var code = $('#verify-code-buyer-form #verify-code-buyer').val();
    confirmationResult.confirm(code).then(function (result) {
       // User signed in successfully.
       window.userID = result.user.uid;
       addBuyer();
     }).catch(function (error) {
       // User couldn't sign in (bad verification code?)
       console.error('Error while checking the verification code', error);
       window.alert('Error while checking the verification code:\n\n'
           + error.code + '\n\n' + error.message);
     });
  });


  $('#verify-code-buyer-form .cancel-button').click(function(e){
    e.preventDefault();
    assignBuyerRecaptcha();
    $('#register-buyer-form').prop('hidden', false);
    $('#verify-code-buyer-form').prop('hidden', true);

  });
}

function registerSellerEvents()
{
  $('#verify-code-seller-form #verify-code-seller').change(function(){
    var number = $(this).val();
    if(isCodeValid(number))
      $('#verify-code-seller-form #verify-button-seller').prop('disabled',false);
    else
      $('#verify-code-seller-form #verify-button-seller').prop('disabled',true);
  });

  $('#verify-code-seller-form #verify-button-seller').click(function(e){
    e.preventDefault();
    var code = $('#verify-code-seller-form #verify-code-seller').val();
    confirmationResult.confirm(code).then(function (result) {
       // User signed in successfully.
       window.userID = result.user.uid;
       addSeller();
     }).catch(function (error) {
       // User couldn't sign in (bad verification code?)
       console.error('Error while checking the verification code', error);
       window.alert('Error while checking the verification code:\n\n'
           + error.code + '\n\n' + error.message);
     });
  });


  $('#verify-code-seller-form .cancel-button').click(function(e){
    e.preventDefault();
    assignSellerRecaptcha();
    $('#register-seller-form').prop('hidden', false);
    $('#verify-code-seller-form').prop('hidden', true);
  });
}

function signinEvent()
{
  $('#contact-form-signin').submit(function(e){
    e.preventDefault();
    var pNumber = '+2' + $('#mob_num').val();
    var password = $('#signin-pw').val();
    firebase.database().ref("Users/" + pNumber).once('value').then( snap=>{
      if(snap.val() == null)
        alert("Incorrect phone number/password.");
      else
      {
        if(snap.val()['password'] == SHA256(password))
        {
          localStorage.setItem("pNumber", pNumber);
          localStorage.setItem("pw", password);
          var userType = snap.val()['userType'];
          localStorage.setItem("userType",  userType);
          localStorage.setItem("companyType",  snap.val()['companyType']);
          if(userType== "buyer")
            window.location = "buyer-home.html";
          if(userType== "seller"){
            localStorage.setItem("workingOn",  JSON.stringify(snap.val()['workingOn']));
            localStorage.setItem("companyType",  snap.val()['companyType']);
            if(snap.val()['companyType'] == 'Accessories')
              window.location = "accessories-requests.html";
            if(snap.val()['companyType'] == 'Spare Parts')
              window.location = "spare-parts-requests.html";
            if(snap.val()['companyType'] == 'Tyres and batteries')
              window.location = "tyres-requests.html";
          }
        }
        else
          alert("Incorrect phone number/password.");
      }
    });
  });
}

function attachRecaptcha()
{
  assignBuyerRecaptcha();
  window.recaptchaVerifierBuyer.render();
  renderRecaptcha();
}

function renderRecaptcha()
{
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var target = $(e.target).attr("href");
    if(target == '#2a')
    {
      window.recaptchaVerifierBuyer.clear();
      assignSellerRecaptcha();
      window.recaptchaVerifierSeller.render();
    }
    else
    {
      window.recaptchaVerifierSeller.clear();
      assignBuyerRecaptcha();
      window.recaptchaVerifierBuyer.render();
    }
  });
}


function assignBuyerRecaptcha()
{
  //Buyer button
  window.recaptchaVerifierBuyer = new firebase.auth.RecaptchaVerifier('register-buyer-button', {
    'size': 'invisible',
      'callback': function(response) {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        submitBuyer();
      }
  });
}

function assignSellerRecaptcha()
{
   //seller button
   window.recaptchaVerifierSeller = new firebase.auth.RecaptchaVerifier('register-seller-button', {
     'size': 'invisible',
       'callback': function(response) {
         // reCAPTCHA solved, allow signInWithPhoneNumber.
         submitSeller();
       }
   });
}

function submitBuyer()
{
 window.phoneNumber = "+2" + $('#register-buyer-form #phonenum-buyer').val();
 if(verifyBuyersForm() == 0)
  return;
 var appVerifier = window.recaptchaVerifierBuyer;
 firebase.database().ref("Users/"+ window.phoneNumber).once('value').then( snap => {
   if(snap.val() != null)
    alert('User already exist');
  else {
    $('#register-buyer-form').prop('hidden', true);
    $('#verify-code-buyer-form').prop('hidden', false);
    firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
       .then(function (confirmationResult) {
         // SMS sent. Prompt user to type the code from the message, then sign the
         // user in with confirmationResult.confirm(code).
         window.confirmationResult = confirmationResult;
          alert('Code sent');
       },function(error){
         console.log(error);
       }).catch(function (error) {
         console.error('Error during signInWithPhoneNumber', error);
         alert('Error during signInWithPhoneNumber:\n\n'+ error.code + '\n\n' + error.message);
       });
  }

 });
}

function submitSeller()
{
 window.phoneNumber = "+2" + $('#register-seller-form #phonenum-seller').val();
 if(verifySellerForm() == 0)
  return;
 var appVerifier = window.recaptchaVerifierSeller;
 firebase.database().ref("Users/"+ window.phoneNumber).once('value').then( snap => {
   if(snap.val() != null)
    alert('User already exist');
  else {
    $('#register-seller-form').prop('hidden', true);
    $('#verify-code-seller-form').prop('hidden', false);
    firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
       .then(function (confirmationResult) {
         // SMS sent. Prompt user to type the code from the message, then sign the
         // user in with confirmationResult.confirm(code).
         window.confirmationResult = confirmationResult;
          alert('Code sent');
       },function(error){
         console.log(error);
       }).catch(function (error) {
         console.error('Error during signInWithPhoneNumber', error);
         alert('Error during signInWithPhoneNumber:\n\n'+ error.code + '\n\n' + error.message);
       });
  }

 });
}

function verifyBuyersForm()
{
var fName = $('#register-buyer-form #fname-buyer').val();
var pNumber = $('#register-buyer-form #phonenum-buyer').val();
var pw = $('#register-buyer-form #password-new').val();
var pwRepeat = $('#register-buyer-form #password-repeat-buyer').val();
if(pw != pwRepeat)
{
  alert("Passwords doesn't match.");
  return 0;
}
if(fName.length == 0 || pNumber.length == 0 || pw.length == 0 || pw.pwRepeat == 0)
{
  alert("Enter the empty field(s).");
  return 0;
}
return 1;
}

function verifySellerForm()
{
var fName = $('#register-seller-form #fname-seller').val();
var pNumber = $('#register-seller-form #phonenum-seller').val();
var pw = $('#register-seller-form #password_new').val();
var pwRepeat = $('#register-seller-form #password-repeat-seller').val();
if(pw != pwRepeat)
{
  alert("Passwords doesn't match.");
  return 0;
}
if(fName.length == 0 || pNumber.length == 0 || pw.length == 0 || pw.pwRepeat == 0)
{
  alert("Enter the empty field(s).");
  return 0;
}
return 1;
}


function toggleSelectCar(){
  $('#speciality').change(function(){
    selectedSpeciality = $(this).val();
    if(selectedSpeciality == 'Tyres')
      $('#add-car').hide();
    else
      $('#add-car').show();
  })
}

function isPhoneNumberValid(number)
{
  if(number.length != 11 && number > 0)
    return false;
  else
    return true;
}

function isCodeValid(number)
{
  if(number.length != 6 && number > 0)
    return false;
  else
    return true;
}
