const app = require('./src/app');

const PORT = process.env.PORT || 4000;
const HOST = '0.0.0.0'

app.listen(PORT, HOST, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    if (process.env.RENDER_EXTERNAL_URL) {
        console.log(`URL pública: ${process.env.RENDER_EXTERNAL_URL}`);
    } else {
        console.log(`Host: ${HOST}, Port: ${PORT}`);
    }
});
