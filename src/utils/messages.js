const generateMessage=(userName,message)=>
{

    return {
        userName:userName,
        message:message,
        createdAt:new Date().getTime()
    }
}


module.exports=
{
    generateMessage
}