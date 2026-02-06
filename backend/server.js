const app = require('./src/app');

const PORT = process.env.PORT || 4000;
const HOST = '0.0.0.0'

app.listen(PORT, HOST, () => {
    console.log(`Servidor corriendo en el puerto http://${HOST}${PORT}`);
    console.log(`Documentación/Estado: http://localhost:${PORT}`);
});
