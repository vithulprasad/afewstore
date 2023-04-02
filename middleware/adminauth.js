const isLogin = async(req,res,next)=>{
    console.log("TRYING TO LOGIN");
    try {
        if(req.session.user_id){
           
            console.log ("SESSION IS LOGIN")
        }
        else{
            console.log('Else')
            res.redirect('/admin')
        }
        next();
    } catch (error) {
    console.log('is login error in admin session ',error.message);
    

    }
}

const isLogout = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/admin/home')
            
            console.log ("SESSION IS LOGOUT")
        }
        next();
    } catch (error) {
       console.log('is log out error in admin error',error.message); 
    }
}

module.exports = {
    isLogin,
    isLogout
}