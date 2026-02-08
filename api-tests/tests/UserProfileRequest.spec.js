import { test, expect } from "@playwright/test"; 
import { getAccessToken } from "../utils/getToken";

test("User can access user dashboard", async ({ request }) => {
  
  // Step 1: Get token from helper
  const token = await getAccessToken(request, "kiran@gmail.com", "03072026");

  // Step 2: Access user dashboard
  const response = await request.get("/api/auth/user/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const body = await response.json();
  console.log(body);

  expect(response.status()).toBe(200);
  expect(body.message).toContain("Welcome User");
});
