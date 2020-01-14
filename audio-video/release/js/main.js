/**
 * Strict mode makes it easier to write "secure" JavaScript.
 * Strict mode changes previously accepted "bad syntax" into real errors.
 */
'use strict';

/**
 * ***********************************************************************
 * Media stream constant and parameters.
 * ***********************************************************************
 */

 /**
  * The mediaStreamConstraints argument allows to specify what media to get.
  */
const mediaStreamConstraints = {
  audio: true,
  video: true,
};

var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;

var pcConfig = {
  'iceServers': [
    {
      'urls': 'stun:stun.l.google.com:19302'
    },
    {
      'urls': 'turn:chatalk@turn.chatalk.fr:3478',
      'credential': 'xongah3ieR4ashie7aekeija',
    },
  ],
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};

var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

var room = 'foo';
// Could prompt for room name:
// room = prompt('Enter room name:');

/**
 * ***********************************************************************
 * Signaling server.
 * ***********************************************************************
 */

// Connect to the signaling server.
var socket = io.connect();

if (room !== '') {
  socket.emit('create or join', room); // Joining a room.
  console.log(time() + ' Attempted to create or join room', room);
}

// The client receives this message when a room is created.
socket.on('created', function(room) {
  console.log(time() + ' Created room ' + room);
  isInitiator = true;
});

// The client receives this message when a room is full (> 2 participants).
socket.on('full', function(room) {
  console.log(time() + 'Room ' + room + ' is full');
});

// The initiator client receives this message when he joins the room.
socket.on('join', function (room){
  console.log(time() + ' Another peer made a request to join room ' + room);
  console.log(time() + ' This peer is the initiator of room ' + room + '!');
  isChannelReady = true;
});

// The client receives this message when a participant joins the room.
socket.on('joined', function(room) {
  console.log(time() + ' joined: ' + room);
  isChannelReady = true;
});

// Logs from the server
socket.on('log', function(array) {
  console.log.apply(console, array);
});

/**
 * Send message to signaling server.
 * @param {*} message
 */
function sendMessage(message) {
  console.log(time() + ' Client sending message: ', message);
  socket.emit('message', message);
}

// The client receives a message
socket.on('message', function(message) {
  console.log(time() + ' Client received message: ', message);
  if (message === 'got user media') {
    maybeStart();
  }
  else if (message.type === 'offer') {
    if (!isInitiator && !isStarted) {
      maybeStart();
    }
    pc.setRemoteDescription(new RTCSessionDescription(message));
    doAnswer();
  }
  else if (message.type === 'answer' && isStarted) {
    pc.setRemoteDescription(new RTCSessionDescription(message));
  }
  else if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc.addIceCandidate(candidate);
  }
  else if (message === 'bye' && isStarted) {
    handleRemoteHangup();
  }
});

/**
 * ***********************************************************************
 * Define MediaStreams callbacks.
 * ***********************************************************************
 */

 /**
  * Sets the MediaStream as the video element src.
  * @param {*} stream
  */
function gotStream(stream) {
  console.log(time() + ' Adding local stream.');
  localStream = stream;
  localVideo.srcObject = stream;
  sendMessage('got user media');
  if (isInitiator) {
    maybeStart();
    console.log(time() + ' Starting call.');
  }
}

var constraints = {
  audio: true,
  video: true
};

console.log(time() + ' Getting user media with constraints', constraints);

if (location.hostname !== 'localhost') {
  requestTurn(
    'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
  );
}

/**
 * Starts a conversation (only if all conditions are reunited)
 */
function maybeStart() {
  console.log(time() + ' >>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
  if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
    console.log(time() + ' >>>>>> creating peer connection');
    createPeerConnection();
    pc.addStream(localStream);
    isStarted = true;
    console.log(time() + ' isInitiator ', isInitiator);
    if (isInitiator) {
      doCall();
    }
  }
}

