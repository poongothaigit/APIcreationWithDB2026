import { test, expect } from "@playwright/test";

test("Login user and get access token", async ({ request }) => {

  const response = await request.post("/api/auth/login", {
    data: {
      email: "kiran@gmail.com",
      password: "03072026"
    }
  });

  const body = await response.json();
  console.log(body);

  expect(response.status()).toBe(200);
  expect(body).toHaveProperty("accessToken");
});
