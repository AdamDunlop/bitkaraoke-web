// auth.js - UPDATED
const API_URL = "https://www.cyloware.com"; // ✅ Use your domain

export async function loginUser({ username, password }) {
  console.log('📱 PHONE REQUEST DETAILS:');
  console.log('URL:', `${API_URL}/login`);
  console.log('Method: POST');
  console.log('Headers:', {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });
  console.log('Body:', JSON.stringify({ username, password }));
  
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ username, password }),
    });

    console.log('📱 PHONE RESPONSE:');
    console.log('Status:', res.status, res.statusText);
    console.log('Headers:', Object.fromEntries(res.headers.entries()));
    
    const text = await res.text();
    console.log('📱 Raw response text:', text);
    
    // Try to parse
    try {
      const data = JSON.parse(text);
      console.log('📱 Parsed data:', data);
      return data;
    } catch (e) {
      console.error('📱 Parse error:', e);
      return { success: false, message: "Invalid JSON: " + text.substring(0, 50) };
    }
  } catch (err) {
    console.error('📱 Network error:', err);
    return { success: false, message: "Network: " + err.message };
  }
}

export async function signupUser({ username, password }) {
  console.log('auth.js: Signing up to', API_URL);
  
  if (!username || !password) {
    return { success: false, message: "Missing credentials" };
  }

  try {
    const res = await fetch(`${API_URL}/signup`, {  // ✅ Use domain
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    console.log('auth.js: Signup response status:', res.status);
    const text = await res.text();
    console.log('auth.js: Signup response text:', text);
    
    try {
      const data = JSON.parse(text);
      return data;
    } catch (parseError) {
      console.error('auth.js: JSON parse error:', parseError);
      return { success: false, message: "Invalid server response" };
    }
  } catch (err) {
    console.error('auth.js: Network error:', err);
    return { success: false, message: "Network error: " + err.message };
  }
}