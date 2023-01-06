

$("#addProfileDetails").submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:'/add-profileDetails',
        method:'post',
        data:$('#addProfileDetails').serialize(),
        success:((res)=>{
            swal({
                title:'PERSONAL INFO IS UPDATED',
                type:'success'
            })
        })
    })
 })
 
 
 $("#changePwd").submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:'/verify-pwd',
        method:'post',
        data:$('#changePwd').serialize(),
        success:((res)=>{
            if(res.status){
               location.href = '/change-pwd'
            }
            else{
                Swal.fire({
                    title: 'PASSWORD INCORECT!!!',
                    text: 'Do Check Your Password',
                    icon: 'error',
                    confirmButtonText: 'back'
                  })
            }
        })
    })
 })


 $("#changePassword").submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:'/change-pwd',
        method:'post',
        data:$('#changePassword').serialize(),
        success:((res)=>{
            if(res.status){
               location.href = '/'
            }
            else{
                Swal.fire({
                    title: 'PASSWORD DO NOT MATCH!!!',
                    text: 'Please Check Your Password',
                    icon: 'error',
                    confirmButtonText: 'back'
                  })
            }
        })
    })
 })

 
 function addToWish(proId){
    $.ajax({
        url:'/add-to-wish/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){ 
                swal({
                    title: "Adedd to WISH list!!!",
                    text: "You Can See Items In WISH LIST!!!",
                    type:'success',
                    timer: 500
                  });
                // let count = $('#cartCount').html()
                // count = parseInt(count)+1
                // $('#cartCount').html(count)
                document.getElementById("wishbtn").style.display = "none";
                document.getElementById("dltbtnwish").style.visibility = "";
                }
            else{
                location.href= '/signin'
            }
        }
    })
}

function deleteWish(prodId) {
     
    $.ajax({
      url: '/delete-wishProduct/'+ prodId,
      method: 'get',
      success: (response) => {
        if (response) {
         
          location.reload()
        }
      }
    })
  }

  function deleteProdOffer(proId){
    $.ajax({
        url:'/admin/delete-prod-offer/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){ 
                swal({
                    title: "Delete the Offer!!!",
                    type:'success',
                    timer: 500
                  });
                  location.reload()
            }
            else{
                alert('dfghj')
            }
        }
    })
}
function deleteCatOffer(proId){
    $.ajax({
        url:'/admin/delete-cat-offer/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){ 
                swal({
                    title: "Delete the Offer!!!",
                    type:'success',
                    timer: 500
                  });
                  location.reload()
            }
            else{
                alert('dfghj')
            }
        }
    })
}


function deleteCouponCode(proId){
    $.ajax({
        url:'/admin/delete-coupon-offer/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){ 
                swal({
                    title: "Delete the Offer!!!",
                    type:'success',
                    timer: 500
                  });
                  location.reload()
            }
            else{
                alert('dfghj')
            }
        }
    })
}