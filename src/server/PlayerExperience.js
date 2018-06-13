import { Experience } from 'soundworks/server';

const groupRegExp = /^\/([A-Za-z0-9\-]+)\/.*/;

// server-side 'player' experience.
class PlayerExperience extends Experience {
  constructor(clientType, score) {
    super(clientType);

    this.score = score;

    this.checkin = this.require('checkin');
    this.sharedConfig = this.require('shared-config');
    this.sharedParams = this.require('shared-params');
    this.audioBufferManager = this.require('audio-buffer-manager');

    this.osc = this.require('osc');

    this.groupPlayersMap = new Map();
    this.score.forEach(group => this.groupPlayersMap.set(group.label, new Set()));
  }

  start() {

  }

  enter(client) {
    super.enter(client);

    const groupIndex = client.index % this.score.length;
    const groupLabel = this.score[groupIndex].label;
    client.groupLabel = groupLabel;
    // add to the group
    const groupSet = this.groupPlayersMap.get(groupLabel);
    groupSet.add(client);

    // for testing purpose only
    this.receive(client, '/stream-position', (x, y) => {
      this.osc.send('/stream-position', [x, y]);
    });
  }

  exit(client) {
    const groupSet = this.groupPlayersMap.get(client.groupLabel);
    groupSet.delete(client);

    super.exit(client);
  }

  dispatch(channel, value) {
    const match = channel.match(groupRegExp);

    if (match === null)
      console.error(`${channel} does not match any group`);

    const groupLabel = match[1];
    const clients = this.groupPlayersMap.get(groupLabel);

    clients.forEach(client => this.send(client, channel, value));
  }
}

export default PlayerExperience;
