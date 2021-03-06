import BorderlineBootstrap from 'BorderlineBootstrap';
import registerServiceWorker from 'utilities/registerServiceWorker';

async function bootstrap() {

    await import('api')
        .then(api => {
            window.api = api.default;
            new BorderlineBootstrap();
            registerServiceWorker();
        })
        .catch(() => {
            // TO-DO Must handle API loading failure
        });
}

bootstrap();
