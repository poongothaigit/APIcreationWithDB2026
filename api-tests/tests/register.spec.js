import { test, expect } from "@playwright/test";
import { getAccessToken } from "../utils/getToken";
import jwt from "jsonwebtoken";

test.describe.serial('API with Mongo DB', () => {
//1. Register
test("Register new user", async ({ request }) => {

  const role = "admin";
  const response = await request.post("/api/auth/register", {
    data: {
      name: "Diya",
      email: "diyaa@gmail.com",
      password: "04072026",
      role: role
    }
  });

  const body = await response.json();
  console.log(body);

  expect(response.status()).toBe(200);
  // Dynamically check role in message
  expect(body.message).toContain(`Registered successfully as ${role}`);
});

//2. Login
test("Login user and get access token", async ({ request }) => {

  const response = await request.post("/api/auth/login", {
    data: {
      email: "diyaa@gmail.com",
      password: "04072026"
    }
  });

  const body = await response.json();
  console.log(body);

  expect(response.status()).toBe(200);
  expect(body).toHaveProperty("accessToken");
});

//3. AdminProfile request
test("User should NOT access admin dashboard", async ({ request }) => {

  // Step 1: Get token from helper
   const token = await getAccessToken(request, "diyaa@gmail.com", "04072026"); 

// Step 2: Decode token to get role
  const decoded = jwt.decode(token); // just decode, not verify
  console.log("Decoded token:", decoded);

  // Step 3: Try admin route
  const response = await request.get("/api/auth/admin/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const body = await response.json();
  console.log(body);

  // Step 4: Validate based on expected role
  if (decoded === "admin") {
    expect(response.status()).toBe(200);
    expect(body.message).toContain("Welcome Admin");
  } else {
    expect(response.status()).toBe(403);
    expect(body.message).toBe("Admin only access");
  }
});

//4. User profile request
test("User can access user dashboard", async ({ request }) => {
  
  // Step 1: Get token from helper
  const token = await getAccessToken(request, "diyaa@gmail.com", "04072026");

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

});
