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
    videoMeOffer.textContent =
      window.btoa(unescape(encodeURIComponent(
        JSON.stringify(data)
      )));
  });

  p.on('stream', stream => {
    videoOther.srcObject = stream;
    videoOther.play();
  });

  videoJoin.addEventListener('click', () => {
    p.signal(
      JSON.parse(
        decodeURIComponent(escape(window.atob(
          videoOtherOffer.value
        )))
      )
    );
  });
}

const startPeer = initiator => {
  navigator.mediaDevices.enumerateDevices().then(devices => {
    if (Array.isArray(devices)) {
      const kinds = devices.map(d => d.kind);
      const video = kinds.includes('videoinput');
      const audio = kinds.includes('audioinput');
      navigator.mediaDevices.getUserMedia({
        video,
        audio,
      }).then(stream => {
        let p = new SimplePeer({
          initiator,
          stream,
          config: peerConfig,
          trickle: false,
        });
        bindEvents(p);
        videoMe.srcObject = stream;
        videoMe.play();
      }).catch(err => console.error('error', err));
    }
  }).catch(err => console.log(err));
}

videoStart.addEventListener('click', () => startPeer(true));
videoGet.addEventListener('click', () => startPeer(false));
videoMeOffer.addEventListener('click', () => {
  videoMeOffer.select();
  document.execCommand('copy');
});
