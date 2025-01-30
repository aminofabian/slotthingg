export const generateUniqueUsername = () => {
  // Generate random components
  const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
  let randomStr = '';
  for (let i = 0; i < 3; i++) {
    randomStr += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  // Combine components: player + 4 digits + 3 random chars
  return `player${randomNum}${randomStr}`;
};

export const signupUser = async (email: string) => {
  const whitelabel_admin_uuid = localStorage.getItem('whitelabel_admin_uuid');
  
  if (!whitelabel_admin_uuid) {
    throw new Error('Missing whitelabel admin UUID');
  }

  // Generate a unique username
  const username = generateUniqueUsername();

  try {
    const response = await fetch('https://serverhub.biz/users/otp-signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        whitelabel_admin_uuid,
        email
      })
    });

    const data = await response.json();
    console.log('OTP Signup Response:', data);

    if (!response.ok) {
      if (data.email?.[0]?.includes('already exists')) {
        throw new Error('This email is already registered. Please try logging in instead.');
      }
      throw new Error(data.message || data.detail || 'Failed to send OTP');
    }
    
    return { ...data, username, email };
  } catch (error) {
    console.error('Error during signup:', error);
    throw error;
  }
}; 