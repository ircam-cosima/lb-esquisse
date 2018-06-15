import * as soundworks from 'soundworks/client';
import BaseState from './BaseState';
import CircleRenderer from '../renderers/CircleRenderer';
import ModSynth from '../audio/ModSynth';
import { decibelToLinear } from 'soundworks/utils/math';
import Mod from '../utils/Mod';
import Osc from '../utils/Osc';
import { rampParam, setParam } from '../utils/audioParamPoly';

const client = soundworks.client;
const audioContext = soundworks.audioContext;

const template = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="main">
      <% if (debug) { %>
        <% for (var i in params) { %>
        <p><%= i %>: <%= params[i] %></p>
        <% } %>
      <% } %>
    </div>
  </div>
`;

class PerformanceState extends BaseState {
  constructor(name, fullScore) {
    super(name);

    this.fullScore = fullScore;

    this.mappingModels = [
      { x: 0.5, y: 0.5, value: 0, state: 'stop' },
      { x: 0.5, y: 0.5, value: 0, state: 'stop' },
    ];

    this.position = { x: 0.5, y: 0.5, value: 0.1 };

    this.audioMappings = [[], []];
    this.renderers = [];
    this.synths = [];
    this.mixers = [];

    this.groupMaster = audioContext.createGain();
    setParam(this.groupMaster.gain, 1);

    this._flag = true;
    this._onMotionData = this._onMotionData.bind(this);
    this._updateGroupMaster = this._updateGroupMaster.bind(this);

    this._onDebug = this._onDebug.bind(this);
    this._onEmulateMvmt = this._onEmulateMvmt.bind(this);
    this._emulateMvmt = false;
    this._emulateOscillators = {
      x: new Osc(1 / (Math.random() * 20 + 10)),
      y: new Osc(1 / (Math.random() * 20 + 10)),
    };

    this.view = new soundworks.CanvasView(template, {
      debug: false,
      params: {
        groupLabel: null,
        indexInGroup: null,
      }
    }, {}, {
      ratios: { '.main': 1 },
      className: 'state',
      id: this.name,
      preservePixelRatio: false,
    });

    this.view.render();
  }

  _onDebug(value) {
    this.view.model.debug = value;
    this.view.render('.main');
  }

  _onEmulateMvmt(value) {
    if (value) {
      this.mappingModels[0].x = 0.5;
      this.mappingModels[0].y = 0.5;

      this._emulateOscillators.x = new Osc(1 / (Math.random() * 20 + 10));
      this._emulateOscillators.y = new Osc(1 / (Math.random() * 20 + 10));

      this._emulateMvmt = true;
    } else {
      this._emulateMvmt = false;
    }
  }

  _debug(param, value) {
    this.view.model.params[param] = value;

    if (this.view.model.debug)
      this.view.render('.main');
  }

  _updateGroupMaster(db) {
    const gain = decibelToLinear(db);
    rampParam(this.groupMaster.gain, gain, 0.01);

    this._debug(`/${client.groupLabel}/volume`, gain);
  }

  enter(experience) {
    super.enter(experience);

    const numGroups = this.fullScore.length;
    const groupIndex = client.index % numGroups;
    this.score = this.fullScore[groupIndex];

    client.groupLabel = this.score.label;
    client.indexInGroup = Math.floor(client.index / numGroups);
    this.view.model.params.groupLabel = client.groupLabel;
    this.view.model.params.indexInGroup = client.indexInGroup;

    // handle group master
    this.groupMaster.connect(experience.masterBus);
    experience.sharedParams.addParamListener(`/${client.groupLabel}/volume`, this._updateGroupMaster);

    const clearCanvas = (ctx, dt, width, height) => ctx.clearRect(0, 0, width, height);
    this.view.setPreRender(clearCanvas);

    // position - renderer
    const positionRenderer = new CircleRenderer(this.position, 2);
    this.view.addRenderer(positionRenderer);

    // init audio visual rendering
    for (let i = 0; i < 2; i++) {
      // score
      const synthName = `synth-${i}`;
      const parts = this.score[synthName];

      const model = this.mappingModels[i];

      const renderer = new CircleRenderer(model);
      this.view.addRenderer(renderer);

      const mixer = audioContext.createGain();
      mixer.connect(this.groupMaster);
      setParam(mixer.gain, 1);

      const synth = new ModSynth();
      synth.connect(mixer);

      experience.receive(`/${client.groupLabel}/synth/${i}/parts`, partLabel => {
        const part = parts.find(part => part.label === partLabel);
        // configure synth
        const freq = part.frequencies[client.indexInGroup];
        const gain = part.gains[client.indexInGroup];
        synth.setFrequency(freq);
        synth.setLevel(gain);

        // update mappings
        this.audioMappings[i] = [];

        if (part.mappings) {
          part.mappings.forEach(mappingDefinition => {
            const { axis, target, range } = mappingDefinition;

            const modifier = new Mod();
            modifier.min = range[0];
            modifier.max = range[1];

            let mappingFunc = null;

            switch (target) {
              case 'tremoloDepth':
                mappingFunc = model => {
                  const value = model[axis];
                  const mappedValue = modifier.process(value);
                  synth.setTremoloDepth(mappedValue);
                }
                break;
              case 'tremoloFrequency':
                mappingFunc = model => {
                  const value = model[axis];
                  const mappedValue = modifier.process(value);
                  synth.setTremoloFrequency(mappedValue);
                }
                break;
              case 'detune':
                mappingFunc = model => {
                  const value = model[axis];
                  const mappedValue = modifier.process(value);
                  synth.setDetune(mappedValue);
                }
                break;
              case 'gain':
                modifier.offset = gain;

                mappingFunc = model => {
                  const value = model[axis];
                  const mappedValue = modifier.process(value);
                  synth.setLevel(mappedValue);
                }
                break;
              case 'modFrequency':
                mappingFunc = model => {
                  const value = model[axis];
                  const mappedValue = modifier.process(value);
                  synth.setModFrequency(mappedValue);
                }
                break;
              case 'modRatio':
                mappingFunc = model => {
                  const value = model[axis];
                  const mappedValue = modifier.process(value);
                  synth.setModRatio(mappedValue);
                }
                break;
              default:
                console.error(`Undefined mapping ${target}`);
                break;
            }

            if (mappingFunc !== null)
              this.audioMappings[i].push(mappingFunc);
          });
        }

        this._debug(`/${client.groupLabel}/synth/${i}/parts`, partLabel);
      });

      experience.receive(`/${client.groupLabel}/synth/${i}/toggle`, value => {
        if (value === 'start') {
          synth.start();
          this.mappingModels[i].state = 'start';
        } else {
          this.audioMappings[i] = [];

          synth.stop();
          this.mappingModels[i].state = 'stop';
          this.mappingModels[i].value = 0;
        }

        this._debug(`/${client.groupLabel}/synth/${i}/toggle`, value);
      });

      experience.receive(`/${client.groupLabel}/synth/${i}/volume`, db => {
        const gain = decibelToLinear(db);
        rampParam(mixer.gain, gain, 0.01);

        this._debug(`/${client.groupLabel}/synth/${i}/volume`, gain);
      });

      experience.receive(`/${client.groupLabel}/synth/${i}/envelop`, db => {
        const gain = decibelToLinear(db);
        // const rootGain = Math.sqrt(gain);
        synth.setEnvelop(gain, 0.01);
        // update rendering
        model.value = gain;

        this._debug(`/${client.groupLabel}/synth/${i}/envelop`, gain);
      });

      experience.receive(`/${client.groupLabel}/synth/${i}/lowpass-cutoff`, freq => {
        synth.setLowpassCutoff(freq);

        this._debug(`/${client.groupLabel}/synth/${i}/lowpass-cutoff`, freq);
      });

      experience.receive(`/${client.groupLabel}/synth/${i}/highpass-cutoff`, freq => {
        synth.setHighpassCutoff(freq);

        this._debug(`/${client.groupLabel}/synth/${i}/highpass-cutoff`, freq);
      });

      this.renderers.push(renderer);
      this.mixers.push(mixer);
      this.synths.push(synth);
    }

    // listen for acceleraometers
    experience.addMotionListener(this._onMotionData);
    // trigger rendering after model has been updated
    experience.sharedParams.addParamListener('/debug', this._onDebug);
    experience.sharedParams.addParamListener('/emulateMvmt', this._onEmulateMvmt);

    this.view.show();
    this.view.appendTo(experience.view.$el);
  }

  exit(experience) {
    super.exit(experience);

    experience.sharedParams.removeParamListener('/debug', this._onDebug);
    experience.sharedParams.removeParamListener('/emulateMvmt', this._onEmulateMvmt);
    experience.sharedParams.removeParamListener(`/${client.groupLabel}/volume`, this._updateGroupMaster);
    experience.removeMotionListener(this._onMotionData);

    // @todo - put for loop
    for (let i = 0; i < 2; i++) {
      experience.stopReceiving(`/${client.groupLabel}/synth/${i}/parts`);
      experience.stopReceiving(`/${client.groupLabel}/synth/${i}/toggle`);
      experience.stopReceiving(`/${client.groupLabel}/synth/${i}/volume`);
      experience.stopReceiving(`/${client.groupLabel}/synth/${i}/envelop`);
      experience.stopReceiving(`/${client.groupLabel}/synth/${i}/lowpass-cutoff`);
      experience.stopReceiving(`/${client.groupLabel}/synth/${i}/highpass-cutoff`);
    }

    const transitionDuration = 4;
    const now = audioContext.currentTime;

    this.mixers.forEach(mixer => mixer.gain.linearRampToValueAtTime(0, now + transitionDuration));

    // clean the mess - @todo review
    setTimeout(() => {
      this.renderers.forEach(renderer => this.view.removeRenderer(renderer));

      this.mixers.forEach(mixer => mixer.disconnect());
      this.synths.forEach(synth => {
        synth.stop();
        synth.disconnect();
      });

      this.view.hide();
      this.view.remove();
    }, transitionDuration * 1000);
  }

  _onMotionData(data, period) {
    // integrate movement between 0.25 and 0.75
    const vx = - data[0] / 9.81;
    const vy = (data[1] - 5) / 9.81;

    let posX = this.position.x;
    let posY = this.position.y;
    // integrate acceleration
    posX += (vx * 0.7 * period);
    posY += (vy * 0.7 * period);

    posX = Math.max(0.25, Math.min(0.75, posX));
    posY = Math.max(0.25, Math.min(0.75, posY));

    this.position.x = posX;
    this.position.y = posY;

    const now = new Date().getTime() / 1000;
    let x = this._emulateOscillators.x.process(now) * 0.25 + posX;
    let y = this._emulateOscillators.y.process(now) * 0.25 + posY;

    // if (!this._emulateMvmt) {
    //   const vx = - data[0] / 9.81;
    //   const vy = (data[1] - 5) / 9.81;

    //   x = this.mappingModels[0].x
    //   y = this.mappingModels[0].y
    //   // integrate acceleration
    //   x += (vx * 0.7 * period);
    //   y += (vy * 0.7 * period);
    // } else {
    //   const now = new Date().getTime() / 1000;
    //   x = this._emulateOscillators.x.process(now) * 0.5 + 0.5;
    //   y = this._emulateOscillators.y.process(now) * 0.5 + 0.5;
    // }

    // clamp
    y = Math.max(0, Math.min(1, y));
    x = Math.max(0, Math.min(1, x));

    this.mappingModels[0].x = x;
    this.mappingModels[0].y = y;
    // second mapping is just a mirror...
    this.mappingModels[1].x = 1 - x;
    this.mappingModels[1].y = 1 - y;

    this._updateMappings();
  }

  _updateMappings() {
    this._flag = !this._flag;
    if (!this._flag) return;

    for (let i = 0; i < this.mappingModels.length; i++) {
      const model = this.mappingModels[i];
      this.audioMappings[i].forEach(mapping => {
        if (mapping) // this is probably not necessary
          mapping(model);
      });
    }
  }
}

export default PerformanceState;
