const API_URL = "https://www.cyloware.com";

export async function loginUser({ username, password }: { username: string, password: string }) {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    
    const text = await res.text();
    console.log("Login response:", text);
    
    try {
      return JSON.parse(text);
    } catch {
      return { success: false, message: "Invalid server response" };
    }
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, message: "Network error" };
  }
}

export async function signupUser({ username, password }: { username: string, password: string }) {
  try {
    const res = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    
    const text = await res.text();
    console.log("Signup response:", text);
    
    try {
      return JSON.parse(text);
    } catch {
      return { success: false, message: "Invalid server response" };
    }
  } catch (err) {
    console.error("Signup error:", err);
    return { success: false, message: "Network error" };
  }
}
