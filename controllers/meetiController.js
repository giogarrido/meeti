const { body } = require('express-validator');
const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');

// Muestra el formulario para nuevos meetis
exports.formNewMeeti = async (req, res) => {
    const grupos = await Grupos.findAll({ where: { userId: req.user.id } });

    res.render('nuevo-meeti', {
        nombrePagina: 'Crear Nuevo Meeti',
        grupos
    })
}

// Guarda los meetis en la base de datos

exports.createMeeti = async (req, res) => {
    // Leer los datos
    const meeti = req.body;

    // Asignar el usuario
    meeti.userId = req.user.id;

    // Almacenar la ubicacion con un point
    const point = { type: 'Point', coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lng)] };
    meeti.ubicacion = point;

    // Cupo opcional
    if (req.body.cupo === '') {
        meeti.cupo = 0;
    }

    console.log(meeti);

    // Almacenar en la base de datos
    try {
        await Meeti.create(meeti);
        req.flash('exito', 'Meeti creado correctamente');
        res.redirect('/administracion');
    } catch (error) {
        // Extraer el message de los errores
        //const erroresSequelize = error.errors.map(err => err.message);

        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-meeti');
    }
}

// Sanitizar los meetis
exports.sanitizeMeeti = (req, res, next) => {

    body('titulo').trip.escape();
    body('invitado').trip.escape();
    body('cupo').trip.escape();
    body('fecha').trip.escape();
    body('hora').trip.escape();
    body('direccion').trip.escape();
    body('ciudad').trip.escape();
    body('estado').trip.escape();
    body('pais').trip.escape();
    body('lat').trip.escape();
    body('lng').trip.escape();
    body('grupoId').trip.escape();
    
    next();
}

// Muestra el formulario para editar un meeti
exports.formEditMeeti = async (req, res) => {
    const consultas = [];
    consultas.push(Grupos.findAll({ where: { userId: req.user.id } }));
    consultas.push(Meeti.findByPk(req.params.id));

    // Promise con await
    const [grupos, meeti] = await Promise.all(consultas);

    if (!grupos || !meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    res.render('editar-meeti', {
        nombrePagina: `Editar Meeti: ${meeti.titulo}`,
        grupos,
        meeti
    })
}

// Almacena los cambios en la base de datos

exports.editMeeti = async (req, res) => {
    const meeti = await Meeti.findOne({
        where: { id: req.params.id, userId: req.user.id },
      });

    // Si no existe el meeti
    if (!meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    // Asignar los valores
    const { grupoId, titulo, invitado, fecha, hora, cupo, descripcion, direccion, ciudad, estado, pais, lat, lng } = req.body;

    // Asignar los valores
    meeti.grupoId = grupoId;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.cupo = cupo;
    meeti.descripcion = descripcion;
    meeti.direccion = direccion;
    meeti.ciudad = ciudad;
    meeti.estado = estado;
    meeti.pais = pais;

    // Asignar point (ubicacion)
    const point = { type: 'Point', coordinates: [parseFloat(lat), parseFloat(lng)] };
    meeti.ubicacion = point;

    // Almacenar en la base de datos
    await meeti.save();
    req.flash('exito', 'Cambios almacenados correctamente');
    res.redirect('/administracion');
}

// Muestra el formulario para eliminar un meeti
exports.formDeleteMeeti = async (req, res) => {
    const meeti = await Meeti.findOne({
        where: { id: req.params.id, userId: req.user.id }
 
    });

    if (!meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    // Mostrar la vista
    res.render('eliminar-meeti', {
        nombrePagina: `Eliminar Meeti: ${meeti.titulo}`
    })
}

// Elimina el meeti de la base de datos

exports.deleteMeeti = async (req, res) => {
    await Meeti.destroy({
        where: { id: req.params.id }
    });

    req.flash('exito', 'Meeti eliminado');
    res.redirect('/administracion');
}