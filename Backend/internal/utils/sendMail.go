package utils

import (
	"bytes"
	"github.com/SebaVCH/hdcProject/internal/domain"
	"gopkg.in/gomail.v2"
	"html/template"
	"os"
	"strconv"
)

// SendNotificationMail envía un correo electrónico de notificación al usuario con la información del aviso.
// Utiliza una plantilla HTML para darle estructura al contenido del correo.
// Recibe un objeto Usuario y un objeto Aviso como parámetros.
// Devuelve un error si ocurre algún problema al enviar el correo.
func SendNotificationMail(user domain.Usuario, notification domain.Aviso) error {

	HTMLLoad, err := template.ParseFiles("internal/utils/Template_Notification.html")
	if err != nil {
		return err
	}

	data := struct {
		UserName string
		Aviso    domain.Aviso
	}{
		UserName: user.Name,
		Aviso:    notification,
	}

	var body bytes.Buffer
	if err := HTMLLoad.Execute(&body, data); err != nil {
		return err
	}

	newMail := gomail.NewMessage()
	newMail.SetHeader("From", os.Getenv("EMAIL_FROM"))
	newMail.SetHeader("To", user.Email)
	newMail.SetHeader("Subject", "Aviso de ruta")
	newMail.SetBody("text/html", body.String())

	portStr := os.Getenv("SMTP_PORT")
	port, err := strconv.Atoi(portStr)
	if err != nil {
		return err
	}

	dialer := gomail.NewDialer(os.Getenv("SMTP_HOST"), port, os.Getenv("EMAIL_FROM"), os.Getenv("EMAIL_PASS"))

	return dialer.DialAndSend(newMail)
}

// SendRegistrationMail envía un correo electrónico de bienvenida al usuario.
// Utiliza una plantilla HTML para darle estructura al contenido del correo.
// Devuelve un error si ocurre algún problema al enviar el correo.
func SendRegistrationMail(user domain.Usuario) error {

	HTMLLoad, err := template.ParseFiles("internal/utils/Template_Registration.html")
	if err != nil {
		return err
	}

	data := struct {
		UserName string
	}{
		UserName: user.Name,
	}

	var body bytes.Buffer
	if err := HTMLLoad.Execute(&body, data); err != nil {
		return err
	}

	newMail := gomail.NewMessage()
	newMail.SetHeader("From", os.Getenv("EMAIL_FROM"))
	newMail.SetHeader("To", user.Email)
	newMail.SetHeader("Subject", "Registro completo!")
	newMail.SetBody("text/html", body.String())

	portStr := os.Getenv("SMTP_PORT")
	port, err := strconv.Atoi(portStr)
	if err != nil {
		return err
	}

	dialer := gomail.NewDialer(os.Getenv("SMTP_HOST"), port, os.Getenv("EMAIL_FROM"), os.Getenv("EMAIL_PASS"))

	return dialer.DialAndSend(newMail)
}
