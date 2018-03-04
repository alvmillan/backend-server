var express = require('express');
var SEED = require('../config/config').SEED;
var mdAutenticacion = require('../middlewares/authentication');

var app = express();

var Hospital = require('../models/hospital');

// Rutas


//
// Obtener todos los hospitales
//
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);


    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre correo')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errores: err
                });
            }

            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                })
            })

        });
});

//
// Crear nuevo usuario
//
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    console.log(body.nombre)

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errores: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    })

})



// //
// Crear nuevo usuario
//
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errores: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errores: { message: 'No existe un hospital con ese ID' }
            });
        }
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errores: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        })
    })

})

//
// Borrar un Hospital por el id
//
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errores: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errores: { message: 'No existe un hospital con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    })
})

module.exports = app;