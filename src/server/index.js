import 'source-map-support/register'; // enable sourcemaps in node
import path from 'path';
import * as soundworks from 'soundworks/server';
import PlayerExperience from './PlayerExperience';
import throttle from 'lodash.throttle';

// score
import score from '../../score/model.json';

console.log(score);

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


// parse configuration,
// create params and osc bindings

const sharedParams = soundworks.server.require('shared-params');
const osc = soundworks.server.require('osc');

// common params
sharedParams.addTrigger('/reload', 'Reload');

sharedParams.addEnum('/start-stop', '/start-stop', ['start', 'stop'], 'stop');
osc.receive('/start-stop', value => sharedParams.update('/start-stop', value));

const throttledCallbacks = new Map();

score.forEach(group => {
  // volumes
  const volumeChannel = `/${group.label}/volume`;
  sharedParams.addNumber(volumeChannel, volumeChannel, -80, 6, 1, -20);

  throttledCallbacks.set(volumeChannel, () => {});
  osc.receive(volumeChannel, value => {
    const throttledCallback = throttledCallbacks.get(volumeChannel);
    throttledCallback(value);
  });

  // lowpass
  const lowpassCutoffChannel = `/${group.label}/lowpass-cutoff`;
  sharedParams.addNumber(lowpassCutoffChannel, lowpassCutoffChannel, 0, 16000, 1, 0);

  throttledCallbacks.set(lowpassCutoffChannel, () => {});
  osc.receive(lowpassCutoffChannel, value => {
    const throttledCallback = throttledCallbacks.get(lowpassCutoffChannel);
    throttledCallback(value);
  });

  // highpass
  const highpassCutoffChannel = `/${group.label}/highpass-cutoff`;
  sharedParams.addNumber(highpassCutoffChannel, highpassCutoffChannel, 0, 16000, 1, 16000);

  throttledCallbacks.set(highpassCutoffChannel, () => {});
  osc.receive(highpassCutoffChannel, value => {
    const throttledCallback = throttledCallbacks.get(highpassCutoffChannel);
    throttledCallback(value);
  });

  // handle parts for each groups
  const partsChannel = `/${group.label}/parts`;
  const labels = group.parts.map(part => part.label);
  sharedParams.addEnum(partsChannel, partsChannel, labels, labels[0]);

  osc.receive(partsChannel, value => sharedParams.update(partsChannel, value));
});

// throttle osc messages to web sockets
osc.receive('/throttle', value => updateThrottledCallbacks(value));
// init throttled callbacks at 50
const defaultThrottle = 100; // milliseconds
updateThrottledCallbacks(defaultThrottle);

function updateThrottledCallbacks(wait) {
  wait = Math.max(20, Math.min(1000, wait)); // clamp between 20 and 1000 ms;
  console.log(`Throttle at ${wait}ms`);

  for (let [channel, fn] of throttledCallbacks) {
    const callback = throttle(value => sharedParams.update(channel, value), wait);
    throttledCallbacks.set(channel, callback);
  }
}

const experience = new PlayerExperience('player');
const controller = new soundworks.ControllerExperience('controller');

// start application
soundworks.server.start();
