const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const secret = process.env.SECRETKEY;

// Registrar un usuario
router.post("/registro", async (req, res) => {
    const {username, fullName, email, password, confirmPassword, mobile, birthday, gender} = req.body;

    if (username == "" || username == null || fullName == "" || fullName == null || email == "" || email == null || password == "" || password == null
        || mobile == "" || mobile == null || birthday == "" || birthday == null || gender == "" || gender == null) {
        return res.json({code: 409, message: "Faltan datos por completar."});
    }

    if ( password != confirmPassword ) {
        return res.json({code: 400, message: "Las contraseñas deben ser iguales."});
    }

    if (!email.toLowerCase().endsWith("@unab.edu.co")){
        console.log(email)
        return res.json({code: 400, message: "El correo debe ser un correo UNAB."});
    }

    try {
        // Generar una nueva contraseña encriptada
        const hashedPassword = await bcrypt.hashSync(password, 10);

        // Crear un nuevo usuario
        const nuevoUsuario = new User({
            username: username.toLowerCase(),
            fullName: fullName.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            mobile: mobile,
            birthday: birthday,
            gender: gender
        })

        // Guardar usuario en la base de datos
        const usuario = await nuevoUsuario.save();
        res.status(200).json(usuario);
    } catch (e) {
        if (e.keyValue.email){
            res.json({code: 500, message: `El correo ${e.keyValue.email} ya esta en uso.`})
        } else {
            res.json({code: 500, message: `El usuario ${e.keyValue.username} ya esta en uso.`})
        }
    }
})

// Inicio de sesión
router.post("/login", async (req, res) => {

    try {
        // Buscar si existe el usuario

        const usuario = await User.findOne({email: req.body.email.toLowerCase()});
        !usuario && res.json({error: "Usuario no encontrado"});

        // Confirmar la contraseña
        const contraseñaValida = await bcrypt.compare(req.body.password, usuario.password);
        !contraseñaValida && res.json({error: "Contraseña incorrecta"});

        // Crear el token de autorización
        const token = jwt.sign({_id: usuario._id}, secret);
        return res.status(200).json({token});


    } catch (e) {
        return res.status(500).json(e);
    }
})

// Obtener datos de un usuario
router.get("/userData", verificarToken, async (req, res) => {
    const user = await User.findById(req.userId).select("username email gender birthday mobile profilePicture coverPicture followers followings isAdmin description city from relationship");
    res.status(200).json(user);
})

// Editar usuario
router.put("/", verificarToken, async(req, res) => {
    req.body.username = req.body.username.toLowerCase();
    req.body.email = req.body.email.toLowerCase();

    if (req.body.password) {
        try {
            req.body.password = await bcrypt.hashSync(req.body.password, 10);
        }catch (e) {
            return res.status(500).json(e);
        }
    }
    // Encontrar al usuario y actualizarlo
    try {
        const usuario = await User.findByIdAndUpdate(req.userId,{
            $set: req.body
        });
        res.status(200).json("Tu cuenta ha sido actualizada");
    } catch (e) {
        return res.status(500).json(e);
    }

})

// Eliminar usuario
router.delete("/", verificarToken, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.userId);
        res.status(200).json("La cuenta ha sido eliminada");
    } catch (e) {
        return res.status(500).json(e);
    }
})

// Obtener un usuario
router.get("/", async (req, res) => {
    const userId = req.query.userId;

    try {
        const usuario = userId ? await User.findById(userId) : await User.findOne({username: req.query.username.toLowerCase()});
        const {password, updateAt, isAdmin, ...other} = usuario._doc;
        res.status(200).json(other);
    } catch (e) {
        res.status(500).json(e);
    }
})

// Obtener amigos
router.get("/amigos/:userId", async (req, res) => {
    try {
        const usuario = await User.findById(req.params.userId);
        const friends = await Promise.all(usuario.followings.map((friendId) =>{
            return User.findById(friendId);
        }))
        let friendList = [];
        friends.map((friend) => {
            const {_id ,username, profilePicture} = friend;
            friendList.push({_id, username, profilePicture});
        });
        res.status(200).json(friendList);
    } catch (e) {
        res.status(500).json(e);
    }
})

// Seguir a un usuario
router.put("/:id/seguir", verificarToken, async (req, res) => {
    if (req.params.id !== req.userId) {
        try {
            const usuario = await User.findById(req.params.id);
            const usuarioActual = await User.findById(req.userId);

            if (!usuario.followers.includes(req.userId)){
                await usuario.updateOne({$push: {followers: req.userId}});
                await usuarioActual.updateOne({$push: {followings: req.params.id}});
                res.status(200).json("Ahora sigues a este usuario");
            } else {
                res.status(403).json("Ya sigues a este usuario");
            }
        } catch (e) {
            res.status(500).json(e);
        }
    } else {
        res.status(403).json("No te puedes seguir");
    }
})

// Dejar de seguir
router.put("/:id/unfollow", verificarToken, async (req, res) => {
    if (req.params.id !== req.userId){
        try{
            const usuario = await User.findById(req.params.id);
            const usuarioActual = await User.findById(req.userId);
            if (usuario.followers.includes(req.userId)) {
                await usuario.updateOne({$pull: {followers: req.userId}});
                await usuarioActual.updateOne({$pull: {followings: req.params.id}});
                res.status(200).json("Has dejado de seguir a este usuario");
            } else {
                res.status(403).json("No sigues a este usuario");
            }
        } catch (e) {
            res.status(500).json(e);
        }
    } else {
        res.status(403).json("No te puedes seguir");
    }
})

// Verificar token
router.get("/verificar", verificarToken, async (req, res) => {
    res.status(200).json(true);
})

// Código para verificar si el token es valido
function verificarToken(req, res, next) {
    // Se busca el header authorization
    if (!req.headers.authorization) {
        return res.status(401).json({error: 'Petición no autorizada'});
    }
    ;

    // Se divide el token del bearer
    const token = req.headers.authorization.split(' ')[1];

    // Si no existe
    if (!token) {
        return res.status(401).json({error: 'Token no encontrado'});
    }

    // Manejar errores de token no valido
    try {
        const data = jwt.verify(token, secret);
        req.userId = data._id;
        next();
    } catch (error) {
        return res.status(401).json({error: 'Token no valido'});
    }
}

module.exports = router;