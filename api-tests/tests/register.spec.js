import { test, expect } from "@playwright/test";

test("Register new user", async ({ request }) => {

  const role = "user";
  const response = await request.post("/api/auth/register", {
    data: {
      name: "Kiran",
      email: "kiran@gmail.com",
      password: "03072026",
      role: role
    }
  });

  const body = await response.json();
  console.log(body);

  expect(response.status()).toBe(200);
  // Dynamically check role in message
  expect(body.message).toContain(`Registered successfully as ${role}`);
});
