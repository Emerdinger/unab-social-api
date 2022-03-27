function verificationMail(code) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Plantilla código</title>
        </head>
        <body>
            <div style="font-size: 13px; margin: auto; max-width: 640px; padding: 0; background-color: #f8f8f8; font-family: tahoma, sans-serif; border-radius: 24px; border: 1px solid #000;">
                <div
                style="box-sizing: border-box; height: 170px; width: 100%; border-radius: 24px 24px 0 0; background-size: cover; background-image: url(https://www.periodico15.com/wp-content/uploads/2020/04/UNAB.jpg);"
                >
                    <img
                            src="https://upload.wikimedia.org/wikipedia/commons/d/de/LogoUnab.png"
                            alt="Logo"
                            style="height: 48px; margin-top: 18px; margin-left: 18px;"
                    />
                    <h2
                            style="padding: 12px 18px; margin: auto; margin-top: 75px; background: #fff; width: -webkit-fit-content; width: -moz-fit-content; width: fit-content; border-radius: 12px; border: 1px solid #6a6c6e4f; color: #6f2fd3;"
                    >TÚ CÓDIGO DE VERIFICACIÓN</h2>
                </div>
                <div style="padding: 24px;" >
                    <h2 style="text-align: center;">${code}</h2>
                </div>
            </div>
        </body>
        </html>
    `;
}

function resetPasswordEmail(code) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Plantilla código</title>
        </head>
        <body>
            <div style="font-size: 13px; margin: auto; max-width: 640px; padding: 0; background-color: #f8f8f8; font-family: tahoma, sans-serif; border-radius: 24px; border: 1px solid #000;">
                <div
                style="box-sizing: border-box; height: 170px; width: 100%; border-radius: 24px 24px 0 0; background-size: cover; background-image: url(https://www.periodico15.com/wp-content/uploads/2020/04/UNAB.jpg);"
                >
                    <img
                            src="https://upload.wikimedia.org/wikipedia/commons/d/de/LogoUnab.png"
                            alt="Logo"
                            style="height: 48px; margin-top: 18px; margin-left: 18px;"
                    />
                    <h2
                            style="padding: 12px 18px; margin: auto; margin-top: 75px; background: #fff; width: -webkit-fit-content; width: -moz-fit-content; width: fit-content; border-radius: 12px; border: 1px solid #6a6c6e4f; color: #6f2fd3;"
                    >CÓDIGO DE RECUPERACIÓN</h2>
                </div>
                <div style="padding: 24px;" >
                    <h2 style="text-align: center;">${code}</h2>
                </div>
            </div>
        </body>
        </html>
    `;
}

module.exports = {
    verificationMail,
    resetPasswordEmail
}