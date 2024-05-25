const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

let urlGuardada = ''; // Variable global para almacenar la última URL
let textGuardado = '';

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Ruta POST para guardar la URL
app.post('/url/guardar-url', (req, res) => {
    try {
        const { url } = req.body;

        if (url) {
            urlGuardada = url;
            console.log('URL successfully saved:', urlGuardada);
        }

    } catch (err) {
        res.status(400).send('URL not received');
        throw err;
    }

});

app.post('/texto/guardar-texto', (req, res) => {
    try {
        const { text } = req.body

        if (text) {
            textGuardado = text;
            console.log('Text successfully saved:', textGuardado);
        }

    } catch (err) {
        res.status(400).send('Text not received');
        throw err;
    }
})

// Ruta GET para obtener la última URL guardada
app.get('/ultima-url', (req, res) => {
    if (urlGuardada.length > 0) {
        lastUrl = urlGuardada;
        res.status(200).json({ url: urlGuardada }); // Enviar la última URL como respuesta JSON
    } else {
        res.status(404).send('No URL saved'); // Enviar error si no hay URL guardada
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

