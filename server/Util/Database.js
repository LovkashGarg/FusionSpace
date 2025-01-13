const mongoose=require('mongoose');

require('dotenv').config()


exports.dbConnect=()=>{
        mongoose.connect(process.env.DATABASE_URL,{
        })
        .then(()=>{
            console.log("DB ka connection Successful ho gya");
        })
        .catch((err)=>{
            console.log("Some DB issues")
            console.error(err);
            process.exit(1);
        })
}