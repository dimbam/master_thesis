export const getEmailsViaGateway = async (): Promise<string[]> => {
  const query = `
      query {
        users {
          email
        }
      }
    `;

  const response = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  const { data } = await response.json();
  return data.users.map((u: { email: string }) => u.email);
};
