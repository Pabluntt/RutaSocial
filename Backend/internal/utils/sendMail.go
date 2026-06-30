package utils

import (
	"bytes"
	"html/template"
	"os"
	"strconv"

	"github.com/SebaVCH/hdcProject/internal/domain"
	"gopkg.in/gomail.v2"
)

type mailData struct {
	UserName string
	Aviso    domain.Aviso
}

func sendTemplatedMail(to, subject, templatePath string, data any) error {
	HTMLLoad, err := template.ParseFiles(templatePath)
	if err != nil {
		return err
	}

	var body bytes.Buffer
	if err := HTMLLoad.Execute(&body, data); err != nil {
		return err
	}

	newMail := gomail.NewMessage()
	newMail.SetHeader("From", os.Getenv("EMAIL_FROM"))
	newMail.SetHeader("To", to)
	newMail.SetHeader("Subject", subject)
	newMail.SetBody("text/html", body.String())

	port, err := strconv.Atoi(os.Getenv("SMTP_PORT"))
	if err != nil {
		return err
	}

	dialer := gomail.NewDialer(os.Getenv("SMTP_HOST"), port, os.Getenv("EMAIL_FROM"), os.Getenv("EMAIL_PASS"))
	return dialer.DialAndSend(newMail)
}

// SendNotificationMail envía un correo electrónico de notificación al usuario con la información del aviso.
// Utiliza una plantilla HTML para darle estructura al contenido del correo.
// Recibe un objeto Usuario y un objeto Aviso como parámetros.
// Devuelve un error si ocurre algún problema al enviar el correo.
func SendNotificationMail(user domain.Usuario, notification domain.Aviso) error {
	data := mailData{
		UserName: user.Name,
		Aviso:    notification,
	}
	return sendTemplatedMail(user.Email, "Aviso de ruta", "internal/utils/Template_Notification.html", data)
}

// SendRegistrationMail envía un correo electrónico de bienvenida al usuario.
// Utiliza una plantilla HTML para darle estructura al contenido del correo.
// Devuelve un error si ocurre algún problema al enviar el correo.
func SendRegistrationMail(user domain.Usuario) error {
	data := mailData{
		UserName: user.Name,
	}
	return sendTemplatedMail(user.Email, "Registro completo!", "internal/utils/Template_Registration.html", data)
}
