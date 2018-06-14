import 'source-map-support/register'; // enable sourcemaps in node
import path from 'path';
import * as soundworks from 'soundworks/server';
import PlayerExperience from './PlayerExperience';
import throttle from 'lodash.throttle';
// score
import score from '../../score/model';

const configName = process.env.ENV || 'default';
const configPath = path.join(__dirname, 'config', configName);
let config = null;

// rely on node `require` for synchronicity
try {
  config = require(configPath).default;
} catch(err) {
  console.error(`Invalid ENV "${configName}", file "${configPath}.js" not found`);
  process.exit(1);
}

// configure express environment ('production' enables express cache for static files)
process.env.NODE_ENV = config.env;
// override config if port has been defined from the command line
if (process.env.PORT)
  config.port = process.env.PORT;

// initialize application with configuration options
soundworks.server.init(config);

// define the configuration object to be passed to the `.ejs` template
soundworks.server.setClientConfigDefinition((clientType, config, httpRequest) => {
  return {
    clientType: clientType,
    env: config.env,
    appName: config.appName,
    websockets: config.websockets,
    version: config.version,
    defaultType: config.defaultClient,
    assetsDomain: config.assetsDomain,
  };
});

// serve config file (score)
soundworks.server.router.get('/config', (req, res) => {
  if (config.env === 'production') {
    res.json(JSON.stringify(score));
  } else {
    const _score = require('../../score/model');
    res.json(JSON.stringify(_score));
  }
});

// init clients
const experience = new PlayerExperience('player', score);
const controller = new soundworks.ControllerExperience('controller', { auth: true });

const throttledCallbacks = new Map();

function initThrottledOscCallback(channel) {
  throttledCallbacks.set(channel, () => {});

  osc.receive(channel, value => {
    const throttledCallback = throttledCallbacks.get(channel);
    throttledCallback(value);
  });
}

function updateThrottledOscCallbacks(wait) {
  wait = Math.max(20, Math.min(1000, wait)); // clamp between 20 and 1000 ms;
  console.log(`Throttle at ${wait}ms`);

  for (let [channel, fn] of throttledCallbacks) {
    const callback = throttle(value => dispatch(channel, value), wait);
    throttledCallbacks.set(channel, callback);
  }
}

function dispatch(channel, value) {
  experience.dispatch(channel, value);
  // controller.dispatch(channel, value);
  controller.broadcast('controller', null, channel, value);
}

// create params channels and tunneling
const sharedParams = soundworks.server.require('shared-params');
const osc = soundworks.server.require('osc');

sharedParams.addText('numPlayers', 'numPlayers', 0, ['controller']);

sharedParams.addBoolean('/debug', 'debug', false);
sharedParams.addBoolean('/emulateMvmt', 'emulateMvmt', false);

// common params
sharedParams.addTrigger('/reload', 'reload');
// states
sharedParams.addEnum('/state', '/state', ['testing', 'title', 'performance', 'end'], 'testing');
osc.receive('/state', state => sharedParams.update('/state', state));

const masterVolumeChannel = `/volume`;
sharedParams.addNumber(masterVolumeChannel, masterVolumeChannel, -80, 30, 1, 0);
osc.receive(masterVolumeChannel, db => sharedParams.update(masterVolumeChannel, db + 15));

score.forEach(group => {
  // general params
  const groupVolumeChannel = `/${group.label}/volume`;
  sharedParams.addNumber(groupVolumeChannel, groupVolumeChannel, -80, 30, 1, 0);
  osc.receive(groupVolumeChannel, db => sharedParams.update(groupVolumeChannel, db + 15));

  // synths
  for (let i = 0; i < 2; i++) {
    const synthPartsChannel = `/${group.label}/synth/${i}/parts`;
    osc.receive(synthPartsChannel, value => dispatch(synthPartsChannel, value));

    const synthStartStopChannel = `/${group.label}/synth/${i}/toggle`;
    osc.receive(synthStartStopChannel, value => dispatch(synthStartStopChannel, value));

    const synthVolumeChannel = `/${group.label}/synth/${i}/volume`;
    initThrottledOscCallback(synthVolumeChannel);

    const synthEnvelopChannel = `/${group.label}/synth/${i}/envelop`;
    initThrottledOscCallback(synthEnvelopChannel);

    // lowpass
    const synthLowpassCutoffChannel = `/${group.label}/synth/${i}/lowpass-cutoff`;
    initThrottledOscCallback(synthLowpassCutoffChannel);

    // highpass
    const synthHighpassCutoffChannel = `/${group.label}/synth/${i}/highpass-cutoff`;
    initThrottledOscCallback(synthHighpassCutoffChannel);
  }
});

// throttle osc messages to web sockets
osc.receive('/throttle', value => updateThrottledOscCallbacks(value));
// init throttled callbacks at 50
const defaultThrottle = 50; // milliseconds
updateThrottledOscCallbacks(defaultThrottle);

// start application
soundworks.server.start();
