import { Experience } from 'soundworks/server';

// server-side 'player' experience.
export default class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

    this.checkin = this.require('checkin');
    this.sharedConfig = this.require('shared-config');
    this.sharedParams = this.require('shared-params');
    this.audioBufferManager = this.require('audio-buffer-manager');

    this.osc = this.require('osc');
  }

  start() {

  }

  enter(client) {
    super.enter(client);

    this.receive(client, '/stream-position', (x, y) => {
      this.osc.send('/stream-position', [x, y]);
    });
  }

  exit(client) {
    super.exit(client);
  }
}
