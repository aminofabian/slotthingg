import { z } from 'zod';

const dashboardResponseSchema = z.object({
  data: z.object({
    logo: z.string().url(),
    maintenance_mode: z.boolean(),
    whitelabel_admin_uuid: z.string().uuid(),
    project_name: z.string()
  })
});

export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;

export const fetchDashboardData = async () => {
  try {
    const response = await fetch('https://serverhub.biz/users/dashboard-games/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_domain: "https://serverhub.biz"
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    const data = await response.json();
    const validatedData = dashboardResponseSchema.parse(data);
    
    // Store the whitelabel_admin_uuid in localStorage
    localStorage.setItem('whitelabel_admin_uuid', validatedData.data.whitelabel_admin_uuid);
    
    return validatedData;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

let currentUsername = 0;

export const generateUsername = () => {
  currentUsername++;
  return `user${String(currentUsername).padStart(6, '0')}`;
};

export const signupUser = async (email: string) => {
  const whitelabel_admin_uuid = localStorage.getItem('whitelabel_admin_uuid');
  
  if (!whitelabel_admin_uuid) {
    throw new Error('Missing whitelabel admin UUID');
  }

  const username = generateUsername();

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

    if (!response.ok) {
      throw new Error('Signup failed');
    }

    const data = await response.json();
    return { ...data, username };
  } catch (error) {
    console.error('Error during signup:', error);
    throw error;
  }
}; 