package utils

import "math/rand/v2"

// letterBytes es un string que contiene todas las letras mayúsculas y minúsculas del alfabeto.
const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

// randStringBytes genera una cadena aleatoria de longitud n utilizando letras del alfabeto definido en letterBytes.
// Esta función recibe un entero n y devuelve una cadena de caracteres aleatorios de longitud n.
func randStringBytes(n int) string {
	b := make([]byte, n)
	for i := range b {
		b[i] = letterBytes[rand.IntN(len(letterBytes))]
	}
	return string(b)
}

// NewInviteCode genera un código de invitación aleatorio en el formato "XXX-XXX".
// Utiliza la función randStringBytes para crear dos partes de 3 caracteres cada una, separadas por un guion.
func NewInviteCode() string {
	return randStringBytes(3) + "-" + randStringBytes(3)
}
