// import client side soundworks and player experience
import * as soundworks from 'soundworks/client';
import Controller from './Controller';
import serviceViews from '../shared/serviceViews';
// import score from '../../../score/model.json';

function bootstrap() {

  document.body.classList.remove('loading');
  // initialize the client with configuration received
  // from the server through the `index.html`
  // @see {~/src/server/index.js}
  // @see {~/html/default.ejs}
  const config = Object.assign({ appContainer: '#container' }, window.soundworksConfig);
  soundworks.client.init(config.clientType, config);

  soundworks.client.setServiceInstanciationHook((id, instance) => {
    if (serviceViews.has(id))
      instance.view = serviceViews.get(id, config);
  });

  const controller = new Controller();
  soundworks.client.start();
}

window.addEventListener('load', bootstrap);
