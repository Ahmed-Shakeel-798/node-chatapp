const socket = io();

// elements
let $messageForm = document.querySelector("#message-form");
let $formMessage = document.querySelector("#message");
let $formButton = document.querySelector("#message-submit");
let $locationButton = document.querySelector("#send-location");
let $messages = document.querySelector("#messages");

// template
let messageTemplate = document.querySelector("#message-template").innerHTML;
let locationTemplate = document.querySelector("#location-template").innerHTML;
let sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// options
const {userName,roomName} = Qs.parse(location.search,{ignoreQueryPrefix: true});

// autoscrolling
const autoScroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild;

    // getting height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // current visible height of messages container
    const visibleHeight = $messages.offsetHeight;

    // total height of messages container
    const containerHeight = $messages.scrollHeight;

    // how much have we already scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }
}


//  new messages
socket.on("message", (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        userName: message.userName,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm a'),
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoScroll();
});

// location messages
socket.on("locationMessage",(message)=>{
    console.log(message);
    const html = Mustache.render(locationTemplate,{
        userName: message.userName,
        url: message.url,
        createdAt: moment(message.createdAt).format('hh:mm a'),
    
    });
    $messages.insertAdjacentHTML('beforeend',html);
});

// room list update
socket.on('roomData',({roomName,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        roomName,
        users, 
    });
    document.querySelector("#sidebar").innerHTML = html;
});

// form filing
$messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    $formButton.setAttribute("disabled","disabled");

    let message = $formMessage.value;
    socket.emit("newMessage", message, (error)=>{
        $formButton.removeAttribute("disabled");
        $formMessage.value = "";
        $formMessage.focus();
        if(error){
            return console.log(error)
        }
        console.log("Message delivered!");
    });
});

// location fetching
$locationButton.addEventListener("click", (e) => {
    if (!navigator.geolocation) {
        return alert("Sorry this function is not available on your brower. Please try updating your browser");
    }

    $locationButton.setAttribute("disabled","disabled");
    navigator.geolocation.getCurrentPosition((position) => {

        lat = position["coords"]["latitude"],
        long = position["coords"]["longitude"]
        let locationObj = {
            lat,
            long
        };
        socket.emit("sendLocation",locationObj,()=>{
            console.log("location shared");
            $locationButton.removeAttribute("disabled");
        });
        

    });
});

// user joining
socket.emit('join',{userName,roomName},(error)=>{
    if(error){
        alert(error);
        location.href = '/';
    }
});
