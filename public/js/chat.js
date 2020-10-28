




const socket = io();
// accessing socket from sever on client side





// Elemets start *******************************

const $messageForm = document.querySelector('#messageOfForm');

const $InputOfMessageForm = $messageForm.querySelector('input');

const $ButtonOfMessageForm = $messageForm.querySelector('button')

const $shareLocationButton = document.querySelector('#shareLocationButton')

const $messages = document.querySelector('#messages')
const $chatSidebars = document.querySelector('#sidebar')


//Elements end ********************************

// functions start*************************************

const capitalize = (name) => // Capitalize first letter of each word in name
{
    let newName = '';
    newName += name.charAt(0).toUpperCase();

    let i = 1;
    while (true) {
        while (i < name.length && name[i] != ' ') {
            newName += name[i];
            i++;
        }
        if (i == name.length) return newName;

        newName += name[i];
        i++// skipping space

        newName += name.charAt(i).toUpperCase();
        i++;
        while (i < name.length && name[i] != ' ') {
            newName += name[i];
            i++;
        }
        if (i == name.length) return newName;

    }

}


//function  end ******************************************



// Templates start **************************************

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar_template').innerHTML;

//Templates end *****************************************



//Options start **********************

let { userName, chatRoom } = Qs.parse(location.search, { ignoreQueryPrefix: true });
userName = capitalize(userName)

//Options end *************************



const autoScroll = () => {
    // new message elemet
    const $newMessages = $messages.lastElementChild;

    // style of new element
    const newMessagesStyles = getComputedStyle($newMessages);
    const newMeassageMargin = parseInt(newMessagesStyles.marginBottom);

    // hight of new element
    const newMessagesHeight = $newMessages.offsetHeight + newMeassageMargin;

    // visible height
    const visibleHeight = $messages.offsetHeight;


    // container height
    const containerHeight = $messages.scrollHeight;


    // how far i have scrolled

    const scrolloffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessagesHeight <= scrolloffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }

}



socket.on('message', (message) => {

    const fromatedMessage = {
        message: message.message,
        createdAt: moment(message.createdAt).format('h:mm:ss A'),
        // moment library is loaded in script tag in index.html
        userName: message.userName


    }
    const html = Mustache.render(messageTemplate, fromatedMessage);


    $messages.insertAdjacentHTML('beforeend', html);
      autoScroll();

})

socket.on('sharingLocation', (url) => {
    console.log(url);
    const Url = Mustache.render(locationTemplate,
        {
            locationMessage: 'My current Location',
            location: url.message,
            createdAt: moment(url.createdAt).format('h:mm:ss A'),
            userName: url.userName
        })
    $messages.insertAdjacentHTML('beforeend', Url);

     autoScroll();

})


socket.on('listOfUsersInRoom', ({ chatRoom, users }) => {

    const html = Mustache.render(sidebarTemplate, {
        chatRoom,
        users
    });

    $chatSidebars.innerHTML = html;
})


$messageForm.addEventListener('submit', (event) => {
    event.preventDefault(); // to prevents page from refreshing
    //const inputMessage=document.querySelector('input').value;

    $ButtonOfMessageForm.setAttribute('disabled', 'disabled');
    // disabling message sending button to avoid multiple clicks

    const inputMessage = event.target.elements.input_message.value;
    // this will help to avoid crashing if there are more (form input) on client side
    // inputMessage = filter.clean(inputMessage)
    socket.emit('sendMessage', inputMessage,

        (messagebackfromserver) => {
            console.log('Message was Delivered', messagebackfromserver);
        }

    );
    $ButtonOfMessageForm.removeAttribute('disabled');
    $InputOfMessageForm.value = '';
    // after sending message clearing old input message

    $InputOfMessageForm.focus();
    // moving  cursor back  to input of the form

})


$shareLocationButton.addEventListener('click', (e) => {
    e.preventDefault();

    if (!navigator.geolocation) {
        return alert('Geolocation is Not Supported by the browser');
    }
    alert("You Are Sharing Your Geolocation!");
    $shareLocationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {

        const Mylocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('shareLocation', Mylocation, (locationMessage) => {
            $shareLocationButton.removeAttribute('disabled');
            console.log(locationMessage)

        })

    })

})

console.log(userName);
console.log(chatRoom);
socket.emit('join', { userName, chatRoom }, (error) => {
    if (error) {
        alert(error);
        location = '/' //moving to root of the page(Back To Joining Page)
    }

})

