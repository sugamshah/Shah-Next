export const getErrorDetails = (status: number) => {
  const map: Record<number, { title: string; description: string }> = {
    400: { title: 'Bad Request', description: 'The request could not be processed.' },
    401: { title: 'Unauthorized', description: 'Please sign in to continue.' },
    403: { title: 'Forbidden', description: 'You do not have permission to view this resource.' },
    404: { title: 'Not Found', description: 'The requested page could not be found.' },
    429: { title: 'Too Many Requests', description: 'Please slow down and try again.' },
    500: { title: 'Server Error', description: 'The server encountered an error.' },
  };

  return map[status] ?? { title: 'Unexpected Error', description: 'Please try again in a moment.' };
};
