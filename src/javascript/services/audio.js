export default function initAudio($) {
  $.audio = document.createElement('audio'); // new Audio();

  for (let attr of $.attributes) {
    $.audio.setAttribute(attr.name, attr.value);
  }

  // Update play button icon when audio is ended
  $.audio.addEventListener('ended', () => {
    $.audio.currentTime = 0;
  });
}
