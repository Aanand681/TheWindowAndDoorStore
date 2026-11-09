import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown, headers?: HeadersInit): NextResponse {
  console.error('[API Error caught]:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code, details: error.details },
      { status: error.statusCode, headers }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.flatten(),
      },
      { status: 400, headers }
    );
  }

  if (error instanceof Error) {
    // MongoDB duplicate key error (E11000)
    if (error.message.includes('E11000') || error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'A record with this identifier already exists.', code: 'DUPLICATE_KEY' },
        { status: 409, headers }
      );
    }

    // MongoDB connection error
    if (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('MongoServerSelectionError') ||
      error.message.includes('MongooseServerSelectionError')
    ) {
      return NextResponse.json(
        { error: 'Database service is temporarily unavailable.', code: 'DB_CONNECTION_ERROR' },
        { status: 503, headers }
      );
    }

    // MongoDB invalid ObjectId error (Cast to ObjectId failed)
    if (error.name === 'CastError' || error.message.includes('Cast to ObjectId failed')) {
      return NextResponse.json(
        { error: 'Invalid resource identifier format.', code: 'INVALID_ID' },
        { status: 400, headers }
      );
    }
  }

  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500, headers }
  );
}

export function createApiResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
