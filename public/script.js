const login_form = document.getElementById('login-form');
const reg_form = document.getElementById('reg-form');
const reg_name = document.getElementById('reg-name');
const reg_userid = document.getElementById('reg-userid');
const reg_passwd = document.getElementById('reg-passwd');
const reg_cnf_passwd = document.getElementById('reg-cnf-passwd');
const in_userid = document.getElementById('in-userid');
const in_passwd = document.getElementById('in-passwd');

// login_form.addEventListener('submit', e=>{
//     // e.preventDefault();
//     validateLoginInputs();
//     return true;
// });

// reg_form.addEventListener('submit', e=>{
//     e.preventDefault();
//     validateRegInputs();
//     return true;
// });

const validateLoginInputs = () =>{
    const useridValue = in_userid.value.trim();
    const passwdValue = in_passwd.value.trim();

    let validationFailedFlag = false;
    
    if(useridValue===''){
        setError(in_userid, 'User Id is required');
        validationFailedFlag = true;
    } 
    else setSuccess(in_userid);

    if(passwdValue===''){
        setError(in_passwd, 'Password is required');
        validationFailedFlag = true;
    } 
    else if(passwdValue.length<8){
        setError(in_passwd, 'Password must be atleast 8 character.');
        validationFailedFlag = true;
    } 
    else setSuccess(in_passwd);
    return !validationFailedFlag;
}


const validateRegInputs = () =>{
    const name_value = reg_name.value.trim();
    const userid_value = reg_userid.value.trim();
    const passwd_value = reg_passwd.value.trim();
    const reg_cnf_passwd_value = reg_cnf_passwd.value.trim();

    let validationFailedFlag = false;

    if(name_value===''||reg_name===null){
        setError(reg_name, 'Name is required.');
        validationFailedFlag = true;
    } 
    else if(!validateUserName(reg_name)){
        setError(reg_name, 'Name must contains only Alphabets.');
        validationFailedFlag = true;
    } 
    else setSuccess(reg_name);

    if(userid_value===''){
        setError(reg_userid, 'User Id is required.');
        validationFailedFlag = true;
    } 
    else if(userid_value.length<5){
        setError(reg_userid, 'User must be atleast 5 characters.');
        validationFailedFlag = true;
    } 
    else setSuccess(reg_userid);

    if(passwd_value===''){
        setError(reg_passwd, 'Password is required.');
        validationFailedFlag = true;
    } 
    else if(passwd_value.length<8){
        setError(reg_passwd, 'Password must be atleast 8 characters.')
        validationFailedFlag = true;
    } 
    else setSuccess(reg_passwd)

    if(reg_cnf_passwd_value===''){
        setError(reg_cnf_passwd, 'Password is required');
        validationFailedFlag = true;
    } 
    else{ 
        if(reg_cnf_passwd_value!==passwd_value){
            setError(reg_cnf_passwd, 'Password and Confirm Password should be same.');
            validationFailedFlag = true;
        } 
        else setSuccess(reg_cnf_passwd);
    }
    return !validationFailedFlag;
}


function validateUserName(username){
    var usernameRegex = /^[a-zA-Z ]+$/;
    if(username.value.match(usernameRegex)) return true;
    return usernameRegex.test(username);
}

const setError = (element, message)=>{
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
}

const setSuccess = (element)=>{
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
}

const validatePost = () => {
    const asset = document.getElementById('upload-asset');
    var validated = true;
    if(asset.files.length == 0 ){
        validated = false;
        setFileError(asset, 'No file selected');
    }
    else {
        validated = true;
        setSuccess(asset);
    }
    return validated;
}
const setFileError = (element, message)=>{
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
}