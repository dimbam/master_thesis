export const checkEmail = async (email: string): Promise<boolean> => {
  const response = await fetch('http://localhost:5000/check-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  return data.exists;
};
