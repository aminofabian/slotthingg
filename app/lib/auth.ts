export const signupUser = async (email: string) => {
  const whitelabel_admin_uuid = localStorage.getItem('whitelabel_admin_uuid');
  
  if (!whitelabel_admin_uuid) {
    throw new Error('Missing whitelabel admin UUID');
  }

  // Generate username in the format "player" + number padded to 3 digits
  const randomNum = Math.floor(Math.random() * 999) + 1;
  const username = `player${String(randomNum).padStart(3, '0')}`;

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