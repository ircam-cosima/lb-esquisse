import 'source-map-support/register'; // enable sourcemaps in node
import path from 'path';
import * as soundworks from 'soundworks/server';
import PlayerExperience from './PlayerExperience';
import throttle from 'lodash.throttle';

// score
import score from '../../score/model.json';

console.log(score);

const configName = process.env.ENV || 'default';
console.log(configName);
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

const granularAudioFiles = [
  'sounds/ding.mp3',
  'sounds/dang.mp3',
  'sounds/dong.mp3',
];

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
    audioFiles: granularAudioFiles,
  };
});

// parse configuration,
// create params and osc bindings

const sharedParams = soundworks.server.require('shared-params');
const osc = soundworks.server.require('osc');

// common params
sharedParams.addTrigger('/reload', 'Reload');

const throttledCallbacks = new Map();

score.forEach(group => {

  // ------------------------------------------------------
  // GENERAL PARAMS
  // ------------------------------------------------------
  const masterVolumeChannel = `/volume`;
  sharedParams.addNumber(masterVolumeChannel, masterVolumeChannel, -80, 6, 1, -20);
  initThrottledOscCallback(masterVolumeChannel);

  const groupVolumeChannel = `/${group.label}/volume`;
  sharedParams.addNumber(groupVolumeChannel, groupVolumeChannel, -80, 6, 1, 0);
  initThrottledOscCallback(groupVolumeChannel);

  // handle parts for each groups
  const partsChannel = `/${group.label}/parts`;
  const labels = group.parts.map(part => part.label);
  sharedParams.addEnum(partsChannel, partsChannel, labels, labels[0]);
  osc.receive(partsChannel, value => sharedParams.update(partsChannel, value));

  // ------------------------------------------------------
  // SINE PARAMS
  // ------------------------------------------------------

  const sineStartStopChannel = `/${group.label}/sine`;
  sharedParams.addEnum(sineStartStopChannel, sineStartStopChannel, ['start', 'stop'], 'stop');
  osc.receive(sineStartStopChannel, value => sharedParams.update(sineStartStopChannel, value));

  const sineVolumeChannel = `/${group.label}/sine/volume`;
  sharedParams.addNumber(sineVolumeChannel, sineVolumeChannel, -80, 6, 1, 0);
  initThrottledOscCallback(sineVolumeChannel);

  const sineEnvelopChannel = `/${group.label}/sine/envelop`;
  sharedParams.addNumber(sineEnvelopChannel, sineEnvelopChannel, -80, 6, 1, -80);
  initThrottledOscCallback(sineEnvelopChannel);

  // lowpass
  const lowpassCutoffChannel = `/${group.label}/sine/lowpass-cutoff`;
  sharedParams.addNumber(lowpassCutoffChannel, lowpassCutoffChannel, 0, 16000, 1, 0);
  initThrottledOscCallback(lowpassCutoffChannel);

  // highpass
  const highpassCutoffChannel = `/${group.label}/sine/highpass-cutoff`;
  sharedParams.addNumber(highpassCutoffChannel, highpassCutoffChannel, 0, 16000, 1, 16000);
  initThrottledOscCallback(highpassCutoffChannel);

  // ------------------------------------------------------
  // GRANULAR PARAMS
  // ------------------------------------------------------

  const granularStartStopChannel = `/${group.label}/granular`;
  sharedParams.addEnum(granularStartStopChannel, granularStartStopChannel, ['start', 'stop'], 'stop');
  osc.receive(granularStartStopChannel, value => sharedParams.update(granularStartStopChannel, value));

  const granularVolumeChannel = `/${group.label}/granular/volume`;
  sharedParams.addNumber(granularVolumeChannel, granularVolumeChannel, -80, 6, 1, 0);
  initThrottledOscCallback(granularVolumeChannel);

  const granularEnvelopChannel = `/${group.label}/granular/envelop`;
  sharedParams.addNumber(granularEnvelopChannel, granularEnvelopChannel, -80, 6, 1, -80);
  initThrottledOscCallback(granularEnvelopChannel);

  const granularBufferChannel = `/${group.label}/granular/buffer`;
  sharedParams.addEnum(granularBufferChannel, granularBufferChannel, granularAudioFiles, granularAudioFiles[0]);
  osc.receive(granularBufferChannel, value => sharedParams.update(granularBufferChannel, value));

  const granularPositionChannel = `/${group.label}/granular/position`;
  sharedParams.addNumber(granularPositionChannel, granularPositionChannel, 0, 1, 0.001, 0.5);
  initThrottledOscCallback(granularPositionChannel);

  const granularPositionVarChannel = `/${group.label}/granular/positionVar`;
  sharedParams.addNumber(granularPositionVarChannel, granularPositionVarChannel, 0, 0.2, 0.001, 0.003);
  initThrottledOscCallback(granularPositionVarChannel);

  const granularPeriodChannel = `/${group.label}/granular/period`;
  sharedParams.addNumber(granularPeriodChannel, granularPeriodChannel, 0.01, 0.5, 0.001, 0.02);
  initThrottledOscCallback(granularPeriodChannel);

  const granularDurationChannel = `/${group.label}/granular/duration`;
  sharedParams.addNumber(granularDurationChannel, granularDurationChannel, 0.010, 0.500, 0.001, 0.100);
  initThrottledOscCallback(granularDurationChannel);

  const granularResamplingChannel = `/${group.label}/granular/resampling`;
  sharedParams.addNumber(granularResamplingChannel, granularResamplingChannel, -2400, 2400, 1, 0);
  initThrottledOscCallback(granularResamplingChannel);

  const granularResamplingVarChannel = `/${group.label}/granular/resamplingVar`;
  sharedParams.addNumber(granularResamplingVarChannel, granularResamplingVarChannel, 0, 1200, 1, 0);
  initThrottledOscCallback(granularResamplingVarChannel);

});

// throttle osc messages to web sockets
osc.receive('/throttle', value => updateThrottledOscCallbacks(value));
// init throttled callbacks at 50
const defaultThrottle = 50; // milliseconds
updateThrottledOscCallbacks(defaultThrottle);

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
    const callback = throttle(value => sharedParams.update(channel, value), wait);
    throttledCallbacks.set(channel, callback);
  }
}

const experience = new PlayerExperience('player');
const controller = new soundworks.ControllerExperience('controller');

// start application
soundworks.server.start();
