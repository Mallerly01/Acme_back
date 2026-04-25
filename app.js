var express = require('express');
var mysql = require('mysql2');
const bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var cors = require('cors');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

// Configurar la conexión a la base de datos
var conn= mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'root',
    database: 'acme'
});

//Añadir un nuevo producto a la base de datos
app.post('/productos', (req, res) => {
    const { name, code, date, price, description, rating, image } = req.body;
    const sql = 'INSERT INTO productos (productName, productCode, releaseDate, price, description, starRating, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)';
    conn.query(sql, [name, code, date, parseInt(price), description, parseInt(rating), image], (err, results) => {
        if (err) throw err;
        res.status(201).json({
            ok: true,
            mensaje: 'Producto creado exitosamente'
        });
    });         
});

app.get('/productos/:productId', (req, res) => {
    
    const { productId } = req.params; 

    const sql = 'SELECT * FROM productos WHERE productId = ?';

    conn.query(sql, [productId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ ok: false, mensaje: 'Error en servidor' });
        }

        if (results.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: `El producto con id ${productId} no existe`
            });
        }

        res.status(200).json({
            ok: true,
            producto: results[0]
        });
    });
});

app.put('/upload/productos/:id', (req, res) =>{
    if(!req.files || Object.keys(req.files).length === 0){
        return res.status(400).json({ 
            ok: false, 
            mensaje: 'No se ha subido ningún archivo' 
        });
    }
    const file = req.files.image;
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    
    if(!allowedExtensions.includes(fileExtension)){
        return res.status(400).json({ 
            ok: false, 
            mensaje: 'Formato de archivo no permitido' 
        });
    }
    const productId = req.params.id;
    const fileName = `${productId}-${new Date().getMilliseconds()}.${fileExtension}`;
    const uploadPath = __dirname + '/uploads/productos/' + fileName;
    
    console.log(uploadPath);

    file.mv(uploadPath, (err) =>{
        if(err){
            return res.status(500).json({
            ok: false,
            mensaje: 'Error al subir el archivo',
            error: err
        });
        }
        const sql = 'UPDATE productos SET imageUrl = ? WHERE productId = ?';
        conn.query(sql, [uploadPath, productId], (err, results) => {
            if (err) throw err;
            res.status(200).json({
                ok: true,
                mensaje: 'Archivo subido y producto actualizado exitosamente'
            });
        });
    });

    

});

app.put('/productos/:productId', (req, res) => {
    const { name, code, date, price, description, rate } = req.body;
    const sql = 'UPDATE productos SET productName = ?, productCode = ?, releaseDate = ?, price = ?, description = ?, starRating = ? WHERE productId = ?'; 
    conn.query(sql, [name, code, date, parseInt(price), description, parseInt(rate), req.params.productId], (err, results) => {
        if (err) throw err;
        res.status(200).json({
            ok: true,
            mensaje: 'Producto actualizado exitosamente'
        });
    });
});

app.delete('/productos/:productId', (req, res) => {
    const sql = 'DELETE FROM productos WHERE productId = ?';
    conn.query(sql, [req.params.productId], (err, results) => {
        if (err) throw err;
        res.status(200).json({
            ok: true,
            mensaje: 'Producto eliminado exitosamente'
        });
    });
});

app.get('/productos', (req, res) => {
    const sql = 'SELECT * FROM productos';
    conn.query(sql, (err, results) => {
        if (err) throw err;
        res.status(200).json({
            ok: true,
            productos: results
        })
    });
});

app.get('/', (req, res) => {
    res.status(200).json({ 
        ok: true,
        message: 'Peticion realizada correctamente' });
});

app.listen(3000, function () {
    console.log('Express Server - Puerto 3000 online');
});