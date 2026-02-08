export async function getAccessToken(request, email, password) {
  const loginResponse = await request.post("/api/auth/login", {
    data: { email, password }
  });
  const loginBody = await loginResponse.json();
  return loginBody.accessToken;
}
