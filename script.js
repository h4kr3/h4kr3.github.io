var nameError=document.getElementById('name-error');
var phoneError=document.getElementById('phone-error');
var emailError=document.getElementById('email-error');
var messageError=document.getElementById('message-error');

function validateName() {
var name=document.getElementById('contact-name').value;

if(name.length==0) {
    nameError.innerHTML="Name is required";
    return false;
}
if(!name.match(/^[A-Za-z]*\{1}[A-Za-z]*&/)) {
    nameError.innerHTML="write full name";
    return false;

}
}


function validatePhone() {
    var phone=document.getElementById('contact-phone').value;
    
    if(phone.length==0) {
        phoneError.innerHTML="Number required";
        return false;
    }
    if(phone.length!==10) {
        phoneError.innerHTML="Phone number must be 10";
        return false;
    
    }
    if(!phone.match(/^[0-9]{10}$/)) {
        phoneError.innerHTML="Only digits";
        return false;
    
    }

    }
    function validateEmail() {
        var email=document.getElementById('contact-phone').value;
        
        if(email.length==0) {
            emailError.innerHTML="Email is required";
            return false;
        }
        if(!email.match(/^[A-Za-z]\._\-[0-9]*[@][A-Za-z]*[\.]{2;4}$/)) {
            phoneError.innerHTML="Email invalid";
            return false;
        
        }
    
        }

        function validateMessage() {
            var message=document.getElementById('contact-phone').value;
            
            if(message.length==0) {
                messageError.innerHTML="Message is required";
                return false;
            }
        
            }
    

