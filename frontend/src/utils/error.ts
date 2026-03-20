import axios from 'axios';

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }

    if (typeof error.response?.data === 'string') {
      return error.response.data;
    }

    if (error.code === 'ERR_NETWORK') {
      return 'Unable to reach the API server. Check VITE_API_BASE_URL, backend address, and CORS settings.';
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error occurred';
}
