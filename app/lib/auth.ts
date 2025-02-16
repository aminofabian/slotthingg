/**
 * Authentication utilities
 */

import { generateUsername } from './utils';

interface SignupResponse {
  email: string;
  username: string;
  whitelabel_admin_uuid: string;
}

interface VerifyOTPResponse {
  success: boolean;
  message: string;
}

interface DashboardResponse {
  data: {
    logo: string;
    maintenance_mode: boolean;
    whitelabel_admin_uuid: string;
    project_name: string;
  }
}

/**
 * Initiates the signup process by requesting an OTP
 */
export async function signupUser(email: string, username: string, whitelabel_admin_uuid: string): Promise<SignupResponse> {
  if (!whitelabel_admin_uuid) {
    throw new Error('Missing whitelabel admin UUID');
  }

  try {
    console.log('Attempting signup with UUID:', whitelabel_admin_uuid);
    
    const response = await fetch('https://serverhub.biz/users/otp-signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        whitelabel_admin_uuid,
        email,
        project_url: window.location.origin
      })
    });

    const data = await response.json();
    console.log('Signup response:', {
      status: response.status,
      statusText: response.statusText,
      data,
      sentUUID: whitelabel_admin_uuid
    });

    if (!response.ok) {
      console.error('Signup failed:', data);
      throw new Error(JSON.stringify(data));
    }

    return {
      email,
      username,
      whitelabel_admin_uuid
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
  state: string;
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
    formData.append('state', data.state);

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

/**
 * Fetches dashboard data including whitelabel admin UUID
 */
export async function fetchDashboardData(): Promise<string> {
  try {
    console.log('Fetching dashboard data...');
    const project_url = window.location.origin;
    
    const response = await fetch('https://serverhub.biz/users/dashboard-games/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_url
      })
    });

    const data: DashboardResponse = await response.json();
    console.log('Dashboard response:', data);

    if (!response.ok) {
      console.error('Failed to fetch dashboard data:', data);
      throw new Error('Failed to fetch dashboard data');
    }

    if (!data.data?.whitelabel_admin_uuid) {
      throw new Error('No whitelabel admin UUID in response');
    }

    // Store the UUID in localStorage
    localStorage.setItem('whitelabel_admin_uuid', data.data.whitelabel_admin_uuid);
    console.log('Stored UUID in localStorage:', data.data.whitelabel_admin_uuid);
    return data.data.whitelabel_admin_uuid;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

/**
 * Generates and stores the whitelabel admin UUID
 */
export async function generateWhitelabelUUID(project_url: string): Promise<string> {
  try {
    console.log('Generating whitelabel UUID for project URL:', project_url);
    
    const response = await fetch('https://serverhub.biz/admin/generate-uuid/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_url
      })
    });

    const data = await response.json();
    console.log('Generate UUID response:', data);

    if (!response.ok) {
      console.error('Failed to generate UUID:', data);
      throw new Error(data.message || data.detail || 'Failed to generate whitelabel admin UUID');
    }

    // Store the UUID in localStorage
    localStorage.setItem('whitelabel_admin_uuid', data.whitelabel_admin_uuid);
    console.log('Stored UUID in localStorage:', data.whitelabel_admin_uuid);
    return data.whitelabel_admin_uuid;
  } catch (error) {
    console.error('Error generating whitelabel UUID:', error);
    throw error;
  }
}