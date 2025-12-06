import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import pickupLocationApi from '../../services/pickupLocationApi';
import { toast } from 'react-toastify';

/**
 * React Query hook for managing seller pickup locations
 * Provides CRUD operations with loading/error states and cache management
 */
export const usePickupLocations = () => {
  const queryClient = useQueryClient();

  /**
   * Get all pickup locations
   * @returns {Object} React Query result with locations data
   */
  const getLocations = () => {
    return useQuery({
      queryKey: ['pickupLocations'],
      queryFn: async () => {
        const response = await pickupLocationApi.getLocations();
        const locations = response?.data?.data?.locations || response?.data?.locations || [];
        return locations;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
    });
  };

  /**
   * Get a single pickup location by ID
   * @param {string} id - Location ID
   * @returns {Object} React Query result with location data
   */
  const getLocationById = (id) => {
    return useQuery({
      queryKey: ['pickupLocation', id],
      queryFn: async () => {
        const response = await pickupLocationApi.getLocationById(id);
        return response?.data?.data?.location || response?.data?.location;
      },
      enabled: !!id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  /**
   * Create a new pickup location
   * @returns {Object} React Query mutation object
   */
  const createLocation = () => {
    return useMutation({
      mutationFn: async (locationData) => {
        const response = await pickupLocationApi.createLocation(locationData);
        return response?.data?.data?.location || response?.data?.location;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['pickupLocations'] });
        toast.success('Pickup location created successfully');
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create pickup location';
        toast.error(errorMessage);
      },
    });
  };

  /**
   * Update an existing pickup location
   * @returns {Object} React Query mutation object
   */
  const updateLocation = () => {
    return useMutation({
      mutationFn: async ({ id, data }) => {
        const response = await pickupLocationApi.updateLocation(id, data);
        return response?.data?.data?.location || response?.data?.location;
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['pickupLocations'] });
        queryClient.invalidateQueries({ queryKey: ['pickupLocation', variables.id] });
        toast.success('Pickup location updated successfully');
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update pickup location';
        toast.error(errorMessage);
      },
    });
  };

  /**
   * Delete a pickup location
   * @returns {Object} React Query mutation object
   */
  const deleteLocation = () => {
    return useMutation({
      mutationFn: async (id) => {
        await pickupLocationApi.deleteLocation(id);
        return id;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pickupLocations'] });
        toast.success('Pickup location deleted successfully');
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete pickup location';
        toast.error(errorMessage);
      },
    });
  };

  /**
   * Set a location as the default pickup location
   * @returns {Object} React Query mutation object
   */
  const setDefaultLocation = () => {
    return useMutation({
      mutationFn: async (id) => {
        const response = await pickupLocationApi.setDefaultLocation(id);
        return response?.data?.data?.location || response?.data?.location;
      },
      onSuccess: (data, id) => {
        queryClient.invalidateQueries({ queryKey: ['pickupLocations'] });
        queryClient.invalidateQueries({ queryKey: ['pickupLocation', id] });
        toast.success('Default pickup location updated');
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to set default location';
        toast.error(errorMessage);
      },
    });
  };

  return {
    getLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
    setDefaultLocation,
  };
};

export default usePickupLocations;

