package repository

import (
	"context"
	"log/slog"
)

func logRepositoryError(ctx context.Context, repository string, operation string, err error, attrs ...any) {
	if err == nil {
		return
	}

	logAttrs := []any{
		"repository", repository,
		"operation", operation,
		"error", err,
	}
	logAttrs = append(logAttrs, attrs...)

	slog.ErrorContext(ctx, "repository operation failed", logAttrs...)
}

func logRepositoryWarn(ctx context.Context, repository string, operation string, err error, attrs ...any) {
	if err == nil {
		return
	}

	logAttrs := []any{
		"repository", repository,
		"operation", operation,
		"error", err,
	}
	logAttrs = append(logAttrs, attrs...)

	slog.WarnContext(ctx, "repository operation warning", logAttrs...)
}
