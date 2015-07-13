var raven = require('raven');

exports.register = function (server, options, next) {

  var dsn = process.env.SENTRY_DSN || options.dsn;
  var client = new raven.Client(dsn, options.client);

  if (options.patchGlobal) {
    client.patchGlobal();
  }

  server.expose('client', client);

  server.on('request-error', function (request, err) {

    client.captureError(err, {
      extra: {
        timestamp: request.info.received,
        id: request.id,
        method: request.method,
        path: request.path,
        query: request.query,
        remoteAddress: request.info.remoteAddress,
        userAgent: request.raw.req.headers['user-agent']
      }
    });
  });

  next();
};

exports.register.attributes = {
  name: 'raven',
  version: require('../package.json').version
};
