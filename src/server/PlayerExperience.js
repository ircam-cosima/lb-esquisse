import { Experience } from 'soundworks/server';

// server-side 'player' experience.
export default class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

    this.checkin = this.require('checkin');
    this.sharedConfig = this.require('shared-config');
    // this.audioBufferManager = this.require('audio-buffer-manager');
    this.sharedParams = this.require('shared-params');
  }

  // if anything needs to append when the experience starts
  start() {

  }

  // if anything needs to happen when a client enters the performance (*i.e.*
  // starts the experience on the client side), write it in the `enter` method
  enter(client) {
    super.enter(client);

    //
  }

  exit(client) {
    super.exit(client);

    //
  }
}