window.onbeforeunload = function() {
  sendMessage('bye');
};

/**
 * ***********************************************************************
 * Define RTC peer connection behavior.
 * ***********************************************************************
 */

 /**
  *
  */
function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(null);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    console.log(time() + ' Created RTCPeerConnnection');
  }
  catch (e) {
    console.log(time() + ' Failed to create PeerConnection, exception: ', e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}

/**
 *
 * @param {*} event
 */
function handleIceCandidate(event) {
  console.log(time() + ' icecandidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  } else {
    console.log(time() + ' End of candidates.');
  }
}

/**
 *
 * @param {*} event
 */
function handleCreateOfferError(event) {
  console.log(time() + ' createOffer() error: ', event);
}

/**
 *
 */
function doCall() {
  console.log(time() + ' Sending offer to peer');
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

/**
 *
 */
function doAnswer() {
  console.log(time() + ' Sending answer to peer.');
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

/**
 *
 * @param {*} sessionDescription
 */
function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  console.log(time() + ' setLocalAndSendMessage sending message', sessionDescription);
  sendMessage(sessionDescription);
}

/**
 *
 * @param {*} error
 */
function onCreateSessionDescriptionError(error) {
  console.log(time() + ' Failed to create session description: ' + error.toString());
}

/**
 *
 * @param {*} turnURL
 */
function requestTurn(_turnURL) {
  var turnExists = false;
  for (var i in pcConfig.iceServers) {
    if (pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
      turnExists = true;
      turnReady = true;
      break;
    }
  }
  if (!turnExists) {
    pcConfig.iceServers.push({
      'urls': 'turn:chatalk@turn.chatalk.fr:3478',
      'credential': 'xongah3ieR4ashie7aekeija',
    });
    turnReady = true;
  }
}

/**
 *
 * @param {*} event
 */
function handleRemoteStreamAdded(event) {
  console.log(time() + ' Remote stream added.');
  remoteStream = event.stream;
  remoteVideo.srcObject = remoteStream;
}

/**
 *
 * @param {*} event
 */
function handleRemoteStreamRemoved(event) {
  console.log(time() + ' Remote stream removed. Event: ' + event);
}

/**
 * Hangup when clicking on button
 */
function hangup() {
  console.log(time() + ' Hanging up.');
  stop();
  sendMessage('bye');
}

/**
 * Hangup when another peer ends conversation
 */
function handleRemoteHangup() {
  console.log(time() + ' Session terminated.');
  stop();
  isInitiator = false;
}

/**
 * End the conversaton
 */
function stop() {
  isStarted = false;
  pc.close();
  pc = null;
}

/**
 * ***********************************************************************
 * Define and add behavior to buttons.
 * ***********************************************************************
 */

/**
 * Define action buttons.
 */
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');

/**
 * Set up initial action buttons status: enable call and disable hangup.
 */
callButton.disabled = false;
hangupButton.disabled = true;

/**
 * Handles call button action: creates MediaStream.
 */
function callAction() {
  hangupButton.disabled = false;
  callButton.disabled = true;
  navigator.mediaDevices.getUserMedia(mediaStreamConstraints).then(gotStream).catch(function(e) {
    alert('getUserMedia() error: ' + e.name);
  });
  console.log(time() + ' Requesting local stream.');
}

/**
 * Handles hangup action: ends up call, closes connections and resets peers.
 */
function hangupAction() {
  hangup();
  hangupButton.disabled = true;
  callButton.disabled = false;
  console.log(time() + ' Ending call.');
}

/**
 * Add click event handlers for buttons.
 */
callButton.addEventListener('click', callAction);
hangupButton.addEventListener('click', hangupAction);

/**
 * ***********************************************************************
 * Define helper functions.
 * ***********************************************************************
 */

/**
 * Gives the time
 */
function time() {
  const now = (window.performance.now() / 1000).toFixed(3);
  return now;
}
