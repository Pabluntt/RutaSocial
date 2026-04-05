package utils

import (
	"regexp"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewInviteCode_Format_True(t *testing.T) {
	code := NewInviteCode()
	matched, err := regexp.MatchString(`^[a-zA-Z]{3}-[a-zA-Z]{3}$`, code)
	assert.NoError(t, err)
	assert.True(t, matched, "El código debe tener el formato aaa-aaa con letras")
}

func TestNewInviteCode_Length_7Digits(t *testing.T) {
	code := NewInviteCode()
	assert.Equal(t, 7, len(code), "El código debe tener 7 caracteres")
}
