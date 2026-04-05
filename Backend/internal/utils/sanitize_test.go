package utils

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestIsValidEmail_NormalEmail_True(t *testing.T) {
	email := "test@gmail.com"
	ok := IsValidEmail(email)
	assert.True(t, ok, "El email debe ser válido")
}

func TestIsValidEmail_InvalidDomain_False(t *testing.T) {
	email := "test@.com"
	ok := IsValidEmail(email)
	assert.False(t, ok, "El email debe tener dominio ")
}

func TestIsValidEmail_MissingAtSymbol_False(t *testing.T) {
	email := "testgmail.com"
	ok := IsValidEmail(email)
	assert.False(t, ok, "El email debe contener el símbolo @")
}

func TestIsValidEmail_EmptyBeforeAtSymbol_False(t *testing.T) {
	email := "@gmail.com"
	ok := IsValidEmail(email)
	assert.False(t, ok, "El email no debe estar vacío antes del símbolo @")
}

func TestIsValidEmail_MissingDotSymbol_False(t *testing.T) {
	email := "test@gmailcom"
	ok := IsValidEmail(email)
	assert.False(t, ok, "El email debe contener un punto después del símbolo @")
}

func TestIsValidEmail_EmptyEmail_False(t *testing.T) {
	email := ""
	ok := IsValidEmail(email)
	assert.False(t, ok, "El email no debe estar vacío")
}

func TestIsValidEmail_ShortTLD_False(t *testing.T) {
	email := "test@gmail.c"
	ok := IsValidEmail(email)
	assert.False(t, ok, "El email debe tener un TLD de al menos 2 caracteres")
}

func TestIsValidEmail_SubDomain_True(t *testing.T) {
	email := "test@me.gmail.com"
	ok := IsValidEmail(email)
	assert.True(t, ok, "El email debe ser válido con subdominio")
}

func TestIsValidEmail_SpecialCharacters_False(t *testing.T) {
	email := "test$@gmail.com"
	ok := IsValidEmail(email)
	assert.False(t, ok, "El email no debe contener caracteres especiales como $")
}

func TestIsValidPhone_NormalPhoneWithoutPlus_True(t *testing.T) {
	phone := "1234567890"
	ok := IsValidPhone(phone)
	assert.True(t, ok, "El número de teléfono debe ser válido sin el prefijo +")
}
func TestIsValidPhone_NormalPhoneWithPlus_True(t *testing.T) {
	phone := "+1234567890"
	ok := IsValidPhone(phone)
	assert.True(t, ok, "El número de teléfono debe ser válido con el prefijo +")
}

func TestIsValidPhone_EmptyPhone_False(t *testing.T) {
	phone := ""
	ok := IsValidPhone(phone)
	assert.False(t, ok, "El número de teléfono no debe estar vacío")
}

func TestIsValidPhone_InvalidCharacters_False(t *testing.T) {
	phone := "123-456-7890"
	ok := IsValidPhone(phone)
	assert.False(t, ok, "El número de teléfono no debe contener guiones")
}

func TestIsValidPhone_AlphanumericCharacters_False(t *testing.T) {
	phone := "123abc456"
	ok := IsValidPhone(phone)
	assert.False(t, ok, "El número de teléfono no debe contener caracteres alfabéticos")
}

func TestIsValidPhone_SpecialCharacters_False(t *testing.T) {
	phone := "123$4567890"
	ok := IsValidPhone(phone)
	assert.False(t, ok, "El número de teléfono no debe contener caracteres especiales como $")
}

func FuzzIsValidPhone_AnyNumber_True(f *testing.F) {
	f.Add("0123456789")
	f.Add("+0123456789")
	f.Fuzz(func(t *testing.T, phone string) {
		ok := IsValidPhone(phone)
		assert.True(t, ok, "El número de teléfono debe ser válido si contiene solo dígitos")
	})
}

func TestIsValidString_NormalString_True(t *testing.T) {
	stringTest := "Helló World-123.,@_"
	ok := IsValidString(stringTest)
	assert.True(t, ok, "La cadena debe ser solo puede presentar caracteres alfanuméricos, espacios, guiones, guiones bajos, puntos y comas")
}

func TestIsValidString_EmptyString_False(t *testing.T) {
	stringTest := ""
	ok := IsValidString(stringTest)
	assert.False(t, ok, "La cadena no debe estar vacía")
}

func TestIsValidString_InvalidCharacters_False(t *testing.T) {
	stringTest := "Hello World!#[]<>"
	ok := IsValidString(stringTest)
	assert.False(t, ok, "La cadena debe ser solo puede presentar caracteres alfanuméricos, espacios, guiones, guiones bajos, puntos y comas")
}

func FuzzIsValidString_AnyChars_True(f *testing.F) {
	f.Add("0123456789")
	f.Add("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz")
	f.Add("Hello World-123.,@_")
	f.Fuzz(func(t *testing.T, str string) {
		ok := IsValidString(str)
		assert.True(t, ok, "La cadena debe ser solo puede presentar caracteres alfanuméricos, espacios, guiones, guiones bajos, puntos y comas")
	})
}

func TestIsValidColor_OnlyNumbers_True(t *testing.T) {
	normalColor := "#123"
	ok := IsValidColor(normalColor)
	assert.True(t, ok, "La cadena solo debe contener letras desde la a hasta la f y/o numeros desde el 0 hasta el 9")
}

func TestIsValidColor_OnlyNumbers6Digits_True(t *testing.T) {
	normalColor := "#123456"
	ok := IsValidColor(normalColor)
	assert.True(t, ok, "La cadena solo debe contener letras desde la a hasta la f y/o numeros desde el 0 hasta el 9")
}

func TestIsValidColor_OnlyLetters_True(t *testing.T) {
	normalColor := "#abc"
	ok := IsValidColor(normalColor)
	assert.True(t, ok, "La cadena solo debe contener letras desde la a hasta la f y/o numeros desde el 0 hasta el 9")
}

func TestIsValidColor_OnlyLetters6Digits_True(t *testing.T) {
	normalColor := "#abcdef"
	ok := IsValidColor(normalColor)
	assert.True(t, ok, "La cadena solo debe contener letras desde la a hasta la f y/o numeros desde el 0 hasta el 9")
}

func TestIsValidColor_mixedString_True(t *testing.T) {
	normalColor := "#0ab2c2"
	ok := IsValidColor(normalColor)
	assert.True(t, ok, "La cadena solo debe contener letras desde la a hasta la f y/o numeros desde el 0 hasta el 9")
}

func TestIsValidColor_unacceptedLetters_False(t *testing.T) {
	normalColor := "#gggggg"
	ok := IsValidColor(normalColor)
	assert.False(t, ok, "La cadena solo debe contener letras desde la a hasta la f y/o numeros desde el 0 hasta el 9")
}

func TestIsValidColor_unacceptedChars_False(t *testing.T) {
	normalColor := "#!%&"
	ok := IsValidColor(normalColor)
	assert.False(t, ok, "La cadena solo debe contener letras desde la a hasta la f y/o numeros desde el 0 hasta el 9")
}


