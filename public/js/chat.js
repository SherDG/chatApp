
//server emit on start(index.js) --> client/socket receive (chat.js)
// client/socket emit --> server receive 


const socket = io();

//ELEMENTS
const $messageForm = document.querySelector('#message_form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send_location');
const $messages = document.querySelector('#messages');

//TEMPLATES
const $messageTemplate = document.querySelector('#message_template').innerHTML;
const $locationTemplate = document.querySelector('#location_template').innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar_template').innerHTML;

//OPTIONS
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }); //Qs will be imported in chat.html
// console.log(username)

const autoScroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild;

    //new message height
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // console.log(newMessageMargin);

    //visible height
    const visibleHeight = $messages.offsetHeight;

    //height of messages container
    const containerHeight = $messages.scrollHeight;

    //how far I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;
    // console.log("containerHeight - newMessageHeight:", containerHeight - newMessageHeight);
    // console.log("scrollOffset:", scrollOffset);

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
};

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render($messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm:ss a")
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('locationMessage', (message) => {
    console.log(message);
    const html = Mustache.render($locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format("h:mm:ss a")
    });
    $messages.insertAdjacentHTML('beforeend', html)
    // const html = Mustache.render($messageTemplate, { message: message });
    // $messages.insertAdjacentHTML('beforeend', html)
});


socket.on('roomData', ({ room, users }) => {
    // console.log(room);
    // console.log(users);

    const html = Mustache.render($sidebarTemplate, { room, users });
    document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault(); // prevents browser rom refresh
    $messageFormButton.setAttribute('disabled', 'disabled');
    // console.log("Sumbited text");
    // const message = document.querySelector('input').value;
    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (dataFromCallback) => {
        //MESSAGE FIELD DISABLING DURING SENDING
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (dataFromCallback) {
            return console.log(dataFromCallback)
            // return alert(dataFromCallback);
        }
        console.log("Message delivered!", message)
    });
});

$sendLocationButton.addEventListener('click', (e) => {
    if (!navigator.geolocation) {
        return alert("Geolocation ain't supported by your browser.")
    }
    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {

        console.log("Location sent", position);
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },
            (message) => {
                $sendLocationButton.removeAttribute('disabled');
                console.log(message)
            });
    });
});

// socket.on('countUpdated', (count) => {
//     console.log("Count Updated.", count);
// });

// document.querySelector('#increment').addEventListener('click', ()=>{
//     console.log("Clicked");
//     socket.emit('increment')
// });
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = "/" // используется библиотека Qs и её переменная location
    }
});