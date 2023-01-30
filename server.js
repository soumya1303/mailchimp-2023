const express = require('express');
const app = express();
const https = require('https');
const PORT = process.env.PORT || 3000;
const fs = require('fs');

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("html"));

app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/html/signup.html');
});

app.post('/', (req, res)=>{

    try {
            const f_name = req.body.f_name;
            const s_name = req.body.s_name;
            const em_id = req.body.em_id;

            const membersdata = {
                members:[{
                    email_address:em_id,
                    email_type:'html',
                    status:'subscribed',
                    merge_fields:{
                        FNAME:f_name,
                        LNAME:s_name   
                    }
                }]
            };
            
            const postingObjectStringified = JSON.stringify(membersdata);
            const skip_merge_validation=true;
            const skip_dup_check=true;
            const dc = 'us6';
            const listId= 'ee54c5bacb';
            var api_key='';
            var option={}
            fs.readFile(__dirname+'/mailchimp_api_key', (err, data)=>{
                api_key=String(data);
                option={
                    auth:'som:'+api_key,
                    method:'POST'
                }
                console.log(option);
            });
            
            const target='https://'+dc+'.api.mailchimp.com/3.0/lists/'+listId+'?skip_merge_validation='+skip_merge_validation+'&skip_duplicate_check='+skip_dup_check;

            try {
                const conn = https.request(target, option, (resp)=>{

                    if (resp.statusCode===200){
            
                        resp.on("data", (data)=>{
                            const data_JSON = JSON.parse(data);
                            
                            if (data_JSON.error_count===0 || data_JSON.error_count === undefined){
                                console.log("Account created. Redirecting to success.html");
                                res.sendFile(__dirname + "/html/success.html");
                            }
                            else{
                                res.sendFile(__dirname + "/html/failure.html");
                            }
                        });
            
                    }else{
                        console.log('Connection failure. Error code [' + resp.statusCode +']');
                        console.log(__dirname);
                        res.sendFile(__dirname + "/html/failure.html");
                    }
            
                });
                conn.write(postingObjectStringified);
                conn.end();
                
            } catch (error) {
                console.log("Some Error Happened.");
                res.sendFile(__dirname + "/html/failure.html");
            }
    } catch (error) {
        console.log("Some Error Happened.");
        res.sendFile(__dirname + "/html/failure.html");
    }

    

});

app.listen(PORT, (e)=>{
    console.log('Server started in running mode');
});
