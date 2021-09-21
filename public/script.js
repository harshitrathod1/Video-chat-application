//html elements
const videoGrid = document.getElementById('video-grid'); 
const myVideo = document.createElement('video');
myVideo.muted = true;

//socket connection on frontend
const socket = io('/');

//peer connection
var peer = new Peer(undefined,{ 
    path : '/peerjs', 
    host : '/', 
    port : '3030' 
});



//setting up video connection
let myVideoStream;

const constraints = {
        'video': true,
        'audio': true
}

navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {

        myVideoStream = stream;
        addVideoStream(myVideo,stream);
        
        //answer his call
        peer.on('call',(call) => {
            console.log("Hey answer the call");
            call.answer(stream);
            
            const video = document.createElement('video')
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream);
            })
        });

        //when user is connected call him
        socket.on('user-connected',(user_id) => {
            console.log("Hey someone just Joined" + user_id);
            setTimeout(() => {
                connectToNewUser(user_id,stream);
            },1000);
            
            //setTimeout(connectToNewUser,1000,user_id,stream);
            //connectToNewUser(user_id,stream);
        }); 

    })
    .catch(error => {
        console.error('Error accessing media devices.', error);
    });
    


//socket code
peer.on('open',(user_id) => {
    socket.emit('join-room',ROOM_ID,user_id);
});

const connectToNewUser = (user_id,stream) => {
    console.log("Connecting to new user");
    //call the peer
    const call = peer.call(user_id,stream);
    //create a video element for him on my screen
    const video = document.createElement('video');
    
    call.on('stream',(userVideoStream) => {
        console.log(userVideoStream);
        addVideoStream(video, userVideoStream);
    });
    
    
};


//add video stream
const addVideoStream = (video,stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata',() => {
        video.play();
    });
    
    videoGrid.append(video); // video is myVideo in global scope
}


//handling chat
let text = $('input');

$('html').keydown((e) => {
    if(e.which == 13 && text.val().length > 0){
        console.log(text.val());
        socket.emit('message',text.val());
        text.val('');
    }
})

socket.on('createMessage', (message) => {
    $('.messages').append(`<li class ="message"><b>user</b></br>${message}</li>`);
    scrollToBottom();
});

const scrollToBottom = () => {
    let d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;

    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUmuteButton();
    }else{
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {

    const html =  
    `
    <i class="fas fa-microphone"></i>
    <span>Mute</span> 
    `

    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUmuteButton = () => {
    
    const html = 
    `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span> 
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideoIcon()
    } else {
      setStopVideoIcon()
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
  }
  
const setStopVideoIcon = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
  }
  
  const setPlayVideoIcon = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
  }