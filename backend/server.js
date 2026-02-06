const app = require('./src/app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Documentación/Estado: http://localhost:${PORT}`);
});
