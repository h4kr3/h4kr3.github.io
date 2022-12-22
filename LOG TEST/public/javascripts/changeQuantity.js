


function changeQuantity(cartId, prodId,stock,userId ,count) {
    let quantity = parseInt(document.getElementById(prodId).innerHTML)
    count = parseInt(count)

    quantityCheck = quantity + count
    console.log(quantityCheck);
    stock = parseInt(stock)
    if (quantityCheck <= stock && quantityCheck != 0) {
      document.getElementById("minus" + prodId).classList.remove("invisible")
      document.getElementById("plus" + prodId).classList.remove("invisible")
      $.ajax({
        url: '/change-product-quantity',
        data: {
            user :userId,
            cart: cartId,
            product: prodId,
            count: count
        },
        type: 'post',
        success: (response) => {      
            document.getElementById(prodId).innerHTML = quantity + count;
            document.getElementById('total').innerHTML = response.total
        }
      })
    }
    if (quantityCheck == 1) {
      document.getElementById("minus" + prodId).classList.add("invisible")
    }
    if (quantityCheck == stock) {
      document.getElementById("plus" + prodId).classList.add("invisible")
    }
  }




function deleteCart(prodId) {
     
          $.ajax({
            url: '/delete-cartProduct/'+ prodId,
            method: 'get',
            success: (response) => {
              if (response) {
               
                location.reload()
              }
            }
          })
        }
      


function cancelOrder(orderId){

  $.ajax({
    url:'/cancel-order/'+orderId,
    method:'get',
    success:(response)=>{
      if(response){
        location.reload()
      }
    }
  })
}

function orderShipped(orderId){

  $.ajax({
    url:'/shipped-order/'+orderId,
    method:'get',
    success:(response)=>{
      if(response){
        location.reload()
      }
    }
  })
}
function orderDelivered(orderId){

  $.ajax({
    url:'/delivered-order/'+orderId,
    method:'get',
    success:(response)=>{
      if(response){
        location.reload()
      }
    }
  })
}

