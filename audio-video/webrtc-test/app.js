const videoMe = document.getElementById('video-me');
const videoOther = document.getElementById('video-other');
const videoStart = document.getElementById('video-start');
const videoMeOffer = document.getElementById('video-me-offer');
const videoOtherOffer = document.getElementById('video-other-offer');
const videoJoin = document.getElementById('video-join');
const videoGet = document.getElementById('video-get');

const peerConfig = {
  iceServers: [
    {
      'urls': 'stun:turn.chatalk.fr:3478',
      'username': 'chatalk',
      'credential': 'xongah3ieR4ashie7aekeija',
    },
    {
      'urls': 'turn:turn.chatalk.fr:3478',
      'username': 'chatalk',
      'credential': 'xongah3ieR4ashie7aekeija',
    },
  ],
};

const bindEvents = p => {
  p.on('error', err => {
    console.error('error', err);
  });

  p.on('signal', data => {
    videoMeOffer.textContent = JSON.stringify(data);
  });

  p.on('stream', stream => {
    videoOther.srcObject = stream;
    videoOther.play();
  });

  videoJoin.addEventListener('click', () => {
    p.signal(JSON.parse(videoOtherOffer.value))
  });
}

const startPeer = initiator => {
  navigator.getUserMedia({
    video: true,
    audio: true,
  }, stream => {
    let p = new SimplePeer({
      initiator,
      stream,
      config: peerConfig,
      trickle: false,
    });
    bindEvents(p);
    videoMe.srcObject = stream;
    videoMe.play();
  }, () => {

  });
}

videoStart.addEventListener('click', () => startPeer(true));
videoGet.addEventListener('click', () => startPeer(false));
