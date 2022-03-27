const router = require("express").Router();
const User = require("../models/User");
const {randomId} = require("../scripts/randomId");
const {verificationMail, resetPasswordEmail} = require("../mails/verificationMail");
const transporter = require("../mails/mailer");
const bcrypt = require("bcryptjs");

// Verificar token
router.put("/verificar/:code", async (req, res) => {

    const usuario = await User.findOne({email: req.body.email.toLowerCase()});

    if (usuario == null) {
        return res.json({code: 404, message: "No se ha encontrado ningún un usuario con esa dirección de correo."})
    }

    if (usuario.actualCode == req.params.code) {
        await usuario.set({
            actualCode: "",
            verificated: true
        })

        await usuario.save()
        try {
            await transporter.sendMail({
                from: '"UNAB-SOCIAL 🌐 - CUENTA VERIFICADA CORRECTAMENTE" <servicesemer@gmail.com>',
                to: usuario.email.toLowerCase(),
                subject: "Tú cuenta ha sido verificada ✔",
                html: `
                        <h1>Tú cuenta ha sido verificada con éxito.</h1>
                    `
            });
            return res.json({message: "Tú cuenta ha sido verificada satisfactoriamente"})
        } catch (e) {
            return res.json({error: "Algo salio mal con el correo electronico"})
        }


    } else {
        return res.json({code: 400, error: "El código de verificación es incorrecto"})
    }
})

// Enviar correo de recuperar contraseña
router.put("/recover-password-email", async (req, res) => {
    const {email} = req.query;
    const usuario = await User.findOne({email: email.toLowerCase()});

    if (!usuario) {
        return res.json({code: 400, error: "No existe ningún usuario con esa dirección de correo."})
    }

    if (email == null || email == "" || email.empty) {
        return res.json({code: 400, error: "El campo de email no puede estar vacío."})
    }
    const code = randomId();

    usuario.set({
        actualCode: code.toString()
    })

    await usuario.save();

    try {
        await transporter.sendMail({
            from: '"UNAB-SOCIAL 🌐 - RECUPERAR CONTRASEÑA" <servicesemer@gmail.com>',
            to: email.toLowerCase(),
            subject: "Recuperar contraseña 👾",
            html: resetPasswordEmail(code)
        });
        return res.json({message: "Se ha enviado el código de verificación a tú correo."});
    } catch (e) {
        return res.json({error: "Algo salio mal con el correo electronico"});
    }
});

// Recuperar contraseña

router.put("/reset-password", async (req,res) => {
    const {code, email, password, confirmPassword} = req.query;
    console.log(code)
    if (code == null || code == "" || code.empty ) {
        return res.json({code: 400, message: "Debe ingresar el código de verificación"});
    }

    if (email == null || email == "" || email.empty ) {
        return res.json({code: 400, message: "El campo de email no puede estar vacío."});
    }

    const usuario = await User.findOne({email: email.toLowerCase()});

    if (!usuario) {
        return res.json({code: 400, error: "No existe ningún usuario con esa dirección de correo."});
    }

    if (usuario.actualCode != code.toString()) {
        return res.json({code: 400, error: "El código de verificación es invalido."});
    }

    if (password != confirmPassword) {
        return res.json({code: 400, error: "Las contraseñas no coinciden."});
    }

    const hashedPassword = await bcrypt.hashSync(password, 10);

    await usuario.set({
        password: hashedPassword,
        actualCode: ""
    })

    await usuario.save();

    try {
        await transporter.sendMail({
            from: '"UNAB-SOCIAL 🌐 - CONTRASEÑA CAMBIADA CORRECTAMENTE" <servicesemer@gmail.com>',
            to: usuario.email.toLowerCase(),
            subject: "Tú contraseña ha sido cambiada ✔",
            html: `
                        <h1>Tú contraseña ha cambiado correctamente.</h1>
                    `
        });
        return res.json({message: "Tú contraseña ha sido reestablecida correctamente."})
    } catch (e) {
        return res.json({error: "Algo salio mal con el correo electronico"})
    }
})

module.exports = router;