import { client, audioContext } from 'soundworks/client';

export function rampParam(audioParam, value, rampDuration) {
  if (client.platform.os === 'ios') {
    audioParam.value = value;
  } else {
    const now = audioContext.currentTime;
    audioParam.setValueAtTime(audioParam.value, now);
    audioParam.linearRampToValueAtTime(value, now + rampDuration);
  }
}

export function setParam(audioParam, value) {
  if (client.platform.os === 'ios') {
    audioParam.value = value;
  } else {
    const now = audioContext.currentTime;
    audioParam.value = value;
    audioParam.setValueAtTime(value, now);
  }
}
