const API_BASE_URL = 'http://localhost:8080'; // It's better to move this to an env variable

export const updateUserProfile = async (userId, formData, token) => {
    try {
        // Note: When using FormData with fetch, the Content-Type header is set automatically.
        const response = await fetch(`${API_BASE_URL}/api/user/${userId}/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update profile.');
        }

        return data;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};
