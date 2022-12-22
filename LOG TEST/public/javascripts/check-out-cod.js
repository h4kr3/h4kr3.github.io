$("#checkout-form").submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:'/place-order',
        method:'post',
        data:$('#checkout-form').serialize(),
        success:((res)=>{
            if(res.status){
                location.href='/order-list'
            }
        })
    })
 })

 