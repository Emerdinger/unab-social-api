const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");
const Console = require("console");
const secret = process.env.SECRETKEY;

// Crear un post

router.post("/", verificarToken, async (req, res) => {
    try {
        const newPost = new Post({
            userId: req.userId,
            desc: req.body.desc,
            img: req.body.img
        });
        const savedPost = await newPost.save();
        res.status(200).json(savedPost)
    } catch (e) {
        res.status(500).json(e)
    }
})

// Actualizar un post

router.put("/:id", verificarToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.userId) {
            await post.updateOne({ $set: req.body});
            res.status(200).json("Tu post ha sido actualizado");
        } else {
            res.status(403).json("Solo puedes actualizar tus posts");
        }
    } catch (e) {
        res.status(500).json(e);
    }
})

// Eliminar un post

router.delete("/:id", verificarToken, async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);
        if (post.userId === req.userId) {
            await post.deleteOne();
            res.status(200).json("El post ha sido eliminado");
        } else {
            res.status(403).json("Solo puedes eliminar tus posts");
        }
    } catch (e) {
        res.status(500).json(e);
    }
})

// Like o dislike post

router.put("/:id/like", verificarToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.userId)) {
            await post.updateOne({ $push: { likes: req.userId}});
            res.status(200).json("Le has dado me gusta al post");
        } else {
            await post.updateOne({ $pull: { likes: req.userId}});
            res.status(200).json("Se ha quitado el like");
        }
    } catch (e) {
        res.status(500).json(e);
    }

})

// Obtener un post

router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (e) {
        res.status(500).json(e);
    }
})

// Obtener el timeline de post

router.get("/timeline/:userId", async (req, res) => {
    try {
        const usuario = await User.findById(req.params.userId);
        const userPost = await Post.find({userId: usuario._id});
        const friendPosts = await Promise.all(
            usuario.followings.map((friendId) => {
                return Post.find({userId: friendId});
            })
        );
        res.status(200).json(userPost.concat(...friendPosts));
    } catch (e) {
        res.status(500).json(e);
    }
})

// Obtener todos los posts de un usuario

router.get("/perfil/:username", async (req, res) => {
    try {
        const usuario = await User.findOne({username: req.params.username.toLowerCase()});
        const posts = await Post.find({userId: usuario._id});
        res.status(200).json(posts);
    } catch (e) {
        res.status(500).json(e);
    }
})

// Código para verificar si el token es valido
function verificarToken(req, res, next) {
    // Se busca el header authorization
    if (!req.headers.authorization) {
        return res.status(401).json({error: 'Petición no autorizada'});
    }


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