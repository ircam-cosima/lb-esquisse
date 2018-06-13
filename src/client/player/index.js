// import client side soundworks and player experience
import * as soundworks from 'soundworks/client';
import PlayerExperience from './PlayerExperience';
import serviceViews from '../shared/serviceViews';
import 'whatwg-fetch';

function bootstrap(score) {
  document.body.classList.remove('loading');

  const config = Object.assign({ appContainer: '#container' }, window.soundworksConfig);

  soundworks.client.init(config.clientType, config);
  soundworks.client.setServiceInstanciationHook((id, instance) => {
    if (serviceViews.has(id))
      instance.view = serviceViews.get(id, config);
  });

  const experience = new PlayerExperience(config.assetsDomain, score);
  soundworks.client.start();
}

window.addEventListener('load', () => {
  fetch('/config?' + Math.random())
    .then(res => res.json())
    .then(score => bootstrap(JSON.parse(score)));
});
