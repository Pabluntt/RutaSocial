package utils

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"regexp"
)

// IsValidEmail verifica si un correo electrónico es válido utilizando una expresión regular.
// La expresión regular utilizada verifica que el correo tenga un formato correcto, incluyendo caracteres permitidos antes y después del símbolo '@', y un dominio válido.
func IsValidEmail(email string) bool {
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-z]{2,}$`)
	return re.MatchString(email)
}

// IsValidString verifica si una cadena de texto es válida, esta función es utilizada para validar nombres (de personas e instituciones), descripciones y otros campos de texto.
// La expresión regular utilizada permite letras, números, espacios, guiones, guiones bajos, puntos, comas, arrobas y acentos en letras.
func IsValidString(str string) bool {
	re := regexp.MustCompile(`^[a-zA-Z0-9\s\-\_\.\,\@:áéíóúÁÉÍÓÚñÑ]+$`)
	return re.MatchString(str)
}

// IsValidPhone verifica si un número de teléfono es válido.
// La expresión regular utilizada permite números con o sin el símbolo '+' al inicio, seguido de uno o más dígitos.
func IsValidPhone(phone string) bool {
	re := regexp.MustCompile(`^\+{0,1}[0-9]+$`)
	return re.MatchString(phone)
}

// IsValidColor verifica si un color en formato hexadecimal es válido, es utilizada únicamente para validar colores de instituciones.
// La expresión regular utilizada permite colores en formato #RGB o #RRGGBB, donde R, G y B son dígitos hexadecimales (0-9, a-f, A-F).
func IsValidColor(color string) bool {
	re := regexp.MustCompile(`^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$`)
	return re.MatchString(color)
}

// SanitizeStringFields recorre un mapa de datos de actualización y sanitiza los campos de tipo string.
// Si un campo contiene caracteres inválidos, devuelve un error 400 Bad Request al cliente y retorna false.
func SanitizeStringFields(c *gin.Context, updateData map[string]interface{}) bool {
	for key, value := range updateData {
		strVal, ok := value.(string)
		if ok {
			if !IsValidString(strVal) {
				c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Hay caracteres inválidos"})
				return false
			}
			updateData[key] = strVal
		}
	}
	return true
}
