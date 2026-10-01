import readline from 'node:readline/promises';
import {stdin,stdout} from 'node:process';
const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.');
const prompt=readline.createInterface({input:stdin,output:stdout});
const email=await prompt.question('Responder email: ');
const name=await prompt.question('Full name: ');
// Hide password characters while preserving normal readline input handling.
const original=prompt._writeToOutput.bind(prompt);
stdout.write('Password (hidden): ');
prompt._writeToOutput=()=>{};
const password=await prompt.question('');
prompt._writeToOutput=original;stdout.write('\n');prompt.close();
if(password.length<12)throw Error('Use a password of at least 12 characters.');
const r=await fetch(url+'/auth/v1/admin/users',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({email,password,email_confirm:true,user_metadata:{full_name:name}})});
if(!r.ok){console.error('Account creation failed. Check the email, password requirements, and service role key. Status:',r.status);process.exit(1)}
console.log('Confirmed responder account created.');
