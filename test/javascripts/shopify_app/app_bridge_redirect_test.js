suite('appBridgeRedirect', () => {
  const sandbox = sinon.createSandbox();
  const url = '/settings';

  setup(() => {
    window['app-bridge'] = {
      default() {},
      actions: {
        Redirect: {
          Action: {
            REMOTE: 'REDIRECT::REMOTE',
          },
          create() {
            return {
              dispatch() {},
            };
          },
        },
      },
    };
    document.body.dataset.apiKey = '123';
    document.body.dataset.shopOrigin = 'myshop.com';
  });

  teardown(() => {
    sandbox.restore();
    delete window['app-bridge'];
  });


  test('calls App Bridge to create an app with the apiKey and shopOrigin from window', () => {
    var createApp = sinon.spy();
    sinon.stub(window['app-bridge'], 'default').callsFake(createApp);

    appBridgeRedirect(url);

    sinon.assert.calledWith(createApp, {
      apiKey: '123',
      shopOrigin: 'myshop.com',
      forceRedirect: false,
    });
  });

  test('calls to dispatch a remote redirect App Bridge action with the url normalized to be relative to the window origin', () => {
    const AppBridge = window['app-bridge'];
    const Redirect = AppBridge.actions.Redirect;
    var mockApp = {};
    var RedirectInstance = {
      dispatch: sinon.spy(),
    };
    sinon.stub(AppBridge, 'default').callsFake(() => mockApp);
    sinon.stub(Redirect, 'create').callsFake(() => RedirectInstance);

    const normalizedUrl = `${window.location.origin}${url}`;

    appBridgeRedirect(url);

    sinon.assert.calledWith(Redirect.create, mockApp);
    sinon.assert.calledWith(
        RedirectInstance.dispatch,
        'REDIRECT::REMOTE',
        normalizedUrl
    );
  });
});