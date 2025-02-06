/**
 * Authentication utilities
 */

import { generateUsername } from './utils';

interface SignupResponse {
  email: string;
  username: string;
}

interface VerifyOTPResponse {
  success: boolean;
  message: string;
}

/**
 * Initiates the signup process by requesting an OTP
 */
export async function signupUser(email: string): Promise<SignupResponse> {
  const whitelabel_admin_uuid = localStorage.getItem('whitelabel_admin_uuid');
  
  if (!whitelabel_admin_uuid) {
    throw new Error('Missing whitelabel admin UUID');
  }

  const username = generateUsername();
  console.log('Generated username:', username);

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

    if (!response.ok) {
      if (data.email?.[0]?.includes('already exists')) {
        throw new Error('This email is already registered. Please try logging in instead.');
      }
      throw new Error(data.message || data.detail || 'Failed to send OTP');
    }

    return {
      email,
      username
    };
  } catch (error) {
    console.error('Error during signup:', error);
    throw error;
  }
}

export async function verifyOTP(data: { 
  email: string; 
  username: string; 
  otp: string;
  password: string;
  full_name: string;
  dob: string;
  mobile_number: string;
  State: string;
  whitelabel_admin_uuid: string;
}): Promise<VerifyOTPResponse> {
  try {
    console.log('Raw data received by verifyOTP:', data);

    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    formData.append('whitelabel_admin_uuid', data.whitelabel_admin_uuid);
    formData.append('otp', data.otp);
    formData.append('full_name', data.full_name);
    formData.append('email', data.email);
    formData.append('dob', data.dob);
    formData.append('mobile_number', data.mobile_number);
    formData.append('State', data.State);

    // Log FormData entries
    console.log('FormData entries being sent:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await fetch('https://serverhub.biz/users/signup/', {
      method: 'POST',
      body: formData
    });

    const responseData = await response.json();
    console.log('Full server response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData
    });

    if (!response.ok) {
      // Handle specific error cases
      if (responseData.email?.[0]) {
        throw new Error(`Email error: ${responseData.email[0]}`);
      }
      if (responseData.non_field_errors?.[0]) {
        throw new Error(responseData.non_field_errors[0]);
      }
      if (responseData.otp?.[0]) {
        throw new Error(`OTP error: ${responseData.otp[0]}`);
      }
      // Log the full error response
      console.error('Server error details:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      throw new Error(responseData.message || responseData.detail || 'Signup failed');
    }

    return {
      success: true,
      message: 'Account created successfully'
    };
  } catch (error) {
    console.error('Full error details:', error);
    throw error;
  }
} 