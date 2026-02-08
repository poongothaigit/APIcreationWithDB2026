import { test, expect } from "@playwright/test";
import { getAccessToken } from "../utils/getToken";
import jwt from "jsonwebtoken";

test("User should NOT access admin dashboard", async ({ request }) => {

  // Step 1: Get token from helper
   const token = await getAccessToken(request, "nila@gmail.com", "02072026"); 

// Step 2: Decode token to get role
  const decoded = jwt.decode(token); // just decode, not verify
  console.log("Decoded token:", decoded);

  // Step 2: Try admin route
  const response = await request.get("/api/auth/admin/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const body = await response.json();
  console.log(body);

  // Step 3: Validate based on expected role
  if (decoded === "admin") {
    expect(response.status()).toBe(200);
    expect(body.message).toContain("Welcome Admin");
  } else {
    expect(response.status()).toBe(403);
    expect(body.message).toBe("Admin only access");
  }
});
