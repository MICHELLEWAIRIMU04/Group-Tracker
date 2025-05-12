// API service functions

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Authentication token is missing');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

// Auth API
export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Members API
export const getMembers = async () => {
  try {
    const response = await fetch(`${API_URL}/members`, {
      headers: getAuthHeaders(),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Get members error:', error);
    throw error;
  }
};

export const getMemberById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/members/${id}`, {
      headers: getAuthHeaders(),
    });
    
    return await response.json();
  } catch (error) {
    console.error(`Get member ${id} error:`, error);
    throw error;
  }
};

export const addMember = async (memberData) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token being used:', token); // Debug log
      
      const response = await fetch(`${API_URL}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(memberData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Add member failed:', response.status, errorData);
        throw new Error(errorData.message || `Add member failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Add member error:', error);
      throw error;
    }
  };

export const deleteMember = async (id) => {
  try {
    const response = await fetch(`${API_URL}/members/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    return await response.json();
  } catch (error) {
    console.error(`Delete member ${id} error:`, error);
    throw error;
  }
};

// Activities API - UPDATED to use group activities endpoints
export const getActivities = async (groupId) => {
  try {
    // For activities, we need a group ID
    if (!groupId) {
      throw new Error('Group ID is required to fetch activities');
    }
    
    const response = await fetch(`${API_URL}/group/${groupId}/activities`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Get activities failed:', response.status, errorData);
      throw new Error(errorData.message || `Failed to get activities: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get activities error:', error);
    throw error;
  }
};

export const getActivityById = async (groupId, activityId) => {
  try {
    if (!groupId || !activityId) {
      throw new Error('Both Group ID and Activity ID are required');
    }
    
    const response = await fetch(`${API_URL}/group/${groupId}/activities/${activityId}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Get activity ${activityId} failed:`, response.status, errorData);
      throw new Error(errorData.message || `Failed to get activity: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Get activity ${activityId} error:`, error);
    throw error;
  }
};

export const createActivity = async (groupId, activityData) => {
  try {
    if (!groupId) {
      throw new Error('Group ID is required to create an activity');
    }
    
    console.log(`Creating activity in group ${groupId} with data:`, activityData);
    const headers = getAuthHeaders();
    console.log('Request headers:', headers);
    
    const response = await fetch(`${API_URL}/group/${groupId}/activities`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(activityData),
    });
    
    // First check if we got a valid JSON response
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Handle non-JSON response (like HTML error page)
      const textResponse = await response.text();
      console.error('Non-JSON response received:', textResponse);
      throw new Error(`Server returned non-JSON response: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Create activity failed:', response.status, data);
      throw new Error(data.message || `Create activity failed: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Create activity error:', error);
    throw error;
  }
};

export const deleteActivity = async (groupId, activityId) => {
  try {
    if (!groupId || !activityId) {
      throw new Error('Both Group ID and Activity ID are required');
    }
    
    const response = await fetch(`${API_URL}/group/${groupId}/activities/${activityId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Delete activity failed:', response.status, errorData);
      throw new Error(errorData.message || `Delete activity failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Delete activity error:', error);
    throw error;
  }
};

// Contributions API
export const getContributions = async () => {
  try {
    const response = await fetch(`${API_URL}/contributions`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Get contributions failed:', response.status, errorData);
      throw new Error(errorData.message || `Failed to get contributions: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get contributions error:', error);
    throw error;
  }
};

export const getContributionById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/contributions/${id}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Get contribution ${id} failed:`, response.status, errorData);
      throw new Error(errorData.message || `Failed to get contribution: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Get contribution ${id} error:`, error);
    throw error;
  }
};

export const createContribution = async (contributionData) => {
  try {
    console.log('Creating contribution with data:', contributionData);
    const headers = getAuthHeaders();
    console.log('Request headers:', headers);
    
    const response = await fetch(`${API_URL}/contributions`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(contributionData),
    });
    
    // First check if we got a valid JSON response
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Handle non-JSON response (like HTML error page)
      const textResponse = await response.text();
      console.error('Non-JSON response received:', textResponse);
      throw new Error(`Server returned non-JSON response: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Create contribution failed:', response.status, data);
      
      // Handle 403 Forbidden specifically for admin privilege issues
      if (response.status === 403) {
        throw new Error('Admin privileges required to manage contributions');
      } else {
        throw new Error(data.message || `Create contribution failed: ${response.status}`);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Create contribution error:', error);
    throw error;
  }
};

export const updateContribution = async (id, contributionData) => {
  try {
    console.log(`Updating contribution ${id} with data:`, contributionData);
    const headers = getAuthHeaders();
    
    const response = await fetch(`${API_URL}/contributions/${id}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(contributionData),
    });
    
    // Check for non-JSON response
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Non-JSON response received:', textResponse);
      throw new Error(`Server returned non-JSON response: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`Update contribution ${id} failed:`, response.status, data);
      
      // Handle 403 Forbidden specifically for admin privilege issues
      if (response.status === 403) {
        throw new Error('Admin privileges required to manage contributions');
      } else {
        throw new Error(data.message || `Update contribution failed: ${response.status}`);
      }
    }
    
    return data;
  } catch (error) {
    console.error(`Update contribution ${id} error:`, error);
    throw error;
  }
};

export const deleteContribution = async (id) => {
  try {
    console.log(`Deleting contribution ${id}`);
    const headers = getAuthHeaders();
    
    const response = await fetch(`${API_URL}/contributions/${id}`, {
      method: 'DELETE',
      headers: headers,
    });
    
    // Check for non-JSON response
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Non-JSON response received:', textResponse);
      throw new Error(`Server returned non-JSON response: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`Delete contribution ${id} failed:`, response.status, data);
      
      // Handle 403 Forbidden specifically for admin privilege issues
      if (response.status === 403) {
        throw new Error('Admin privileges required to manage contributions');
      } else {
        throw new Error(data.message || `Delete contribution failed: ${response.status}`);
      }
    }
    
    return data;
  } catch (error) {
    console.error(`Delete contribution ${id} error:`, error);
    throw error;
  }
};

// Dashboard API
export const getDashboardData = async () => {
    try {
      const headers = getAuthHeaders();
      console.log('Request headers:', headers); // Add this for debugging
      
      const response = await fetch(`${API_URL}/dashboard`, {
        headers: headers,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Dashboard request failed:', response.status, errorData);
        throw new Error(`Dashboard request failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get dashboard data error:', error);
      // Return a default empty structure instead of throwing an error
      return {
        recent_activities: [],
        recent_contributions: [],
        member_stats: [],
        activity_stats: []
      };
    }
  };


// Groups API
export const getGroups = async () => {
  try {
    const response = await fetch(`${API_URL}/groups`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Get groups failed:', response.status, errorData);
      throw new Error(errorData.message || `Failed to get groups: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get groups error:', error);
    throw error;
  }
};

export const getGroupById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/groups/${id}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Get group ${id} failed:`, response.status, errorData);
      throw new Error(errorData.message || `Failed to get group: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Get group ${id} error:`, error);
    throw error;
  }
};

export const createGroup = async (groupData) => {
  try {
    const response = await fetch(`${API_URL}/groups`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(groupData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Create group failed:', response.status, errorData);
      throw new Error(errorData.message || `Create group failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Create group error:', error);
    throw error;
  }
};

export const deleteGroup = async (id) => {
  try {
    const response = await fetch(`${API_URL}/groups/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Delete group ${id} failed:`, response.status, errorData);
      throw new Error(errorData.message || `Delete group failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Delete group ${id} error:`, error);
    throw error;
  }
};

// Group Members API
export const addGroupMember = async (groupId, userId, isAdmin = false) => {
  try {
    const response = await fetch(`${API_URL}/groups/${groupId}/members`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ user_id: userId, is_admin: isAdmin }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Add group member failed:', response.status, errorData);
      throw new Error(errorData.message || `Add member failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Add group member error:', error);
    throw error;
  }
};

export const removeGroupMember = async (groupId, userId) => {
  try {
    const response = await fetch(`${API_URL}/groups/${groupId}/members/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Remove group member failed:', response.status, errorData);
      throw new Error(errorData.message || `Remove member failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Remove group member error:', error);
    throw error;
  }
};

// Group Activities API - these are already correct based on your routes
export const getGroupActivities = async (groupId) => {
  try {
    const response = await fetch(`${API_URL}/group/${groupId}/activities`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Get group activities failed:', response.status, errorData);
      throw new Error(errorData.message || `Failed to get activities: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get group activities error:', error);
    throw error;
  }
};

export const getGroupActivityById = async (groupId, activityId) => {
  try {
    const response = await fetch(`${API_URL}/group/${groupId}/activities/${activityId}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Get group activity ${activityId} failed:`, response.status, errorData);
      throw new Error(errorData.message || `Failed to get activity: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Get group activity ${activityId} error:`, error);
    throw error;
  }
};

export const createGroupActivity = async (groupId, activityData) => {
  try {
    const response = await fetch(`${API_URL}/group/${groupId}/activities`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(activityData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Create group activity failed:', response.status, errorData);
      throw new Error(errorData.message || `Create activity failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Create group activity error:', error);
    throw error;
  }
};

export const deleteGroupActivity = async (groupId, activityId) => {
  try {
    const response = await fetch(`${API_URL}/group/${groupId}/activities/${activityId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Delete group activity ${activityId} failed:`, response.status, errorData);
      throw new Error(errorData.message || `Delete activity failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Delete group activity ${activityId} error:`, error);
    throw error;
  }
};